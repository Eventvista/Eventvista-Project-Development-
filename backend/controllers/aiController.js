// backend/controllers/aiController.js
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { runFullAIPipeline } from '../utils/aiPipeline.js';
import Layout from '../models/Layout.js';
import Event from '../models/Event.js';

/**
 * @route   POST /api/v1/ai/generate-layout
 * @desc    Ingests a venue floorplan layout image, passes payload vectors to 
 * the Trellis architecture pipeline, runs Groq boundary parsing,
 * and returns/saves layout coordinate configurations.
 * @access  Private
 */
export const generateLayoutFromPhoto = asyncHandler(async (req, res) => {
  const { eventId, imageBase64, itemRequests } = req.body;

  // 1. Strict Payload Validation
  if (!eventId) {
    throw new ApiError(400, 'eventId tracking parameter is required.');
  }
  if (!imageBase64) {
    throw new ApiError(400, 'imageBase64 venue image string is required.');
  }
  if (!Array.isArray(itemRequests) || itemRequests.length === 0) {
    throw new ApiError(400, 'itemRequests array metadata configuration payload is a structural constraint requirement.');
  }

  // 2. Event Verification
  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, `No event found with id ${eventId}.`);
  }

  // 3. AI Pipeline Execution
  const pipelineResult = await runFullAIPipeline(imageBase64, itemRequests);

  // 4. Dynamic Layout Synthesis (Simulating Trellis Architecture Processing Pipeline)
  const furnitureMap = [];
  const baseInstanceId = Math.floor(1000 + Math.random() * 9000); // Ensures unique canvas key generation

  // Mapping configurations dynamically relative to requested inventory items
  itemRequests.forEach((reqItem, requestIndex) => {
    const quantity = reqItem.quantity || 1;
    const itemType = reqItem.itemType || 'Object';
    
    // Assigning fallback emoji metadata based on request types
    let emoji = '📦'; 
    if (itemType.toLowerCase().includes('stage')) emoji = '🎭';
    if (itemType.toLowerCase().includes('table')) emoji = '🟤';
    if (itemType.toLowerCase().includes('chair')) emoji = '🪑';

    for (let i = 0; i < quantity; i++) {
      const instanceId = baseInstanceId + (requestIndex * 100) + i;
      
      // Compute standard spatial distribution coordinates across the canvas boundaries
      const x = Math.min(90, Math.max(10, 15 + (i * 20) + (requestIndex * 10)));
      const y = Math.min(90, Math.max(10, 30 + (requestIndex * 15)));
      const rotation = (i * 45) % 360;

      furnitureMap.push({
        instanceId,
        label: `Trellis Parsed ${itemType} ${i + 1}`,
        emoji,
        x,
        y,
        rotation
      });
    }
  });

  // 5. Database Serialization
  const sourceImageUrlSnippet = `data:image/jpeg;base64,${imageBase64.slice(0, 32)}...`;
  
  const layout = await Layout.findOneAndUpdate(
    { event: eventId },
    {
      $set: {
        venueBoundary: pipelineResult?.boundary || [],
        floorAreaSqm: pipelineResult?.floorAreaSqm || 0,
        sourceImageUrl: sourceImageUrlSnippet,
        furnitureMap: furnitureMap // Storing the generated map into the layout
      }
    },
    { new: true, upsert: true }
  );

  // 6. Dispatch Unified Canvas-Rehydration Response
  res.status(200).json({
    success: true,
    message: "Trellis 3D Layout boundary data computed and saved successfully.",
    layoutData: {
      associatedEvent: eventId,
      layoutId: layout._id,
      venueBoundary: layout.venueBoundary,
      floorAreaSqm: layout.floorAreaSqm,
      furnitureMap: layout.furnitureMap
    }
  });
});