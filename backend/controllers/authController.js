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
// SECTION 1: UTILITY HELPER FUNCTIONS
// =========================================================================

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
// SECTION 2: FIREBASE / OAUTH TOKEN VERIFICATION HANDSHAKE (SSOT ENTRY)
// =========================================================================

/**
 * @route   POST /api/v1/auth/session-verify
 * @desc    SSOT entry point for the Google/Firebase OAuth lifecycle.
 *          Frontend handles client credential sign-in via `signInWithPopup`, retrieves an ID token, 
 *          and sends it as a Bearer string. Pre-routing token verification middleware attaches 
 *          `req.user` if a corresponding MongoDB profile exists.
 * @access  Public (Requires Valid Firebase Authorization Header)
 */
export const verifyTokenHandler = asyncHandler(async (req, res) => {
  // If the user already has a matching profile record inside MongoDB, bypass registration steps
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

  // FIX: Explicitly prevents unauthenticated user enumeration endpoints (e.g., an unauthenticated GET /check-user).
  // If no MongoDB record is linked to this Firebase identity, signal the client to display the role selection step.
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

/**
 * @route   POST /api/v1/auth/complete-profile
 * @desc    Saves specialized role and business data structures for completely new social accounts
 *          immediately following client-side Firebase user creation[cite: 3].
 * @access  Private (Firebase Context Enforced)
 */
export const completeProfile = asyncHandler(async (req, res) => {
  const { name, role, businessName } = req.body;
  
  // 1. Structural Parameter Validations
  if (!role) throw new ApiError(400, "An explicit system platform role assignment is required.");

  const allowedRoles = ["organiser", "vendor"];
  if (!allowedRoles.includes(role)) {
    throw new ApiError(400, "Unsupported platform assignment role type specified.");
  }

  if (role === "vendor" && !businessName) {
    throw new ApiError(400, "Vendors must provide an active commercial business trade name.");
  }

  // 2. Identity Collision Guard
  let user = await User.findOne({ firebaseUid: req.firebaseUid });
  if (user) throw new ApiError(409, "Profile mapping vectors are already established for this identity root.");

  // 3. Database Ingestion (SSOT Record Initialization)
  user = await User.create({
    name: name || req.firebaseEmail.split('@')[0],
    email: req.firebaseEmail,
    firebaseUid: req.firebaseUid,
    role,
  });

  // 4. Dependent Domain Collection Partitioning
  if (role === "vendor") {
    await Vendor.create({
      owner: user._id,
      businessName,
      category: "other",
    });
  }

  // 5. Issue Master System Application Token for immediate session upgrade
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
});

// =========================================================================
// SECTION 4: NATIVE EMAIL / PASSWORD AUTHENTICATION SUITE
// =========================================================================

/**
 * @route   POST /api/v1/auth/register
 * @desc    Registers a traditional email/password user natively. Synchronizes data by 
 *          dual-provisioning the identity entry inside Firebase Admin while generating 
 *          the matching local user entry inside MongoDB[cite: 1, 3].
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, businessName } = req.body;
  
  // 1. Strict Form Field Presence Assessment
  if (!email || !password || !name || !role) {
    throw new ApiError(400, "Name, email, password, and role are all absolute compilation requirements.");
  }

  // 2. Local Database State Collision Check
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "An account with this email infrastructure registration already exists.");

  let firebaseUser;
  try {
    // 3. Mirror account creation into the Firebase engine
    // Keeps Firebase as the centralized identity authority across all authentication pathways.
    firebaseUser = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Enforce authorization custom identity claims inside the token metadata
    await admin.auth().setCustomUserClaims(firebaseUser.uid, { role });

    // 4. FIX: Password Persistence & Schema Safeguarding (Bug #1)
    // Local database records now correctly process the raw password string. The model layer 
    // automatically hashes this string using a pre-save bcrypt hook, and firebaseUid is set to optional/sparse.
    const user = await User.create({
      name,
      email,
      password,
      role,
      firebaseUid: firebaseUser.uid,
    });

    // 5. Dependent Vendor Allocation Guard
    if (role === "vendor") {
      if (!businessName) throw new ApiError(400, "Vendors must supply a valid commercial trade name context mapping[cite: 3].");
      await Vendor.create({ 
        owner: user._id, 
        businessName, 
        category: "other" 
      });
    }

    // 6. Output Clean Session Execution Token
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
    // FAIL-SAFE ROLLBACK: If MongoDB creation fails after Firebase has already provisions the account, 
    // delete the orphaned Firebase record to ensure the two authentication systems remain synchronized[cite: 1].
    if (firebaseUser?.uid) {
      await admin.auth().deleteUser(firebaseUser.uid).catch(() => {});
    }
    
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, error.message || "Native authentication registration stack fault.");
  }
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticates traditional native users. Uses custom database selection methods 
 *          to securely evaluate encrypted passwords without exposing hash signatures by default[cite: 1].
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password fields are both required.');

  // Explicitly fetch the password property (which uses select: false inside User.js for structural safety)[cite: 1]
  const user = await User.findOne({ email }).select('+password');
  
  // Utilize the custom schema method restored in User.js to safely verify the password[cite: 1]
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

/**
 * @route   GET /api/v1/auth/me
 * @desc    Retrieves the authentic master profile model linked to the requesting session[cite: 3].
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({ 
    success: true, 
    data: req.user 
  });
});