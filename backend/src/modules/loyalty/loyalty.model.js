// File: backend/src/modules/loyalty/loyalty.model.js
// Enhanced loyalty model with points system

const mongoose = require('mongoose');

const loyaltySchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    unique: true,
    index: true
  },
  
  // Visit-based rewards (10 visits = 1 free item)
  currentVisits: {
    type: Number,
    default: 0,
    min: 0
  },
  totalVisits: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Points-based rewards (points from spending)
  currentPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPointsEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPointsRedeemed: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Points configuration
  pointsPerDollar: {
    type: Number,
    default: 10, // Earn 10 points per $1 spent
  },
  
  // Tier system (bronze, silver, gold, platinum)
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  tierSince: {
    type: Date,
    default: Date.now
  },
  
  // Available rewards
  hasAvailableReward: {
    type: Boolean,
    default: false
  },
  rewardEarnedAt: {
    type: Date
  },
  rewardClaimedAt: {
    type: Date
  },
  
  // Reward history
  rewardHistory: [{
    type: {
      type: String,
      enum: ['visit_reward', 'points_reward', 'birthday_reward', 'tier_bonus'],
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem'
    },
    pointsCost: {
      type: Number,
      default: 0
    },
    claimedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  
  // Points transaction history
  pointsHistory: [{
    type: {
      type: String,
      enum: ['earned', 'redeemed', 'bonus', 'expired', 'adjusted'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    balance: {
      type: Number,
      required: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    description: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Special bonuses
  birthdayRewardClaimed: {
    type: Boolean,
    default: false
  },
  lastBirthdayRewardYear: Number,
  
  // Streak tracking
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastVisitDate: Date,
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
loyaltySchema.index({ customer: 1 });
loyaltySchema.index({ hasAvailableReward: 1 });
loyaltySchema.index({ tier: 1 });
loyaltySchema.index({ currentPoints: -1 });

// Virtual: Calculate tier progress
loyaltySchema.virtual('tierProgress').get(function() {
  const tiers = {
    bronze: { min: 0, max: 500 },
    silver: { min: 500, max: 2000 },
    gold: { min: 2000, max: 5000 },
    platinum: { min: 5000, max: Infinity }
  };
  
  const current = tiers[this.tier];
  if (current.max === Infinity) return 100;
  
  const progress = ((this.totalPointsEarned - current.min) / (current.max - current.min)) * 100;
  return Math.min(100, Math.max(0, progress));
});

// Method: Add points
loyaltySchema.methods.addPoints = function(amount, orderId = null, description = 'Purchase') {
  this.currentPoints += amount;
  this.totalPointsEarned += amount;
  
  this.pointsHistory.unshift({
    type: 'earned',
    amount,
    balance: this.currentPoints,
    orderId,
    description
  });
  
  // Update tier
  this.updateTier();
  
  return this;
};

// Method: Redeem points
loyaltySchema.methods.redeemPoints = function(amount, description = 'Reward redemption') {
  if (this.currentPoints < amount) {
    throw new Error('Insufficient points');
  }
  
  this.currentPoints -= amount;
  this.totalPointsRedeemed += amount;
  
  this.pointsHistory.unshift({
    type: 'redeemed',
    amount: -amount,
    balance: this.currentPoints,
    description
  });
  
  return this;
};

// Method: Update tier based on total points
loyaltySchema.methods.updateTier = function() {
  const oldTier = this.tier;
  const points = this.totalPointsEarned;
  
  if (points >= 5000) {
    this.tier = 'platinum';
  } else if (points >= 2000) {
    this.tier = 'gold';
  } else if (points >= 500) {
    this.tier = 'silver';
  } else {
    this.tier = 'bronze';
  }
  
  // Record tier change
  if (oldTier !== this.tier) {
    this.tierSince = new Date();
    
    // Add tier upgrade bonus
    const bonuses = {
      silver: 50,
      gold: 150,
      platinum: 500
    };
    
    if (bonuses[this.tier]) {
      this.addPoints(bonuses[this.tier], null, `${this.tier} tier upgrade bonus`);
    }
  }
  
  return this;
};

// Method: Update visit streak
loyaltySchema.methods.updateStreak = function() {
  const now = new Date();
  const lastVisit = this.lastVisitDate;
  
  if (!lastVisit) {
    this.currentStreak = 1;
  } else {
    const daysSinceLastVisit = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastVisit === 1) {
      // Consecutive day
      this.currentStreak += 1;
    } else if (daysSinceLastVisit > 1) {
      // Streak broken
      this.currentStreak = 1;
    }
    // If same day, don't change streak
  }
  
  if (this.currentStreak > this.longestStreak) {
    this.longestStreak = this.currentStreak;
  }
  
  this.lastVisitDate = now;
  
  // Bonus for streaks
  if (this.currentStreak === 7) {
    this.addPoints(100, null, '7-day streak bonus');
  } else if (this.currentStreak === 30) {
    this.addPoints(500, null, '30-day streak bonus');
  }
  
  return this;
};

// Static: Get tier benefits
loyaltySchema.statics.getTierBenefits = function(tier) {
  const benefits = {
    bronze: {
      pointsMultiplier: 1.0,
      birthdayReward: true,
      earlyAccess: false,
      freeUpgrade: false
    },
    silver: {
      pointsMultiplier: 1.2,
      birthdayReward: true,
      earlyAccess: true,
      freeUpgrade: false
    },
    gold: {
      pointsMultiplier: 1.5,
      birthdayReward: true,
      earlyAccess: true,
      freeUpgrade: true
    },
    platinum: {
      pointsMultiplier: 2.0,
      birthdayReward: true,
      earlyAccess: true,
      freeUpgrade: true,
      exclusiveItems: true
    }
  };
  
  return benefits[tier] || benefits.bronze;
};

// Pre-save: Limit history size
loyaltySchema.pre('save', function(next) {
  // Keep last 100 points transactions
  if (this.pointsHistory.length > 100) {
    this.pointsHistory = this.pointsHistory.slice(0, 100);
  }
  
  // Keep last 50 reward claims
  if (this.rewardHistory.length > 50) {
    this.rewardHistory = this.rewardHistory.slice(0, 50);
  }
  
  next();
});

module.exports = mongoose.model('Loyalty', loyaltySchema);