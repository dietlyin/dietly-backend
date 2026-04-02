const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getStats, createStat, updateStat, deleteStat } = require('../controllers/statController');

router.route('/')
  .get(getStats)
  .post(protect, authorize('admin'), createStat);

router.route('/:id')
  .put(protect, authorize('admin'), updateStat)
  .delete(protect, authorize('admin'), deleteStat);

module.exports = router;
