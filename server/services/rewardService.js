const RewardTransaction = require('../models/RewardTransaction');
const User = require('../models/User');

const POINT_VALUES = {
  submit_complaint: 50,
  upload_images: 20,
  complaint_verified: 30,
  complaint_resolved: 100,
  community_validation: 15,
  badge_earned: 75,
  level_up: 200
};

const BADGE_DEFINITIONS = {
  first_report: { name: 'First Report', icon: '🏅' },
  active_citizen: { name: 'Active Citizen', icon: '⭐' },
  photo_reporter: { name: 'Photo Reporter', icon: '📸' },
  civic_champion: { name: 'Civic Champion', icon: '🏆' }
};

const awardPoints = async (userId, type, complaintId = null) => {
  const points = POINT_VALUES[type] || 0;
  if (points === 0) return;

  // 1. Create Transaction
  await RewardTransaction.create({
    user: userId,
    amount: points,
    type: 'credit',
    reason: `Earned for ${type.replace(/_/g, ' ')}`,
    complaint: complaintId
  });

  // 2. Update User Points
  const user = await User.findById(userId);
  if (!user) return;

  user.points += points;
  user.totalPointsEarned += points;

  // 3. Level Logic
  const newLevel = Math.floor(user.totalPointsEarned / 500) + 1;
  if (newLevel > user.level) {
    user.level = newLevel;
    // Auto-award level up points
    await RewardTransaction.create({
      user: userId,
      amount: POINT_VALUES.level_up,
      type: 'credit',
      reason: `Level Up! Reached Level ${newLevel}`
    });
    user.points += POINT_VALUES.level_up;
    user.totalPointsEarned += POINT_VALUES.level_up;
  }

  // 4. Milestone Badges
  if (user.complaintsSubmitted === 1) await awardBadge(user, 'first_report');
  if (user.complaintsSubmitted === 5) await awardBadge(user, 'active_citizen');
  
  await user.save();
};

const awardBadge = async (user, badgeKey) => {
  const badgeDef = BADGE_DEFINITIONS[badgeKey];
  if (!badgeDef) return;

  const alreadyHas = user.badges.some(b => b.name === badgeDef.name);
  if (alreadyHas) return;

  user.badges.push({
    name: badgeDef.name,
    icon: badgeDef.icon,
    earnedAt: new Date()
  });

  // Points for badge
  user.points += POINT_VALUES.badge_earned;
  user.totalPointsEarned += POINT_VALUES.badge_earned;
  
  await RewardTransaction.create({
    user: user._id,
    amount: POINT_VALUES.badge_earned,
    type: 'credit',
    reason: `Earned Badge: ${badgeDef.name}`
  });
};

module.exports = { awardPoints };
