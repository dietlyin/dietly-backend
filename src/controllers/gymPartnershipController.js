const GymPartnership = require('../models/GymPartnership');

// @desc    Submit gym partnership application
// @route   POST /api/gym-partnership/apply
exports.applyPartnership = async (req, res, next) => {
  try {
    const { gymName, ownerName, email, phone, city, memberCount, message } = req.body;

    const partnership = await GymPartnership.create({
      gymName, ownerName, email, phone, city, memberCount, message,
    });

    res.status(201).json({
      success: true,
      message: 'Partnership application submitted! Our team will reach out within 48 hours.',
      data: { id: partnership._id },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all partnership applications (admin only)
// @route   GET /api/gym-partnership
exports.getApplications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [applications, total] = await Promise.all([
      GymPartnership.find(filter).sort('-createdAt').skip(skip).limit(limit),
      GymPartnership.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: applications.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: applications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update application status (admin only)
// @route   PUT /api/gym-partnership/:id
exports.updateApplication = async (req, res, next) => {
  try {
    const application = await GymPartnership.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};
