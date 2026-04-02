const Plan = require('../models/Plan');

// @desc    Get all active plans
// @route   GET /api/plans
exports.getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort('sortOrder');
    res.json({ success: true, count: plans.length, data: plans });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single plan by slug
// @route   GET /api/plans/:slug
exports.getPlan = async (req, res, next) => {
  try {
    const plan = await Plan.findOne({ slug: req.params.slug, isActive: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a plan (admin only)
// @route   POST /api/plans
exports.createPlan = async (req, res, next) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a plan (admin only)
// @route   PUT /api/plans/:id
exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a plan (admin only — soft delete)
// @route   DELETE /api/plans/:id
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.json({ success: true, message: 'Plan deactivated' });
  } catch (err) {
    next(err);
  }
};
