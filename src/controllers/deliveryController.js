const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const DeliveryAgent = require('../models/DeliveryAgent');

const signDeliveryToken = (deliveryAgent) => jwt.sign(
  { id: deliveryAgent._id, role: deliveryAgent.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE }
);

const normalizePhoneVariants = (rawValue) => {
  const digits = String(rawValue || '').replace(/[^\d+]/g, '');
  const withoutPlus = digits.replace(/^\+/, '');
  const nationalTenDigit = withoutPlus.length === 10 ? withoutPlus : '';

  return [...new Set([
    digits,
    withoutPlus,
    withoutPlus ? `+${withoutPlus}` : '',
    nationalTenDigit ? `91${nationalTenDigit}` : '',
    nationalTenDigit ? `+91${nationalTenDigit}` : '',
  ].filter(Boolean))];
};

const serializeDeliveryAgent = (deliveryAgent) => ({
  id: deliveryAgent._id,
  name: deliveryAgent.name,
  email: deliveryAgent.email,
  phone: deliveryAgent.phone,
  role: deliveryAgent.role,
  vehicleType: deliveryAgent.vehicleType,
  zone: deliveryAgent.zone,
});

exports.loginDeliveryAgent = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const normalizedIdentifier = String(identifier || '').trim();
    const isEmail = normalizedIdentifier.includes('@');

    const deliveryAgent = await DeliveryAgent.findOne(
      isEmail
        ? { email: normalizedIdentifier.toLowerCase() }
        : { phone: { $in: normalizePhoneVariants(normalizedIdentifier) } }
    ).select('+password');

    if (!deliveryAgent || !deliveryAgent.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await deliveryAgent.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    deliveryAgent.lastSeenAt = new Date();
    await deliveryAgent.save();

    res.json({
      success: true,
      token: signDeliveryToken(deliveryAgent),
      data: serializeDeliveryAgent(deliveryAgent),
    });
  } catch (err) {
    next(err);
  }
};

exports.getDeliveryMe = async (req, res) => {
  res.json({
    success: true,
    data: serializeDeliveryAgent(req.deliveryAgent),
  });
};

exports.getAssignedOrders = async (req, res, next) => {
  try {
    const filter = { assignedDeliveryAgent: req.deliveryAgent.id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('plan', 'name price')
      .populate('user', 'name phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateDeliveryOrderStatus = async (req, res, next) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      assignedDeliveryAgent: req.deliveryAgent.id,
    }).populate('plan', 'name price');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Assigned order not found' });
    }

    const transitionMap = {
      pending: ['out-for-delivery'],
      confirmed: ['out-for-delivery'],
      preparing: ['out-for-delivery'],
      'out-for-delivery': ['delivered'],
      delivered: [],
      cancelled: [],
    };

    const nextStatuses = transitionMap[order.status] || [];
    if (!nextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot move order from ${order.status} to ${status}`,
      });
    }

    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};