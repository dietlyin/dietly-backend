const Order = require('../models/Order');
const Plan = require('../models/Plan');
const User = require('../models/User');
const DeliveryAgent = require('../models/DeliveryAgent');
const { sendPlanEnrollmentWhatsAppNotification } = require('../utils/whatsappNotifier');

const DELIVERY_HUB = {
  lat: 21.117164,
  lng: 79.098231,
};
const FREE_DELIVERY_RADIUS_KM = 2;
const EXTRA_DELIVERY_CHARGE_PER_KM = 10;

const toRadians = (value) => (value * Math.PI) / 180;

const calculateDistanceKm = (origin, destination) => {
  const earthRadiusKm = 6371;
  const latDelta = toRadians(destination.lat - origin.lat);
  const lngDelta = toRadians(destination.lng - origin.lng);

  const a = Math.sin(latDelta / 2) ** 2
    + Math.cos(toRadians(origin.lat))
    * Math.cos(toRadians(destination.lat))
    * Math.sin(lngDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const calculateDeliveryPricing = ({ lat, lng }, planAmount) => {
  const rawDistanceKm = calculateDistanceKm(DELIVERY_HUB, { lat, lng });
  const distanceKm = Number(rawDistanceKm.toFixed(2));
  const extraDistanceKm = Math.max(distanceKm - FREE_DELIVERY_RADIUS_KM, 0);
  const deliveryCharge = extraDistanceKm > 0
    ? Math.ceil(extraDistanceKm) * EXTRA_DELIVERY_CHARGE_PER_KM
    : 0;

  return {
    distanceKm,
    planAmount,
    deliveryCharge,
    totalAmount: planAmount + deliveryCharge,
    freeDeliveryRadiusKm: FREE_DELIVERY_RADIUS_KM,
    isFreeDelivery: deliveryCharge === 0,
  };
};

const normalizeDeliveryLocation = ({ latitude, longitude, deliveryLocation }) => {
  const rawLat = latitude ?? deliveryLocation?.lat;
  const rawLng = longitude ?? deliveryLocation?.lng;

  const lat = Number(rawLat);
  const lng = Number(rawLng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return undefined;
  }

  return { lat, lng };
};

// @desc    Create a new order / subscribe to a plan
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const {
      planId,
      customerName,
      phone,
      addressText,
      deliveryLocationName,
      deliveryAddress,
      deliverySlot,
      notes,
      quantity,
      latitude,
      longitude,
      deliveryLocation,
      orderDetails,
    } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, message: 'Plan not found or inactive' });
    }

    const normalizedLocation = normalizeDeliveryLocation({ latitude, longitude, deliveryLocation });
    if (!normalizedLocation) {
      return res.status(400).json({ success: false, message: 'Delivery location coordinates are required' });
    }

    const assignedDeliveryAgent = await DeliveryAgent.findOne({ isActive: true }).sort({ lastSeenAt: 1, createdAt: 1 });
    const orderQuantity = Math.max(1, parseInt(quantity, 10) || 1);
    const planAmount = plan.price * orderQuantity;
    const pricing = calculateDeliveryPricing(normalizedLocation, planAmount);
    const resolvedCustomerName = String(customerName || req.user.name || '').trim();
    const resolvedCustomerPhone = String(phone || req.user.phone || '').trim();
    const resolvedAddressText = String(addressText || deliveryAddress?.street || '').trim();
    const resolvedLocationName = String(deliveryLocationName || '').trim();

    const order = await Order.create({
      user: req.user.id,
      plan: planId,
      amount: pricing.totalAmount,
      customerName: resolvedCustomerName,
      customerPhone: resolvedCustomerPhone,
      deliveryAddress,
      deliveryLocationName: resolvedLocationName,
      addressText: resolvedAddressText,
      latitude: normalizedLocation.lat,
      longitude: normalizedLocation.lng,
      deliveryLocation: normalizedLocation,
      deliverySlot,
      pricing,
      orderDetails: {
        mealPlanName: plan.name,
        quantity: orderQuantity,
        specialInstructions: orderDetails?.specialInstructions || notes,
      },
      assignedDeliveryAgent: assignedDeliveryAgent?._id,
      notes,
    });

    // Update user subscription status
    await User.findByIdAndUpdate(req.user.id, {
      activePlan: planId,
      subscriptionStatus: 'active',
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      ...(resolvedCustomerPhone ? { phone: resolvedCustomerPhone } : {}),
    });

    const populated = await order.populate([
      'plan',
      'user',
      { path: 'assignedDeliveryAgent', select: 'name phone vehicleType zone' },
    ]);

    // WhatsApp alert is best-effort; order creation must not fail if notification fails.
    sendPlanEnrollmentWhatsAppNotification({
      order: populated,
      user: req.user,
      plan,
    }).catch((notifyError) => {
      console.error('WhatsApp enrollment notification failed:', notifyError.message);
    });

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's orders
// @route   GET /api/orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user.id })
        .populate('plan', 'name price')
        .populate('assignedDeliveryAgent', 'name phone vehicleType')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ user: req.user.id }),
    ]);

    res.json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate([
      'plan',
      'meals.meal',
      { path: 'assignedDeliveryAgent', select: 'name phone vehicleType zone' },
    ]);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Users can only view their own orders, admins can view any
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status (admin only)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel an order (user)
// @route   PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel an order that is ${order.status}` });
    }

    order.status = 'cancelled';
    await order.save();

    // Update user subscription
    await User.findByIdAndUpdate(req.user.id, {
      subscriptionStatus: 'cancelled',
    });

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders/admin/all
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .populate('plan', 'name price')
        .populate('assignedDeliveryAgent', 'name phone vehicleType zone')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};
