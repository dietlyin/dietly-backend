const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protectDeliveryAgent } = require('../middleware/deliveryAuth');
const {
  loginDeliveryAgent,
  getDeliveryMe,
  getAssignedOrders,
  updateDeliveryOrderStatus,
} = require('../controllers/deliveryController');

router.post('/login', [
  body('identifier').trim().notEmpty().withMessage('Phone number or email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, loginDeliveryAgent);

router.get('/me', protectDeliveryAgent, getDeliveryMe);
router.get('/orders', protectDeliveryAgent, getAssignedOrders);

router.patch('/order-status', protectDeliveryAgent, [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('status').isIn(['out-for-delivery', 'delivered']).withMessage('Invalid delivery status'),
], validate, updateDeliveryOrderStatus);

module.exports = router;