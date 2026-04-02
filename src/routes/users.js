const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { getProfile, updateProfile, changePassword, getUsers } = require('../controllers/userController');

// Admin — all users
router.get('/', protect, authorize('admin'), getUsers);

// User — own profile
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, [
    body('name').optional().trim().isLength({ max: 100 }),
    body('phone').optional().matches(/^[+]?[\d\s-]{7,15}$/).withMessage('Invalid phone number'),
    body('fitnessGoal').optional().isIn(['weight-loss', 'muscle-gain', 'maintenance', 'general-fitness']),
  ], validate, updateProfile);

router.put('/password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], validate, changePassword);

module.exports = router;
