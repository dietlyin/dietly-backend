const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  icon: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: [true, 'Stat value is required'],
  },
  suffix: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    required: [true, 'Label is required'],
    trim: true,
  },
  color: {
    type: String,
    default: 'brand-green',
  },
  decimals: {
    type: Number,
    default: 0,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Stat', statSchema);
