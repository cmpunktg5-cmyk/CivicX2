const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['complaint_submit', 'image_upload', 'complaint_verified', 'complaint_resolved', 'community_validation', 'streak_bonus', 'badge_earned', 'level_up'],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  description: String,
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  },
  badge: {
    name: String,
    icon: String,
    description: String
  }
}, {
  timestamps: true
});

rewardSchema.index({ user: 1, createdAt: -1 });

// Point values configuration
rewardSchema.statics.POINT_VALUES = {
  complaint_submit: 50,
  image_upload: 20,
  complaint_verified: 30,
  complaint_resolved: 100,
  community_validation: 15,
  streak_bonus: 25,
  badge_earned: 75,
  level_up: 200
};

// Badge definitions
rewardSchema.statics.BADGES = {
  first_complaint: { name: 'First Report', icon: '🏅', description: 'Submitted your first complaint' },
  five_complaints: { name: 'Active Citizen', icon: '⭐', description: 'Submitted 5 complaints' },
  twenty_complaints: { name: 'Civic Champion', icon: '🏆', description: 'Submitted 20 complaints' },
  first_verified: { name: 'Trusted Reporter', icon: '✅', description: 'First verified complaint' },
  community_helper: { name: 'Community Helper', icon: '🤝', description: 'Validated 10 complaints' },
  image_pro: { name: 'Photo Reporter', icon: '📸', description: 'Uploaded 10 images' },
  streak_3: { name: 'Hat Trick', icon: '🔥', description: '3-day submission streak' },
  streak_7: { name: 'Week Warrior', icon: '💪', description: '7-day submission streak' },
  level_5: { name: 'Rising Star', icon: '🌟', description: 'Reached level 5' },
  level_10: { name: 'Civic Leader', icon: '👑', description: 'Reached level 10' }
};

module.exports = mongoose.model('Reward', rewardSchema);
