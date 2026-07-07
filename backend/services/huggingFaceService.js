// backend/services/huggingFaceService.js
import fetch from 'node-fetch';

/**
 * Communicates directly with Hugging Face TRELLIS API
 */
export const generate3DAssetFromImage = async (imageBuffer) => {
  const apiUrl = process.env.HUGGINGFACE_TRELLIS_URL;
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('Hugging Face configuration is missing in environment variables.');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/octet-stream',
    },
    body: imageBuffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Hugging Face API error [${response.status}]: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};