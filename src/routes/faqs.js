const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getFAQs, createFAQ, updateFAQ, deleteFAQ } = require('../controllers/faqController');

router.route('/')
  .get(getFAQs)
  .post(protect, authorize('admin'), createFAQ);

router.route('/:id')
  .put(protect, authorize('admin'), updateFAQ)
  .delete(protect, authorize('admin'), deleteFAQ);

module.exports = router;
