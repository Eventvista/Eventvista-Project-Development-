// backend/models/Event.js
import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    organiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 150,
    },
    eventType: {
      type: String,
      enum: ['wedding', 'corporate', 'birthday', 'conference', 'exhibition', 'other'],
      default: 'other',
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    guestCount: {
      type: Number,
      min: 1,
      required: true,
    },
    venuePhotoUrl: {
      type: String, // Source image used as the AI boundary-parsing input
      default: null,
    },
    bookedVendors: [
      {
        vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
        status: {
          type: String,
          enum: ['pending', 'confirmed', 'cancelled'],
          default: 'pending',
        },
      },
    ],
    layout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Layout',
      default: null,
    },
    budget: {
      total: { type: Number, min: 0, default: 0 },
      spent: { type: Number, min: 0, default: 0 },
    },
  },
  { timestamps: true }
);

eventSchema.index({ organiser: 1, date: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
