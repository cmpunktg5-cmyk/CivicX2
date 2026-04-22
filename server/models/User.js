const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  points: { type: Number, default: 0 },
  totalPointsEarned: { type: Number, default: 0 },
  
  // Community Trust System
  reputationScore: { type: Number, default: 50 }, // 0 to 100
  isVerifiedReporter: { type: Boolean, default: false },
  
  badges: [{
    name: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  
  level: { type: Number, default: 1 },
  tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
  
  emergencyContacts: [{
    name: String,
    phone: String,
    relationship: String
  }],
  
  complaintsSubmitted: { type: Number, default: 0 },
  complaintsResolved: { type: Number, default: 0 },
  complaintsValidated: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  avatar: String,
  isActive: { type: Boolean, default: true }
});

// Hash password before saving
userSchema.pre('save', async function() {
  // Hash password if modified
  if (this.isModified('password')) {
    const bcrypt = require('bcryptjs');
    this.password = await bcrypt.hash(this.password, 12);
  }

  // Update tier based on points
  if (this.totalPointsEarned >= 5000) this.tier = 'Platinum';
  else if (this.totalPointsEarned >= 2000) this.tier = 'Gold';
  else if (this.totalPointsEarned >= 500) this.tier = 'Silver';
  else this.tier = 'Bronze';
  
  if (this.reputationScore >= 90) this.isVerifiedReporter = true;
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
