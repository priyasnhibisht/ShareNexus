const mongoose = require('mongoose');

// schema for saving items or skills people want to share
const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, enum: ['resource', 'skill'], required: true },
    availability: { type: Boolean, default: true },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerName: { type: String, required: true, trim: true },

    // keep contact hidden normally so we dont leak phone numbers
    ownerContact: { type: String, select: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Listing', listingSchema);

