// backend/middleware/validateLayout.js
import ApiError from '../utils/ApiError.js';

const MAX_SCENE_BOUND = 500; // metres, sanity ceiling for venue coordinate space

const isFiniteNumber = (n) => typeof n === 'number' && Number.isFinite(n);

const isValidVector3 = (v) =>
  v && isFiniteNumber(v.x) && isFiniteNumber(v.y) && isFiniteNumber(v.z);

const withinSceneBounds = (v) =>
  Math.abs(v.x) <= MAX_SCENE_BOUND &&
  Math.abs(v.y) <= MAX_SCENE_BOUND &&
  Math.abs(v.z) <= MAX_SCENE_BOUND;

/**
 * Validates the shape and numeric sanity of a 3D layout payload before it
 * reaches Mongoose. Rejects NaN/Infinity coordinates, out-of-bounds
 * placements, and malformed object arrays early, with a clear 400 response
 * rather than letting a bad payload silently corrupt the scene graph.
 */
const validateLayout = (req, res, next) => {
  const { venueBoundary, objects } = req.body;

  if (venueBoundary !== undefined) {
    if (!Array.isArray(venueBoundary) || venueBoundary.length < 3) {
      throw new ApiError(400, 'venueBoundary must be an array of at least 3 {x, z} points.');
    }
    venueBoundary.forEach((point, idx) => {
      if (!isFiniteNumber(point.x) || !isFiniteNumber(point.z)) {
        throw new ApiError(400, `venueBoundary point at index ${idx} has non-finite coordinates.`);
      }
    });
  }

  if (objects !== undefined) {
    if (!Array.isArray(objects)) {
      throw new ApiError(400, 'objects must be an array.');
    }

    objects.forEach((obj, idx) => {
      if (!obj.objectId || typeof obj.objectId !== 'string') {
        throw new ApiError(400, `objects[${idx}] is missing a valid objectId.`);
      }

      if (!isValidVector3(obj.position)) {
        throw new ApiError(400, `objects[${idx}].position must be a finite {x, y, z} vector.`);
      }

      if (!withinSceneBounds(obj.position)) {
        throw new ApiError(
          400,
          `objects[${idx}].position exceeds the permitted scene bounds of ±${MAX_SCENE_BOUND}m.`
        );
      }

      if (obj.rotation !== undefined && !isValidVector3(obj.rotation)) {
        throw new ApiError(400, `objects[${idx}].rotation must be a finite {x, y, z} vector.`);
      }

      if (obj.scale !== undefined && !isValidVector3(obj.scale)) {
        throw new ApiError(400, `objects[${idx}].scale must be a finite {x, y, z} vector.`);
      }

      if (
        obj.collisionRadius !== undefined &&
        (!isFiniteNumber(obj.collisionRadius) || obj.collisionRadius < 0)
      ) {
        throw new ApiError(400, `objects[${idx}].collisionRadius must be a non-negative number.`);
      }
    });
  }

  next();
};

export default validateLayout;
