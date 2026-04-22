const express = require('express');
const router = express.Router();
const { getHistory, redeemPoints, getLeaderboard } = require('../controllers/rewardController');
const { auth } = require('../middleware/auth');

router.get('/history', auth, getHistory);
router.get('/leaderboard', getLeaderboard);
router.post('/redeem', auth, redeemPoints);

module.exports = router;
