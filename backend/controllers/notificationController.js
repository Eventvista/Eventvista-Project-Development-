// backend/controllers/notificationController.js
import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @route   GET /api/v1/notifications
 * @desc    Returns the authenticated user's 30 most recent notifications plus
 *          an unread count for the navbar badge. SSOT-sourced from MongoDB —
 *          no client-side caching of read state.
 * @access  Private
 */
export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30);

  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    read: false,
  });

  res.status(200).json({ success: true, data: notifications, unreadCount });
});

/**
 * @route   PUT /api/v1/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );

  if (!notification) throw new ApiError(404, 'Notification not found.');
  res.status(200).json({ success: true, data: notification });
});

/**
 * @route   PUT /api/v1/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  );
  res.status(200).json({ success: true });
});

/**
 * Internal helper — call this from other controllers (guestController on RSVP,
 * eventController on payment recorded, vendorController on confirmation,
 * aiController on a budget/fire-exit warning) rather than writing directly
 * to the model from scattered call sites.
 */
export const createNotification = async ({ userId, type = 'system', message, link = null }) => {
  return Notification.create({ user: userId, type, message, link });
};