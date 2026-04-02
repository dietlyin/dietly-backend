const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getPlans, getPlan, createPlan, updatePlan, deletePlan } = require('../controllers/planController');

router.route('/')
  .get(getPlans)
  .post(protect, authorize('admin'), createPlan);

router.route('/:slug')
  .get(getPlan);

router.route('/:id/edit')
  .put(protect, authorize('admin'), updatePlan)
  .delete(protect, authorize('admin'), deletePlan);

module.exports = router;
