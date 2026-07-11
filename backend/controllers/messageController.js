// backend/controllers/messageController.js
import Message from '../models/Message.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

export const getMessagesByEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  if (!eventId) throw new ApiError(400, 'Tracking context eventId is required.');
  
  const messages = await Message.find({ event: eventId }).sort({ createdAt: 1 });
  res.status(200).json({ success: true, data: messages });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { eventId, text, recipientName, imageUrl } = req.body;
  if (!eventId || !text || !recipientName) {
    throw new ApiError(400, 'Missing message serialization tracking variables.');
  }

  const message = await Message.create({
    event: eventId,
    sender: req.user._id,
    recipientName,
    text,
    imageUrl,
  });

  res.status(201).json({ success: true, data: message });
});