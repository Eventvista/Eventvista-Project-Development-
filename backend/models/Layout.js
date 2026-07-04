import mongoose from 'mongoose';

/**
 * A reusable Vector3 sub-schema. _id: false prevents Mongoose from
 * generating a redundant ObjectId for every position/rotation/scale entry.
 */
const vector3Schema = new mongoose.Schema(
  {
    x: { type: Number, required: true, default: 0 },
    y: { type: Number, required: true, default: 0 },
    z: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

/**
 * A single point on the venue floor boundary polygon, expressed in the
 * horizontal (x, z) plane as reconstructed by the Groq boundary-parsing step.
 */
const boundaryPointSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true },
    z: { type: Number, required: true },
  },
  { _id: false }
);

/**
 * A single placeable item on the 3D canvas: a vendor asset, piece of
 * furniture, or decor element positioned by the planner via drag-and-drop.
 */
const layoutObjectSchema = new mongoose.Schema(
  {
    objectId: {
      type: String, // Client-generated UUID, stable across drag/save cycles
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['table', 'chair', 'stage', 'bar', 'decor', 'lighting', 'booth', 'other'],
      default: 'other',
    },
    modelUrl: {
      type: String, // GLB/GLTF asset URL, typically produced by TRELLIS
      default: null,
    },
    position: {
      type: vector3Schema,
      required: true,
    },
    rotation: {
      type: vector3Schema,
      default: () => ({ x: 0, y: 0, z: 0 }),
    },
    scale: {
      type: vector3Schema,
      default: () => ({ x: 1, y: 1, z: 1 }),
    },
    // Bounding-sphere radius (metres) used for the R3F collision field check
    collisionRadius: {
      type: Number,
      required: true,
      min: 0,
      default: 0.5,
    },
    locked: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const layoutSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      unique: true, // One live layout document per event
    },
    venueBoundary: {
      type: [boundaryPointSchema],
      validate: {
        validator: (arr) => arr.length === 0 || arr.length >= 3,
        message: 'venueBoundary must contain at least 3 points to form a valid polygon.',
      },
      default: [],
    },
    floorAreaSqm: {
      type: Number,
      min: 0,
      default: 0,
    },
    objects: {
      type: [layoutObjectSchema],
      default: [],
    },
    sourceImageUrl: {
      type: String,
      default: null,
    },
    // Optimistic concurrency guard for simultaneous multi-user edits
    revision: {
      type: Number,
      default: 0,
    },
    aiGenerationMeta: {
      groqModel: { type: String, default: null },
      trellisJobIds: { type: [String], default: [] },
      generatedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

layoutSchema.pre('findOneAndUpdate', function incrementRevision(next) {
  this.set({ $inc: { revision: 1 } });
  next();
});

const Layout = mongoose.model('Layout', layoutSchema);

export default Layout;
