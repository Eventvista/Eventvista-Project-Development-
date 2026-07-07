// backend/models/Event.js
import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    organiser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventType: {
      type: String,
      enum: ['wedding', 'corporate', 'birthday', 'conference', 'exhibition', 'other'],
      required: true,
    },
    date: { type: Date, required: true },
    guestCount: { type: Number, required: true, min: 1 },
    venuePhotoUrl: { type: String, default: null },
    layout: { type: mongoose.Schema.Types.ObjectId, ref: 'Layout', default: null },
    budget: {
      total: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model('Event', eventSchema);