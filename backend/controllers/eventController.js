import mongoose from 'mongoose';
import Event from '../models/Event.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({ ...req.body, organiser: req.user._id });
  res.status(201).json({ success: true, data: event });
});

export const getMyEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ organiser: req.user._id }).populate('layout');
  res.status(200).json({ success: true, count: events.length, data: events });
});

export const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, 'Invalid event id.');

  const event = await Event.findById(id).populate('layout').populate('bookedVendors.vendor');
  if (!event) throw new ApiError(404, `No event found with id ${id}.`);

  res.status(200).json({ success: true, data: event });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, 'Invalid event id.');

  const event = await Event.findOneAndUpdate(
    { _id: id, organiser: req.user._id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!event) throw new ApiError(404, 'Event not found or you do not have permission to edit it.');

  res.status(200).json({ success: true, data: event });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, 'Invalid event id.');

  const event = await Event.findOneAndDelete({ _id: id, organiser: req.user._id });
  if (!event) throw new ApiError(404, 'Event not found or you do not have permission to delete it.');

  res.status(200).json({ success: true, message: 'Event deleted successfully.' });
});
