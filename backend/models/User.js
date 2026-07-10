// backend/models/User.js
/**
 * @file backend/models/User.js
 * @description Master Database Schema for System Profiles.
 * Operates as the foundation for the Single Source of Truth (SSOT), mapping credentials,
 * authentication origins, role definitions, and access configurations[cite: 1].
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// =========================================================================
// SECTION 1: SCHEMA STRUCTURE DEFINITION
// =========================================================================
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
    // FIX: Restores the password tracking vector (Bug #1)[cite: 1].
    // Necessary to hold credentials used by the native register/login controller.
    // Configured with `select: false` to keep raw hash signatures out of standard queries.
    // This remains completely unassigned for external OAuth (Google) registrations.
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    // FIX: Modified from required to an optional, sparse index configuration (Bug #2)[cite: 1].
    // The previous required constraint broke initialization for native creation pipelines[cite: 1].
    // Utilizing `sparse: true` tells MongoDB to ignore documents missing this value,
    // avoiding unique index clashes across multiple null values.
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
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
  { timestamps: true } // Automatically manages createdAt and updatedAt tracking records
);

// =========================================================================
// SECTION 2: LIFECYCLE HOOKS (PRE-SAVE CRYPTOGRAPHY)
// =========================================================================

/**
 * Pre-Save Middleware Hook
 * @description Automatically hashes plaintext passwords using bcryptjs prior to persistence[cite: 1].
 * Executes exclusively when the password field is present and has been modified.
 */
userSchema.pre('save', async function hashPassword(next) {
  // If the field hasn't changed or isn't assigned (such as Google OAuth users), skip encryption
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// SECTION 3: SCHEMA INSTANCE METHODS
// =========================================================================

/**
 * @method comparePassword
 * @description Evaluates a candidate password against the encrypted hash signature[cite: 1].
 * @param {string} candidate - The unhashed password provided during user login.
 * @returns {Promise<boolean>} True if matching, false otherwise.
 */
userSchema.methods.comparePassword = async function comparePassword(candidate) {
  // Gracefully handles verification requests targeting accounts that use third-party social auth only
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);