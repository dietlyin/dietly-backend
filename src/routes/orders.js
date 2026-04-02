const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  createOrder, getMyOrders, getOrder,
  updateOrderStatus, cancelOrder, getAllOrders,
} = require('../controllers/orderController');

// Admin — all orders
router.get('/admin/all', protect, authorize('admin'), getAllOrders);

// User — own orders
router.route('/')
  .get(protect, getMyOrders)
  .post(protect, [
    body('planId').notEmpty().withMessage('Plan ID is required'),
    body('deliveryAddress.pincode').optional().matches(/^\d{6}$/).withMessage('Invalid pincode'),
  ], validate, createOrder);

router.route('/:id')
  .get(protect, getOrder);

router.put('/:id/status', protect, authorize('admin'), [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),
], validate, updateOrderStatus);

router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
