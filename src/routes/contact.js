const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const { submitContact, getContacts, updateContact } = require('../controllers/contactController');

router.route('/')
  .post([
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('subject').optional().trim().isLength({ max: 200 }),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }),
  ], validate, submitContact)
  .get(protect, authorize('admin'), getContacts);

router.put('/:id', protect, authorize('admin'), updateContact);

module.exports = router;
