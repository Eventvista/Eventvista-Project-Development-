// backend/controllers/authController.js
/**
 * @file backend/controllers/authController.js
 * @description Authentication Controller for Eventvista. Governs the complete user identity lifecycle,
 * bridging Firebase Auth (Identity Provider) with MongoDB (Single Source of Truth for Business State).
 */

import admin from "../config/firebase.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import jwt from 'jsonwebtoken';

// =========================================================================
// SECTION 1: UTILITY HELPER & CONSTANTS
// =========================================================================

/**
 * Explicit array containing designated project collaborator emails.
 * These emails will automatically bypass standard role assignments and be 
 * granted elevated "admin" privileges upon registration or profile completion.
 */
const COLLABORATOR_ADMINS = [
  "kariukilewis04@gmail.com",
  "johnsimonwafula@gmail.com",
  "muttasheky@gmail.com",
  "giddyoseko35@gmail.com"
];

/**
 * @function signToken
 * @private
 * @description Generates a signed, stateless Application-level JWT for downstream API guard authorization.
 * @param {string} id - The master MongoDB unique User Object ID (_id).
 * @returns {string} Signed JWT token.
 */
const signToken = (id) =>
  jwt.sign(
    { id }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// =========================================================================
// SECTION 2: FIREBASE / OAUTH TOKEN VERIFICATION HANDSHAKE
// =========================================================================

export const verifyTokenHandler = asyncHandler(async (req, res) => {
  if (req.user) {
    const token = signToken(req.user._id);
    return res.status(200).json({
      success: true,
      isNewUser: false,
      data: { 
        id: req.user._id, 
        name: req.user.name, 
        email: req.user.email, 
        role: req.user.role 
      },
      token,
    });
  }

  return res.status(200).json({
    success: true,
    isNewUser: true,
    email: req.firebaseEmail,
    firebaseUid: req.firebaseUid,
  });
});

// =========================================================================
// SECTION 3: SOCIAL SIGN-IN ONBOARDING PROFILE COMPLETION
// =========================================================================

export const completeProfile = asyncHandler(async (req, res) => {
  const { name, businessName } = req.body;
  const email = req.firebaseEmail.toLowerCase();
  
  // 1. Dynamic Role Promotion (Admin Scaling)
  let assignedRole = req.body.role;
  if (COLLABORATOR_ADMINS.includes(email)) {
    assignedRole = "admin";
  }

  // 2. Structural Parameter Validations
  if (!assignedRole) throw new ApiError(400, "An explicit system platform role assignment is required.");

  const allowedRoles = ["organiser", "vendor", "admin"];
  if (!allowedRoles.includes(assignedRole)) {
    throw new ApiError(400, "Unsupported platform assignment role type specified.");
  }

  if (assignedRole === "vendor" && !businessName) {
    throw new ApiError(400, "Vendors must provide an active commercial business trade name.");
  }

  try {
    // 3. Database Ingestion using Upsert Engine to prevent duplication collisions
    const user = await User.findOneAndUpdate(
      { firebaseUid: req.firebaseUid },
      { 
        name: name || req.firebaseEmail.split('@')[0],
        email: email,
        role: assignedRole,
      },
      { new: true, upsert: true, runValidators: true }
    );

    // 4. Dependent Domain Collection Partitioning (Upsert for Vendors)
    if (assignedRole === "vendor") {
      await Vendor.findOneAndUpdate(
        { owner: user._id },
        { businessName, category: "other" },
        { new: true, upsert: true, runValidators: true }
      );
    }

    // 5. Issue Master System Application Token
    const token = signToken(user._id);
    res.status(200).json({
      success: true,
      data: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      token,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(400, "Duplicate value for unique field: email.");
    }
    throw new ApiError(500, error.message || "Profile completion failed.");
  }
});

// =========================================================================
// SECTION 4: NATIVE EMAIL / PASSWORD AUTHENTICATION SUITE
// =========================================================================

export const registerUser = asyncHandler(async (req, res) => {
  const { name, password, businessName } = req.body;
  const email = req.body.email ? req.body.email.toLowerCase() : null;
  
  // 1. Dynamic Role Promotion (Admin Scaling for Native Auth)
  let assignedRole = req.body.role;
  if (email && COLLABORATOR_ADMINS.includes(email)) {
    assignedRole = "admin";
  }
  
  // 2. Strict Form Field Presence Assessment
  if (!email || !password || !name || !assignedRole) {
    throw new ApiError(400, "Name, email, password, and role are all absolute compilation requirements.");
  }

  // 3. Local Database State Collision Check
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "An account with this email infrastructure registration already exists.");

  let firebaseUser;
  try {
    // 4. Mirror account creation into the Firebase engine
    firebaseUser = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Enforce authorization custom identity claims inside the token metadata
    await admin.auth().setCustomUserClaims(firebaseUser.uid, { role: assignedRole });

    // 5. Local record instantiation
    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      firebaseUid: firebaseUser.uid,
    });

    // 6. Dependent Vendor Allocation Guard
    if (assignedRole === "vendor") {
      if (!businessName) throw new ApiError(400, "Vendors must supply a valid commercial trade name context mapping.");
      await Vendor.create({ 
        owner: user._id, 
        businessName, 
        category: "other" 
      });
    }

    // 7. Output Clean Session Execution Token
    const token = signToken(user._id);
    res.status(201).json({
      success: true,
      data: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      token,
    });
  } catch (error) {
    // FAIL-SAFE ROLLBACK: Synchronize systems by pruning orphaned Firebase records on failure
    if (firebaseUser?.uid) {
      await admin.auth().deleteUser(firebaseUser.uid).catch(() => {});
    }
    
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, error.message || "Native authentication registration stack fault.");
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password fields are both required.');

  // Explicitly fetch the password property 
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  // Safely verify the password
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid authentication credentials provided.');
  }

  const token = signToken(user._id);
  res.status(200).json({
    success: true,
    data: { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role 
    },
    token,
  });
});

// =========================================================================
// SECTION 5: ACCOUNT METADATA SYNC
// =========================================================================

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({ 
    success: true, 
    data: req.user 
  });
});