const jwt = require('jsonwebtoken');
const DeliveryAgent = require('../models/DeliveryAgent');

const protectDeliveryAgent = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized — no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'delivery_agent') {
      return res.status(403).json({ success: false, message: 'Delivery agent access only' });
    }

    const deliveryAgent = await DeliveryAgent.findById(decoded.id);
    if (!deliveryAgent || !deliveryAgent.isActive) {
      return res.status(401).json({ success: false, message: 'Delivery agent account is unavailable' });
    }

    req.deliveryAgent = deliveryAgent;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized — invalid token' });
  }
};

module.exports = { protectDeliveryAgent };