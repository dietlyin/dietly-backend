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
    body('customerName').trim().notEmpty().withMessage('Customer name is required').isLength({ max: 100 }),
    body('phone').matches(/^[+]?[\d\s-]{10,15}$/).withMessage('Valid phone number is required'),
    body('addressText').trim().notEmpty().withMessage('Address text is required').isLength({ max: 300 }),
    body('quantity').optional().isInt({ min: 1, max: 30 }).withMessage('Quantity must be between 1 and 30'),
    body('deliveryAddress.city').trim().notEmpty().withMessage('City is required'),
    body('deliveryAddress.state').trim().notEmpty().withMessage('State is required'),
    body('deliveryAddress.pincode').matches(/^\d{6}$/).withMessage('Invalid pincode'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be valid'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be valid'),
  ], validate, createOrder);

router.route('/:id')
  .get(protect, getOrder);

router.put('/:id/status', protect, authorize('admin'), [
  body('status').isIn(['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),
], validate, updateOrderStatus);

router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
