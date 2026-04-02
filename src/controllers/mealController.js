const Meal = require('../models/Meal');

// @desc    Get all active meals (with optional category filter)
// @route   GET /api/meals?category=keto
exports.getMeals = async (req, res, next) => {
  try {
    const filter = { isActive: true };

    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }

    if (req.query.vegetarian === 'true') {
      filter.isVegetarian = true;
    }

    const meals = await Meal.find(filter).sort('sortOrder');
    res.json({ success: true, count: meals.length, data: meals });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single meal
// @route   GET /api/meals/:id
exports.getMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }
    res.json({ success: true, data: meal });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a meal (admin only)
// @route   POST /api/meals
exports.createMeal = async (req, res, next) => {
  try {
    const meal = await Meal.create(req.body);
    res.status(201).json({ success: true, data: meal });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a meal (admin only)
// @route   PUT /api/meals/:id
exports.updateMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }
    res.json({ success: true, data: meal });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a meal (admin only — soft delete)
// @route   DELETE /api/meals/:id
exports.deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }
    res.json({ success: true, message: 'Meal deactivated' });
  } catch (err) {
    next(err);
  }
};
