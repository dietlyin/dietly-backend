const mongoose = require('mongoose');

const gymPartnershipSchema = new mongoose.Schema({
  gymName: {
    type: String,
    required: [true, 'Gym name is required'],
    trim: true,
    maxlength: [200, 'Gym name cannot exceed 200 characters'],
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true,
    maxlength: [100, 'Owner name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true,
    match: [/^[+]?[\d\s-]{7,15}$/, 'Please provide a valid phone number'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  memberCount: {
    type: Number,
    min: [1, 'Member count must be at least 1'],
  },
  message: {
    type: String,
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters'],
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'approved', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('GymPartnership', gymPartnershipSchema);
