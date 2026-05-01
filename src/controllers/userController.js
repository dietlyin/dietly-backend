const User = require('../models/User');
const Order = require('../models/Order');
const Plan = require('../models/Plan');
const Contact = require('../models/Contact');
const GymPartnership = require('../models/GymPartnership');

// @desc    Get user profile
// @route   GET /api/users/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('activePlan');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'address', 'dietaryPreferences', 'fitnessGoal'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).populate('activePlan');

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
// @route   PUT /api/users/password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().populate('activePlan', 'name price').sort('-createdAt').skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get admin dashboard summary
// @route   GET /api/users/admin/dashboard
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalOrders,
      activePlans,
      deliveredOrders,
      pendingOrders,
      preparingOrders,
      outForDeliveryOrders,
      cancelledOrders,
      totalContacts,
      newContacts,
      totalGymApplications,
      pendingGymApplications,
      recentUsers,
      recentOrders,
      planPerformance,
      revenueAgg,
      monthlyOrdersAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ subscriptionStatus: 'active' }),
      Order.countDocuments(),
      Plan.countDocuments({ isActive: true }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'preparing' }),
      Order.countDocuments({ status: 'out-for-delivery' }),
      Order.countDocuments({ status: 'cancelled' }),
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'new' }),
      GymPartnership.countDocuments(),
      GymPartnership.countDocuments({ status: 'pending' }),
      User.find()
        .select('name email phone role subscriptionStatus createdAt')
        .sort('-createdAt')
        .limit(8),
      Order.find()
        .populate('user', 'name email phone')
        .populate('plan', 'name price')
        .select('amount status paymentStatus createdAt user plan')
        .sort('-createdAt')
        .limit(8),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: '$plan',
            purchases: { $sum: 1 },
            revenue: { $sum: '$amount' },
          },
        },
        { $sort: { purchases: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'plans',
            localField: '_id',
            foreignField: '_id',
            as: 'plan',
          },
        },
        { $unwind: { path: '$plan', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            purchases: 1,
            revenue: 1,
            name: '$plan.name',
            slug: '$plan.slug',
          },
        },
      ]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
          },
        },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            orders: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $ne: ['$status', 'cancelled'] }, '$amount', 0],
              },
            },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    res.json({
      success: true,
      data: {
        kpis: {
          totalUsers,
          activeUsers,
          activePlans,
          totalOrders,
          deliveredOrders,
          pendingOrders,
          preparingOrders,
          outForDeliveryOrders,
          cancelledOrders,
          totalRevenue,
          totalContacts,
          newContacts,
          totalGymApplications,
          pendingGymApplications,
        },
        recentUsers,
        recentOrders,
        planPerformance,
        monthlyTrend: monthlyOrdersAgg.reverse(),
      },
    });
  } catch (err) {
    next(err);
  }
};
