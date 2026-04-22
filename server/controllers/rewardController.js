const RewardTransaction = require('../models/RewardTransaction');
const Redemption = require('../models/Redemption');
const User = require('../models/User');

const REDEMPTION_OPTIONS = {
  'Google Play': { points: 500, label: '₹100 Gift Card' },
  'Amazon': { points: 1000, label: '₹250 Gift Card' },
  'Flipkart': { points: 1000, label: '₹250 Gift Card' }
};

exports.getHistory = async (req, res) => {
  try {
    const transactions = await RewardTransaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const redemptions = await Redemption.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ transactions, redemptions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.redeemPoints = async (req, res) => {
  try {
    const { rewardType } = req.body;
    const userId = req.user.id;

    const option = REDEMPTION_OPTIONS[rewardType];
    if (!option) return res.status(400).json({ message: "Invalid reward type" });

    const user = await User.findById(userId);
    if (user.points < option.points) {
      return res.status(400).json({ message: "Insufficient points" });
    }

    // Generate mock code
    const mockCode = `CIVICX-${rewardType.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // 1. Create Redemption
    const redemption = new Redemption({
      user: userId,
      rewardType,
      pointsSpent: option.points,
      code: mockCode
    });

    // 2. Create Transaction (Debit)
    const transaction = new RewardTransaction({
      user: userId,
      amount: option.points,
      type: 'debit',
      reason: `Redeemed for ${rewardType} ${option.label}`
    });

    // 3. Update User Balance
    user.points -= option.points;
    
    await Promise.all([
      redemption.save(),
      transaction.save(),
      user.save()
    ]);

    res.json({ 
      message: "Redemption successful", 
      code: mockCode,
      newBalance: user.points 
    });
  } catch (error) {
    console.error("Redeem Error:", error);
    res.status(500).json({ message: "Redemption failed" });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find({}, { name: 1, totalPointsEarned: 1, tier: 1, isVerifiedReporter: 1 })
      .sort({ totalPointsEarned: -1 })
      .limit(20);
    
    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
