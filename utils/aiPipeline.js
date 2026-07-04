import axios from 'axios';
import ApiError from './ApiError.js';

const GROQ_TIMEOUT_MS = 20000;
const TRELLIS_TIMEOUT_MS = 60000; // 3D generation is slower than text inference
const TRELLIS_POLL_INTERVAL_MS = 3000;
const TRELLIS_MAX_POLLS = 20;

/**
 * System prompt instructing Groq's LLM to act as a computer-vision-style
 * boundary parser. We ask for strict JSON so the response can be parsed
 * deterministically into the Layout.venueBoundary sub-schema.
 */
const BOUNDARY_SYSTEM_PROMPT = `
You are a floor-plan boundary extraction engine for a 3D event-layout tool.
Given a description or visual analysis of a venue photo, return ONLY a JSON
object (no prose, no markdown fences) of the form:
{
  "boundary": [{ "x": number, "z": number }, ...],
  "floorAreaSqm": number
}
The boundary must contain at least 3 points, ordered to form a simple
(non-self-intersecting) polygon, using metres as the unit and the photo's
estimated real-world scale.
`.trim();

/**
 * Sends a base64-encoded venue photo (plus optional context notes) to the
 * Groq chat-completions endpoint and parses the structured JSON boundary
 * response into a format consumable by the Layout model.
 *
 * @param {string} imageBase64 - Base64-encoded JPEG/PNG of the venue.
 * @param {string} [contextNotes] - Optional planner notes (e.g. "L-shaped room").
 * @returns {Promise<{ boundary: {x:number,z:number}[], floorAreaSqm: number }>}
 */
export const parseBoundaryFromImage = async (imageBase64, contextNotes = '') => {
  if (!imageBase64) {
    throw new ApiError(400, 'An image is required for boundary parsing.');
  }

  try {
    const response = await axios.post(
      process.env.GROQ_API_URL,
      {
        model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: BOUNDARY_SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyse this venue photo and extract the floor boundary. Additional context: ${
                  contextNotes || 'none provided'
                }`,
              },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: GROQ_TIMEOUT_MS,
      }
    );

    const rawContent = response.data?.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new ApiError(502, 'Groq returned an empty boundary-parsing response.');
    }

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      throw new ApiError(502, 'Groq returned malformed JSON for the boundary payload.');
    }

    if (!Array.isArray(parsed.boundary) || parsed.boundary.length < 3) {
      throw new ApiError(502, 'Groq boundary response did not contain a valid polygon.');
    }

    return {
      boundary: parsed.boundary.map((p) => ({ x: Number(p.x), z: Number(p.z) })),
      floorAreaSqm: Number(parsed.floorAreaSqm) || 0,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 502;
      const upstreamMessage = error.response?.data?.error?.message || error.message;
      throw new ApiError(status, `Groq boundary-parsing request failed: ${upstreamMessage}`);
    }

    throw new ApiError(500, `Unexpected error during boundary parsing: ${error.message}`);
  }
};

/**
 * Small delay helper used while polling the TRELLIS async inference job.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Submits an object description (and optional reference image) to the
 * Hugging Face-hosted TRELLIS image-to-3D model, then polls until the
 * generated mesh asset is ready. Hugging Face Inference Endpoints for
 * generative 3D models are typically asynchronous, so this function
 * implements a straightforward submit-and-poll handshake.
 *
 * @param {Object} params
 * @param {string} params.description - Text description of the object (e.g. "round banquet table").
 * @param {string} [params.referenceImageBase64] - Optional base64 reference image for image-to-3D mode.
 * @returns {Promise<{ modelUrl: string, jobId: string }>}
 */
export const generate3DModel = async ({ description, referenceImageBase64 = null }) => {
  if (!description) {
    throw new ApiError(400, 'An object description is required for 3D model generation.');
  }

  const headers = {
    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    // Step 1: submit the generation job
    const submission = await axios.post(
      process.env.HUGGINGFACE_TRELLIS_URL,
      {
        inputs: referenceImageBase64
          ? { image: referenceImageBase64, prompt: description }
          : { prompt: description },
        options: { wait_for_model: true },
      },
      { headers, timeout: TRELLIS_TIMEOUT_MS }
    );

    // Hugging Face may return the asset directly, or a job reference that
    // must be polled depending on the endpoint's synchronous/async mode.
    if (submission.data?.modelUrl) {
      return { modelUrl: submission.data.modelUrl, jobId: submission.data.jobId || 'sync' };
    }

    const jobId = submission.data?.jobId;
    if (!jobId) {
      throw new ApiError(502, 'TRELLIS did not return a model URL or a job ID to poll.');
    }

    // Step 2: poll for completion
    for (let attempt = 0; attempt < TRELLIS_MAX_POLLS; attempt += 1) {
      await sleep(TRELLIS_POLL_INTERVAL_MS);

      const statusResponse = await axios.get(
        `${process.env.HUGGINGFACE_TRELLIS_URL}/status/${jobId}`,
        { headers, timeout: TRELLIS_TIMEOUT_MS }
      );

      if (statusResponse.data?.status === 'completed') {
        return { modelUrl: statusResponse.data.modelUrl, jobId };
      }

      if (statusResponse.data?.status === 'failed') {
        throw new ApiError(502, `TRELLIS generation job ${jobId} failed.`);
      }
    }

    throw new ApiError(504, `TRELLIS generation job ${jobId} did not complete in time.`);
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 502;
      const upstreamMessage = error.response?.data?.error || error.message;
      throw new ApiError(status, `Hugging Face TRELLIS request failed: ${upstreamMessage}`);
    }

    throw new ApiError(500, `Unexpected error during 3D model generation: ${error.message}`);
  }
};

/**
 * Convenience orchestrator: parses the venue boundary, then generates a
 * 3D model for every requested furniture/vendor item in parallel.
 *
 * @param {string} imageBase64
 * @param {{ objectId: string, description: string }[]} itemRequests
 */
export const runFullAIPipeline = async (imageBase64, itemRequests = []) => {
  const boundaryResult = await parseBoundaryFromImage(imageBase64);

  const modelResults = await Promise.allSettled(
    itemRequests.map((item) => generate3DModel({ description: item.description }))
  );

  const objects = modelResults.map((result, idx) => ({
    objectId: itemRequests[idx].objectId,
    description: itemRequests[idx].description,
    modelUrl: result.status === 'fulfilled' ? result.value.modelUrl : null,
    generationFailed: result.status === 'rejected',
    failureReason: result.status === 'rejected' ? result.reason.message : null,
  }));

  return { boundary: boundaryResult.boundary, floorAreaSqm: boundaryResult.floorAreaSqm, objects };
};
