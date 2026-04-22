const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  voteComplaint,
  updateStatus,
  getAdminStats
} = require('../controllers/complaintController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/admin-stats', adminAuth, getAdminStats);
router.post('/', auth, createComplaint);
router.get('/', getAllComplaints);
router.get('/:id', getComplaintById);
router.post('/:id/vote', auth, voteComplaint);
router.put('/:id/status', adminAuth, updateStatus);

module.exports = router;
