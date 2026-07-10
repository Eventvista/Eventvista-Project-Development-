// backend/controllers/aiController.js
/**
 * @file backend/controllers/aiController.js
 * @description Core AI Controller for Eventvista. Synthesizes spatial boundary parsing,
 * 3D Trellis layout creation, onboarding parameter optimization, and real-time LLM planning.
 * Anchored directly to MongoDB as the Single Source of Truth (SSOT).
 */

import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { runFullAIPipeline } from '../utils/aiPipeline.js';
import Layout from '../models/Layout.js';
import Event from '../models/Event.js';
import axios from 'axios';

// =========================================================================
// SECTION 1: CENTRALIZED INTERPRETATION UTILITY (GROQ INTEGRATION)
// =========================================================================

/**
 * @function callGroq
 * @private
 * @description Shared Groq chat-completions engine. Centralizes error boundaries,
 * timeouts, and model orchestration so adjustments to infrastructure live in a single place.
 * @param {Object} params
 * @param {string} params.system - The persona or formatting blueprint for the model.
 * @param {string} params.user - Contextual prompt or payload dataset.
 * @param {boolean} params.jsonMode - If true, enforces strict JSON serialization response.
 * @returns {Promise<string>} Raw string or serialized stringified JSON content from the LLM.
 */
async function callGroq({ system, user, jsonMode }) {
  try {
    const response = await axios.post(
      process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions',
      {
        // FIX: Enforces a scalable general-purpose model definition matching the 2026 stack.
        // Falls back safely if the environment variable hasn't propagated.
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
        temperature: 0.2,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      },
      {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
        timeout: 20000, // Balanced constraint preventing upstream thread pooling
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) throw new ApiError(502, 'Groq returned an empty or un-parsable response payload.');
    return content;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, `AI Infrastructure Handshake Failed: ${error.message}`);
  }
}

// =========================================================================
// SECTION 2: 3D CANVASES & VISUAL ASSET LAYOUT GENERATION
// =========================================================================

/**
 * @route   POST /api/v1/ai/generate-layout
 * @desc    Ingests a venue floorplan snapshot, maps pipeline space vectors to 
 *          the Trellis architecture pipeline, runs spatial parsing, and updates 
 *          the layout schema record inside MongoDB (SSOT).
 * @access  Private
 */
export const generateLayoutFromPhoto = asyncHandler(async (req, res) => {
  const { eventId, imageBase64, itemRequests } = req.body;

  // 1. Structural Payload Validation
  if (!eventId) throw new ApiError(400, 'eventId tracking parameter is required.');
  if (!imageBase64) throw new ApiError(400, 'imageBase64 venue image string is required.');
  if (!Array.isArray(itemRequests) || itemRequests.length === 0) {
    throw new ApiError(400, 'itemRequests array configuration payload is a structural requirement.');
  }

  // 2. Event Verification
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, `No event found with id ${eventId}.`);

  // 3. FIX: Ownership & Security Handshake Enforcement (Bug #4)
  // Ensures arbitrary clients cannot overwrite third-party canvas states by injecting random event IDs.
  if (String(event.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have administrative permission to modify this event layout.');
  }

  // 4. Raw AI Pipeline Invocation (Hugging Face / Trellis Intermediary)
  const pipelineResult = await runFullAIPipeline(imageBase64, itemRequests);

  // 5. Dynamic Layout Synthesis & Coordinate Configuration Mapping
  const furnitureMap = (pipelineResult.objects || []).map((modelAsset, index) => {
    // Computes progressive spatial placement offsets across the 3D grid system
    const x = 15 + (index * 4);
    const z = 30 + (index * 2);
    
    return {
      objectId: modelAsset.objectId || `uuid-${Math.random().toString(36).substr(2, 9)}`,
      label: modelAsset.description || `AI Item ${index + 1}`,
      category: modelAsset.description?.toLowerCase().includes('chair') ? 'chair' : 'other',
      modelUrl: modelAsset.modelUrl, // Verified dynamic GLTF/GLB file generated via Trellis
      position: { x, y: 0, z },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      collisionRadius: 0.6,
      locked: false,
    };
  });

  // 6. DB Serialization - Committing updates straight to the Master Truth Store
  const sourceImageUrlSnippet = `data:image/jpeg;base64,${imageBase64.slice(0, 50)}...`;
  
  const layout = await Layout.findOneAndUpdate(
    { event: eventId },
    {
      $set: {
        venueBoundary: pipelineResult?.boundary || [],
        floorAreaSqm: pipelineResult?.floorAreaSqm || 0,
        sourceImageUrl: sourceImageUrlSnippet,
        objects: furnitureMap,
      },
    },
    { new: true, upsert: true } // Upsert enforces record persistence regardless of past setup state
  );

  // 7. Dispatch Unified Rehydration Response to Frontend
  res.status(200).json({
    success: true,
    message: "Trellis 3D Layout boundary data computed and saved successfully to database source.",
    layoutData: {
      associatedEvent: eventId,
      layoutId: layout._id,
      venueBoundary: layout.venueBoundary,
      floorAreaSqm: layout.floorAreaSqm,
      objects: layout.objects,
    },
  });
});

