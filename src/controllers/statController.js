const Stat = require('../models/Stat');

// @desc    Get all stats
// @route   GET /api/stats
exports.getStats = async (req, res, next) => {
  try {
    const stats = await Stat.find().sort('sortOrder');
    res.json({ success: true, count: stats.length, data: stats });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a stat (admin only)
// @route   POST /api/stats
exports.createStat = async (req, res, next) => {
  try {
    const stat = await Stat.create(req.body);
    res.status(201).json({ success: true, data: stat });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a stat (admin only)
// @route   PUT /api/stats/:id
exports.updateStat = async (req, res, next) => {
  try {
    const stat = await Stat.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!stat) {
      return res.status(404).json({ success: false, message: 'Stat not found' });
    }
    res.json({ success: true, data: stat });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a stat (admin only)
// @route   DELETE /api/stats/:id
exports.deleteStat = async (req, res, next) => {
  try {
    await Stat.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Stat deleted' });
  } catch (err) {
    next(err);
  }
};
