const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rewardType: { type: String, enum: ['Google Play', 'Amazon', 'Flipkart'], required: true },
  pointsSpent: { type: Number, required: true },
  code: { type: String, required: true },
  status: { type: String, enum: ['active', 'used'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Redemption', redemptionSchema);
