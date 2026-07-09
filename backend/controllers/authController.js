// backend/controllers/authController.js
import admin from "../config/firebase.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.js"; 
import Vendor from "../models/Vendor.js"; 
import jwt from 'jsonwebtoken';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

/**
 * Verifies active OAuth credentials and separates new accounts from returning users.
 */
export const verifyTokenHandler = asyncHandler(async (req, res) => {
  if (req.user) {
    const token = signToken(req.user._id);
    return res.status(200).json({
      success: true,
      isNewUser: false,
      data: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
      token,
    });
  }
  
  return res.status(200).json({
    success: true,
    isNewUser: true,
    email: req.firebaseEmail,
    firebaseUid: req.firebaseUid
  });
});

/**
 * Saves specific role attributes and configurations during onboarding initialization.
 */
export const completeProfile = asyncHandler(async (req, res) => {
  const { name, role, businessName } = req.body;
  if (!role) throw new ApiError(400, "An explicit role is required.");
  
  const allowedRoles = ["organiser", "vendor"];
  if (!allowedRoles.includes(role)) throw new ApiError(400, "Unsupported platform assignment role.");
  
  if (role === "vendor" && !businessName) {
    throw new ApiError(400, "Vendors must provide an active commercial trade name.");
  }

  let user = await User.findOne({ firebaseUid: req.firebaseUid });
  if (user) throw new ApiError(400, "Profile mapping vectors are already established.");

  user = await User.create({
    name: name || req.firebaseEmail.split('@')[0],
    email: req.firebaseEmail,
    firebaseUid: req.firebaseUid,
    role
  });

  if (role === "vendor") {
    await Vendor.create({
      owner: user._id,
      businessName,
      category: "other"
    });
  }

  const token = signToken(user._id);
  res.status(201).json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
    token
  });
});

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, businessName } = req.body;
  if (!email || !password || !name || !role) {
    throw new ApiError(400, "Primary fields are required.");
  }

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email registration conflict detected.');

  let firebaseUser;
  try {
    firebaseUser = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    await admin.auth().setCustomUserClaims(firebaseUser.uid, { role });

    const user = await User.create({
      name,
      email,
      password,
      role,
      firebaseUid: firebaseUser.uid
    });

    if (role === "vendor") {
      if (!businessName) throw new ApiError(400, "Missing commercial name context mapping.");
      await Vendor.create({ owner: user._id, businessName, category: "other" });
    }

    const token = signToken(user._id);
    res.status(201).json({ success: true, data: user, token });
  } catch (error) {
    if (firebaseUser?.uid) await admin.auth().deleteUser(firebaseUser.uid);
    throw new ApiError(400, error.message || "Native registration stack fault.");
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid authentication entries.');
  }
  const token = signToken(user._id);
  res.status(200).json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});