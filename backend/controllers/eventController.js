// backend/controllers/eventController.js
import Event from '../models/Event.js';

/**
 * @desc    Get complete Event details including subdocuments
 * @route   GET /api/v1/events/:id
 */
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('bookedVendors.vendor') // Deep populates vendor profile details
      .populate('organiser', 'name email');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Push a new item dynamically to a specified event sub-array
 * @route   POST /api/v1/events/:id/:subresource (where subresource = guests, bookedVendors, or expenses)
 */
export const addSubresourceItem = async (req, res) => {
  const { id, subresource } = req.params;
  const validResources = ['guests', 'bookedVendors', 'expenses'];

  if (!validResources.includes(subresource)) {
    return res.status(400).json({ success: false, message: 'Invalid subresource path' });
  }

  try {
    // Dynamically appends data payload to the targeted array list
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $push: { [subresource]: req.body } },
      { new: true, runValidators: true }
    ).populate('bookedVendors.vendor');

    res.status(201).json({ success: true, data: updatedEvent[subresource] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};