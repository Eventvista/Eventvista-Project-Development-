// backend/models/Event.js
import mongoose from 'mongoose';

// ==========================================
// 1. SUBDOCUMENT SCHEMAS
// ==========================================

const guestSubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    status: { 
      type: String, 
      enum: ['confirmed', 'pending', 'declined'], 
      default: 'pending' 
    }
  },
  { _id: true } // Keeps an ID for individual guest edits/deletions
);

const bookedVendorSubSchema = new mongoose.Schema(
  {
    // Points to a separate Vendor collection for deep populating details
    vendor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Vendor', 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['confirmed', 'pending', 'declined'], 
      default: 'pending' 
    }
  },
  { _id: true }
);

const expenseSubSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    budgeted: { type: Number, default: 0, min: 0 },
    spent: { type: Number, default: 0, min: 0 }
  },
  { _id: true }
);

// ==========================================
// 2. MAIN EVENT SCHEMA
// ==========================================

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
    
    // Core high-level tracking
    budget: {
      total: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
    },

    // Array Subdocuments wired to UI feature segments
    guests: [guestSubSchema],
    bookedVendors: [bookedVendorSubSchema],
    expenses: [expenseSubSchema]
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model('Event', eventSchema);