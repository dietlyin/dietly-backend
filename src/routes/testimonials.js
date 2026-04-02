const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } = require('../controllers/testimonialController');

router.route('/')
  .get(getTestimonials)
  .post(protect, authorize('admin'), createTestimonial);

router.route('/:id')
  .put(protect, authorize('admin'), updateTestimonial)
  .delete(protect, authorize('admin'), deleteTestimonial);

module.exports = router;
