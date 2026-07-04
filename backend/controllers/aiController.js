import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { runFullAIPipeline } from '../utils/aiPipeline.js';
import Layout from '../models/Layout.js';
import Event from '../models/Event.js';

/**
 * @route   POST /api/v1/ai/generate-layout
 * @desc    Accepts a venue photo plus a list of requested furniture/vendor
 *          items, runs the Groq boundary parse and TRELLIS 3D generation,
 *          and writes the result directly into a new Layout document.
 * @access  Private
 */
export const generateLayoutFromPhoto = asyncHandler(async (req, res) => {
  const { eventId, imageBase64, itemRequests } = req.body;

  if (!eventId) throw new ApiError(400, 'eventId is required.');
  if (!imageBase64) throw new ApiError(400, 'imageBase64 is required.');
  if (!Array.isArray(itemRequests) || itemRequests.length === 0) {
    throw new ApiError(400, 'itemRequests must be a non-empty array of { objectId, description }.');
  }

  const event = await Event.findById(eventId);
  if (!event) throw new ApiError(404, `No event found with id ${eventId}.`);

  const pipelineResult = await runFullAIPipeline(imageBase64, itemRequests);

  const layout = await Layout.findOneAndUpdate(
    { event: eventId },
    {
      $set: {
        venueBoundary: pipelineResult.boundary,
        floorAreaSqm: pipelineResult.floorAreaSqm,
        sourceImageUrl: `data:image/jpeg;base64,${imageBase64.slice(0, 32)}...[truncated]`,
        objects: pipelineResult.objects.map((obj) => ({
          objectId: obj.objectId,
          label: obj.description,
          modelUrl: obj.modelUrl,
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          collisionRadius: 0.5,
        })),
        'aiGenerationMeta.groqModel': process.env.GROQ_MODEL,
        'aiGenerationMeta.generatedAt': new Date(),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  event.layout = layout._id;
  await event.save();

  const failedItems = pipelineResult.objects.filter((o) => o.generationFailed);

  res.status(201).json({
    success: true,
    data: layout,
    warnings: failedItems.length > 0 ? { failedItems } : undefined,
  });
});
