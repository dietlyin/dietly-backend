const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Meal name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['weight-loss', 'muscle-gain', 'keto', 'balanced'],
  },
  calories: {
    type: Number,
    required: [true, 'Calories are required'],
    min: [0, 'Calories cannot be negative'],
  },
  protein: {
    type: String,
    required: true,
  },
  carbs: {
    type: String,
    required: true,
  },
  fat: {
    type: String,
    required: true,
  },
  emoji: {
    type: String,
    default: '🍽️',
  },
  image: {
    type: String,
  },
  tag: {
    type: String,
    trim: true,
  },
  tagColor: {
    type: String,
    default: 'green',
  },
  ingredients: [{
    type: String,
  }],
  isVegetarian: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

mealSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Meal', mealSchema);