// =========================================================================
// SECTION 3: ONBOARDING CONTEXT SYNTHESIS
// =========================================================================

/**
 * @route   POST /api/v1/ai/onboarding-suggestions
 * @desc    Translates open-ended text input into granular parameters 
 *          (budgets, allocations, metrics) using schema contextualization.
 * @access  Private
 */
export const generateOnboardingSuggestions = asyncHandler(async (req, res) => {
  const { description } = req.body;
  if (!description) throw new ApiError(400, 'Free-form descriptive context is required.');

  const systemPrompt = `
You are the Eventvista AI Advisor. Parse the user's event description and return a strict JSON payload. Do not include introductory text or markdown ticks.
Return precisely this format:
{
  "title": "Suggested Name String",
  "eventType": "wedding" | "corporate" | "birthday" | "conference" | "exhibition" | "other",
  "guestCount": Number,
  "budgetTotal": Number,
  "suggestedVendors": ["catering", "decor", "audioVisual", "furniture"],
  "rationales": {
    "guestCount": "Brief rationale text",
    "budget": "Brief rationale text"
  }
}
`.trim();

  // Executing contextual assessment through the unified Groq wrapper
  const content = await callGroq({
    system: systemPrompt,
    user: description,
    jsonMode: true,
  });

  const suggestions = JSON.parse(content);
  
  // Guard Rails: Normalizing data types and catching anomalies before output
  suggestions.guestCount = Math.max(1, Number(suggestions.guestCount) || 50);
  suggestions.budgetTotal = Math.max(0, Number(suggestions.budgetTotal) || 5000);

  res.status(200).json({ success: true, data: suggestions });
});

// =========================================================================
// SECTION 4: LIVE EXPLAINABLE ADVISORY SYSTEM (REAL ENDPOINT FIX)
// =========================================================================

/**
 * @route   POST /api/v1/ai/advisor-plan
 * @desc    FIX: Real execution logic replacing the previous UI mock (Bug #13). 
 *          Queries database boundaries to synthesize dynamic budget, guest count, 
 *          and 3D object numbers into actionable Markdown recommendations, 
 *          persisting output to the Event Document.
 * @access  Private
 */
export const generateAdvisoryPlan = asyncHandler(async (req, res) => {
  const { eventId, prompt } = req.body;
  
  if (!eventId) throw new ApiError(400, 'eventId tracking link parameter is required.');
  if (!prompt) throw new ApiError(400, 'A specific prompt describing execution constraints is required.');

  // 1. Extract context from database records to ensure strict alignment with truth data
  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, `No event found with matching id ${eventId}.`);
  
  // Enforce tenancy boundary mapping
  if (String(event.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have access authorization to query metrics for this event.');
  }

  const layout = await Layout.findOne({ event: eventId });

  // 2. Blueprinting structured output instructions for the generation model
  const systemPrompt = `
You are the Eventvista AI Advisor, an explainable event-planning assistant.
Given the event's stored budget, guest count, and 3D layout object count,
produce a concise advisory plan in Markdown with three sections:
"## Space Allocation Strategy", "## Financial Strategy", and
"## Implementation Sequence". Reference concrete numbers from the context
provided. Do not invent or hallucinate metrics that were not explicitly supplied.
`.trim();

  // 3. Injecting live application metrics directly into the execution prompt context
  const context = `
Event Name: ${event.title}
Event Category Type: ${event.eventType || 'Unspecified Category'}
Target Guest Capacity: ${event.guestCount || 'Unspecified Metric'}
Total Financial Budget Allocated: ${event.budget?.total ?? 'Unspecified'}
Financial Capital Expended So Far: ${event.budget?.spent ?? 0}
Total 3D Objects Embedded in Canvas Layout: ${layout?.objects?.length || 0}
Computed Floor Boundary Surface Area (sqm): ${layout?.floorAreaSqm || 'Canvas boundary not yet generated'}

User Specific Context Requirements: ${prompt}
`.trim();

  // 4. Executing live layout synthesis via LLM engine
  const plan = await callGroq({ system: systemPrompt, user: context, jsonMode: false });

  // 5. Persisting the output into the database (SSOT implementation)
  // This step ensures the Reports engine handles identical data blocks on any cross-device browser rehydration.
  event.latestAdvisoryPlan = {
    prompt,
    plan,
    generatedAt: new Date(),
  };
  await event.save();

  // 6. Return payload dispatch
  res.status(200).json({
    success: true,
    message: "Explainable Advisory Matrix compiled and synchronized with database entry.",
    data: { plan },
  });
});