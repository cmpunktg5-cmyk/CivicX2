const mongoose = require('mongoose');

const rewardTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  reason: { type: String, required: true },
  complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RewardTransaction', rewardTransactionSchema);
