const FAQ = require('../models/FAQ');

// @desc    Get all active FAQs
// @route   GET /api/faqs
exports.getFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort('sortOrder');
    res.json({ success: true, count: faqs.length, data: faqs });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a FAQ (admin only)
// @route   POST /api/faqs
exports.createFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json({ success: true, data: faq });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a FAQ (admin only)
// @route   PUT /api/faqs/:id
exports.updateFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.json({ success: true, data: faq });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a FAQ (admin only)
// @route   DELETE /api/faqs/:id
exports.deleteFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.json({ success: true, message: 'FAQ deactivated' });
  } catch (err) {
    next(err);
  }
};
