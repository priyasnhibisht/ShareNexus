const mongoose = require('mongoose');

// basic user structure
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    course: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    coins: { type: Number, default: 10 },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('User', userSchema);

