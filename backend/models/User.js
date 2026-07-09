// backend/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    firebaseUid: {
      type: String,
      unique: true,
      required: [true, 'Firebase UID is required to maintain SSOT synchronization'],
      index: true,
    },
    role: {
      type: String,
      enum: ['organiser', 'vendor', 'admin'],
      default: 'organiser',
    },
    avatarUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);