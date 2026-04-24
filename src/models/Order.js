const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: [true, 'Plan is required'],
  },
  meals: [{
    meal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal',
    },
    date: Date,
    mealTime: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    },
  }],
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  customerName: {
    type: String,
    trim: true,
  },
  customerPhone: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentId: String,
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  addressText: {
    type: String,
    trim: true,
  },
  latitude: Number,
  longitude: Number,
  deliveryLocation: {
    lat: Number,
    lng: Number,
  },
  deliverySlot: {
    type: String,
  },
  orderDetails: {
    mealPlanName: String,
    quantity: {
      type: Number,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    specialInstructions: {
      type: String,
      maxlength: [500, 'Special instructions cannot exceed 500 characters'],
    },
  },
  assignedDeliveryAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryAgent',
  },
  deliveredAt: Date,
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
  },
}, {
  timestamps: true,
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ assignedDeliveryAgent: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
