// backend/models/Vendor.js
import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['catering', 'decor', 'audioVisual', 'furniture', 'entertainment', 'photography', 'other'],
      required: true,
    },
    description: {
      type: String,
      maxlength: 1500,
    },
    priceRange: {
      min: { type: Number, min: 0, default: 0 },
      max: { type: Number, min: 0, default: 0 },
      currency: { type: String, default: 'GBP' },
    },
    // Reference asset used when this vendor's items are placed in the 3D scene
    default3DModelUrl: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true }
);

vendorSchema.index({ category: 1 });

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;
