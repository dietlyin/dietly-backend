const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { applyPartnership, getApplications, updateApplication } = require('../controllers/gymPartnershipController');

router.post('/apply', [
  body('gymName').trim().notEmpty().withMessage('Gym name is required').isLength({ max: 200 }),
  body('ownerName').trim().notEmpty().withMessage('Owner name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').matches(/^[+]?[\d\s-]{7,15}$/).withMessage('Valid phone number is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('memberCount').optional().isInt({ min: 1 }).withMessage('Member count must be at least 1'),
  body('message').optional().trim().isLength({ max: 2000 }),
], validate, applyPartnership);

router.get('/', protect, authorize('admin'), getApplications);
router.put('/:id', protect, authorize('admin'), updateApplication);

module.exports = router;
