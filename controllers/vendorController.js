import mongoose from 'mongoose';
import Vendor from '../models/Vendor.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.create({ ...req.body, owner: req.user._id });
  res.status(201).json({ success: true, data: vendor });
});

export const listVendors = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = category ? { category } : {};
  const vendors = await Vendor.find(filter).sort({ rating: -1 });
  res.status(200).json({ success: true, count: vendors.length, data: vendors });
});

export const getVendorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, 'Invalid vendor id.');

  const vendor = await Vendor.findById(id);
  if (!vendor) throw new ApiError(404, `No vendor found with id ${id}.`);

  res.status(200).json({ success: true, data: vendor });
});
