const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getMeals, getMeal, createMeal, updateMeal, deleteMeal } = require('../controllers/mealController');

router.route('/')
  .get(getMeals)
  .post(protect, authorize('admin'), createMeal);

router.route('/:id')
  .get(getMeal)
  .put(protect, authorize('admin'), updateMeal)
  .delete(protect, authorize('admin'), deleteMeal);

module.exports = router;
