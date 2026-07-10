// backend/controllers/userController.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'A user with this email already exists.');

  const user = await User.create({ name, email, password, role });
  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    data: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
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

/**
 * @route   GET /api/v1/users
 * @desc    Retrieves all registered platform users.
 * @access  Private (Admin Only)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, data: users });
});

/**
 * @route   PUT /api/v1/users/role
 * @desc    Dynamically mutates a user's role authorization.
 * @access  Private (Admin Only)
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { userId, newRole } = req.body;
  
  if (!['organiser', 'vendor', 'admin'].includes(newRole)) {
    throw new ApiError(400, 'Invalid role assignment provided.');
  }

  const user = await User.findByIdAndUpdate(
    userId, 
    { role: newRole }, 
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) throw new ApiError(404, 'User not found.');

  res.status(200).json({ success: true, data: user });
});