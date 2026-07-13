// backend/models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['rsvp', 'payment', 'vendor', 'system', 'ai_alert'],
      default: 'system',
    },
    message: { type: String, required: true, trim: true },
    link: { type: String, default: null }, // e.g. "/events/64f..." for click-through
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);