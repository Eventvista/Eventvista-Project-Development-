import mongoose from 'mongoose';
import Layout from '../models/Layout.js';
import Event from '../models/Event.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Normalises a raw R3F object entry (as emitted by useLayoutStore's
 * serialisation step) into the shape expected by the Layout schema.
 * This is the boundary between "canvas space" (Three.js Vector3 instances,
 * which are not directly JSON-serialisable) and "database space" (plain
 * numeric objects).
 */
const normaliseCanvasObject = (raw) => {
  const toPlainVector = (v, fallback) => {
    if (!v) return fallback;
    // Handles both plain {x,y,z} objects and Three.js Vector3 instances,
    // which expose the same x/y/z properties but are class instances.
    return { x: Number(v.x) || 0, y: Number(v.y) || 0, z: Number(v.z) || 0 };
  };

  return {
    objectId: raw.objectId,
    vendor: raw.vendorId || null,
    label: raw.label,
    category: raw.category || 'other',
    modelUrl: raw.modelUrl || null,
    position: toPlainVector(raw.position, { x: 0, y: 0, z: 0 }),
    rotation: toPlainVector(raw.rotation, { x: 0, y: 0, z: 0 }),
    scale: toPlainVector(raw.scale, { x: 1, y: 1, z: 1 }),
    collisionRadius: Number(raw.collisionRadius) || 0.5,
    locked: Boolean(raw.locked),
  };
};

/**
 * @route   POST /api/v1/layouts
 * @desc    Create the initial layout document for an event, typically
 *          seeded from the AI pipeline's boundary + object output.
 * @access  Private
 */
export const createLayout = asyncHandler(async (req, res) => {
  const { eventId, venueBoundary = [], floorAreaSqm = 0, objects = [], sourceImageUrl = null } = req.body;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, 'A valid eventId is required to create a layout.');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, `No event found with id ${eventId}.`);
  }

  const existing = await Layout.findOne({ event: eventId });
  if (existing) {
    throw new ApiError(409, 'A layout already exists for this event. Use the update endpoint instead.');
  }

  const layout = await Layout.create({
    event: eventId,
    venueBoundary,
    floorAreaSqm,
    sourceImageUrl,
    objects: objects.map(normaliseCanvasObject),
  });

  event.layout = layout._id;
  await event.save();

  res.status(201).json({ success: true, data: layout });
});

/**
 * @route   GET /api/v1/layouts/:eventId
 * @desc    Fetch the full layout array state for hydrating the R3F canvas.
 * @access  Private
 */
export const getLayoutByEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new ApiError(400, 'A valid eventId is required.');
  }

  const layout = await Layout.findOne({ event: eventId }).populate('objects.vendor', 'businessName category');

  if (!layout) {
    throw new ApiError(404, `No layout found for event ${eventId}.`);
  }

  res.status(200).json({ success: true, data: layout });
});

/**
 * @route   PUT /api/v1/layouts/:id
 * @desc    Bulk-overwrite the layout with the current in-memory canvas
 *          state pushed from useLayoutStore on save. Runs an optional
 *          server-side collision re-check as a defence-in-depth measure
 *          against a stale or tampered client state.
 * @access  Private
 */
export const updateLayout = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { venueBoundary, floorAreaSqm, objects, expectedRevision } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'A valid layout id is required.');
  }

  const layout = await Layout.findById(id);
  if (!layout) {
    throw new ApiError(404, `No layout found with id ${id}.`);
  }

  // Optimistic concurrency check: reject stale saves from a client that
  // hasn't seen another user's more recent edit.
  if (expectedRevision !== undefined && expectedRevision !== layout.revision) {
    throw new ApiError(
      409,
      `Layout has been modified since it was last fetched (server revision ${layout.revision}).`
    );
  }

  if (Array.isArray(objects)) {
    const normalisedObjects = objects.map(normaliseCanvasObject);
    const collisions = detectCollisions(normalisedObjects);

    if (collisions.length > 0) {
      throw new ApiError(
        422,
        'Layout rejected: overlapping objects detected on the server-side collision check.',
        true,
        { collisions }
      );
    }

    layout.objects = normalisedObjects;
  }

  if (Array.isArray(venueBoundary)) {
    layout.venueBoundary = venueBoundary;
  }

  if (floorAreaSqm !== undefined) {
    layout.floorAreaSqm = floorAreaSqm;
  }

  layout.revision += 1;
  await layout.save();

  res.status(200).json({ success: true, data: layout });
});

/**
 * @route   DELETE /api/v1/layouts/:id
 * @access  Private
 */
export const deleteLayout = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'A valid layout id is required.');
  }

  const layout = await Layout.findByIdAndDelete(id);
  if (!layout) {
    throw new ApiError(404, `No layout found with id ${id}.`);
  }

  await Event.findOneAndUpdate({ layout: id }, { $set: { layout: null } });

  res.status(200).json({ success: true, message: 'Layout deleted successfully.' });
});

/**
 * Server-side bounding-sphere collision check, mirroring the client-side
 * logic in useLayoutStore. Runs in O(n^2) over the object list, which is
 * acceptable for typical event layouts (tens to low hundreds of items).
 *
 * @param {Array} objects - normalised layout objects with position + collisionRadius
 * @returns {Array<{a: string, b: string, overlap: number}>}
 */
const detectCollisions = (objects) => {
  const collisions = [];

  for (let i = 0; i < objects.length; i += 1) {
    for (let j = i + 1; j < objects.length; j += 1) {
      const a = objects[i];
      const b = objects[j];

      if (a.locked && b.locked) continue; // Two fixed items were pre-approved

      const dx = a.position.x - b.position.x;
      const dz = a.position.z - b.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      const minDistance = a.collisionRadius + b.collisionRadius;

      if (distance < minDistance) {
        collisions.push({
          a: a.objectId,
          b: b.objectId,
          overlap: Number((minDistance - distance).toFixed(3)),
        });
      }
    }
  }

  return collisions;
};
