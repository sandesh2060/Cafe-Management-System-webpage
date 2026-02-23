// File: backend/src/modules/loyalty/loyalty.service.js
// Enhanced loyalty service with points system

const Customer = require('../customer/customer.model');
const Loyalty = require('./loyalty.model');
const LoyaltyTransaction = require('./loyaltyTransaction.model');
const mongoose = require('mongoose');

// Loyalty configuration
const LOYALTY_CONFIG = {
  visitsRequired: 10,
  pointsPerDollar: 10,
  rewardPointsCost: 500, // 500 points = 1 free item
  tiers: {
    bronze: { min: 0, max: 500, multiplier: 1.0 },
    silver: { min: 500, max: 2000, multiplier: 1.2 },
    gold: { min: 2000, max: 5000, multiplier: 1.5 },
    platinum: { min: 5000, max: Infinity, multiplier: 2.0 }
  }
};

// Get customer loyalty data
exports.getCustomerLoyalty = async (customerId) => {
  try {
    const customer = await Customer.findById(customerId)
      .select('visitCount loyaltyPoints')
      .lean();

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Find or create loyalty record
    let loyalty = await Loyalty.findOne({ customer: customerId });
    
    if (!loyalty) {
      loyalty = await Loyalty.create({
        customer: customerId,
        currentVisits: 0,
        totalVisits: 0,
        currentPoints: 0,
        totalPointsEarned: 0
      });
    }

    // Calculate visit-based progress
    const totalVisits = customer.visitCount || 0;
    const currentVisits = totalVisits % LOYALTY_CONFIG.visitsRequired;
    const completedCycles = Math.floor(totalVisits / LOYALTY_CONFIG.visitsRequired);
    const claimedRewards = loyalty.rewardHistory.filter(r => r.type === 'visit_reward').length;
    const hasVisitReward = completedCycles > claimedRewards;

    return {
      // Visit-based rewards
      currentVisits,
      totalVisits,
      visitsRemaining: LOYALTY_CONFIG.visitsRequired - currentVisits,
      hasVisitReward,
      
      // Points-based rewards
      currentPoints: loyalty.currentPoints || 0,
      totalPointsEarned: loyalty.totalPointsEarned || 0,
      totalPointsRedeemed: loyalty.totalPointsRedeemed || 0,
      pointsToNextReward: Math.max(0, LOYALTY_CONFIG.rewardPointsCost - loyalty.currentPoints),
      canRedeemPoints: loyalty.currentPoints >= LOYALTY_CONFIG.rewardPointsCost,
      
      // Tier info
      tier: loyalty.tier || 'bronze',
      tierBenefits: Loyalty.getTierBenefits(loyalty.tier),
      tierProgress: loyalty.tierProgress || 0,
      
      // Streak info
      currentStreak: loyalty.currentStreak || 0,
      longestStreak: loyalty.longestStreak || 0,
      
      // History
      rewardHistory: loyalty.rewardHistory || [],
      recentPointsHistory: loyalty.pointsHistory.slice(0, 10) || [],
      
      // Config
      config: LOYALTY_CONFIG,
    };
  } catch (error) {
    console.error('Get loyalty error:', error);
    throw new Error(`Failed to fetch loyalty data: ${error.message}`);
  }
};

// Add a visit (called when session starts or order placed)
exports.addVisit = async (customerId) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();

    const customer = await Customer.findById(customerId).session(session);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Update customer visit count
    customer.visitCount = (customer.visitCount || 0) + 1;

    // Find or create loyalty record
    let loyalty = await Loyalty.findOne({ customer: customerId }).session(session);
    
    if (!loyalty) {
      loyalty = new Loyalty({ customer: customerId });
    }

    // Update visits
    loyalty.totalVisits = customer.visitCount;
    loyalty.currentVisits = customer.visitCount % LOYALTY_CONFIG.visitsRequired;
    
    // Update streak
    loyalty.updateStreak();

    // Check if earned visit-based reward
    const rewardEarned = loyalty.currentVisits === 0;
    
    if (rewardEarned) {
      loyalty.hasAvailableReward = true;
      loyalty.rewardEarnedAt = new Date();
    }

    await customer.save({ session });
    await loyalty.save({ session });

    // Log transaction
    await LoyaltyTransaction.create([{
      customer: customerId,
      type: 'visit',
      visitsAdded: 1,
      currentVisits: loyalty.currentVisits || LOYALTY_CONFIG.visitsRequired,
      totalVisits: loyalty.totalVisits,
    }], { session });

    await session.commitTransaction();

    return {
      success: true,
      currentVisits: loyalty.currentVisits || LOYALTY_CONFIG.visitsRequired,
      totalVisits: loyalty.totalVisits,
      currentPoints: loyalty.currentPoints,
      currentStreak: loyalty.currentStreak,
      rewardEarned,
      visitsRemaining: rewardEarned ? LOYALTY_CONFIG.visitsRequired : LOYALTY_CONFIG.visitsRequired - loyalty.currentVisits,
    };
  } catch (error) {
    await session.abortTransaction();
    throw new Error(`Add visit failed: ${error.message}`);
  } finally {
    await session.endSession();
  }
};

// Add points (called when order is paid)
exports.addPoints = async (customerId, orderAmount, orderId = null) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();

    let loyalty = await Loyalty.findOne({ customer: customerId }).session(session);
    
    if (!loyalty) {
      loyalty = new Loyalty({ customer: customerId });
    }

    // Calculate points based on tier multiplier
    const tierBenefits = Loyalty.getTierBenefits(loyalty.tier);
    const basePoints = Math.floor(orderAmount * LOYALTY_CONFIG.pointsPerDollar);
    const bonusPoints = Math.floor(basePoints * (tierBenefits.pointsMultiplier - 1));
    const totalPoints = basePoints + bonusPoints;

    // Add points
    loyalty.addPoints(totalPoints, orderId, `Purchase: $${orderAmount.toFixed(2)}`);
    
    // Update customer model
    const customer = await Customer.findById(customerId).session(session);
    if (customer) {
      customer.loyaltyPoints = loyalty.currentPoints;
      await customer.save({ session });
    }

    await loyalty.save({ session });
    await session.commitTransaction();

    return {
      success: true,
      pointsEarned: totalPoints,
      basePoints,
      bonusPoints,
      currentPoints: loyalty.currentPoints,
      tier: loyalty.tier,
    };
  } catch (error) {
    await session.abortTransaction();
    throw new Error(`Add points failed: ${error.message}`);
  } finally {
    await session.endSession();
  }
};

// Claim visit-based reward
exports.claimVisitReward = async (customerId, itemId) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();

    const loyalty = await Loyalty.findOne({ customer: customerId }).session(session);

    if (!loyalty || !loyalty.hasAvailableReward) {
      throw new Error('No available visit-based rewards');
    }

    // Mark reward as claimed
    loyalty.hasAvailableReward = false;
    loyalty.rewardClaimedAt = new Date();
    
    // Add to history
    loyalty.rewardHistory.unshift({
      type: 'visit_reward',
      itemId,
      pointsCost: 0,
      claimedAt: new Date(),
      description: 'Free item - 10 visits completed'
    });

    await loyalty.save({ session });
    await session.commitTransaction();

    return {
      id: loyalty.rewardHistory[0]._id,
      type: 'visit_reward',
      itemId,
      claimedAt: loyalty.rewardHistory[0].claimedAt,
    };
  } catch (error) {
    await session.abortTransaction();
    throw new Error(`Claim visit reward failed: ${error.message}`);
  } finally {
    await session.endSession();
  }
};

// Redeem points for reward
exports.redeemPointsReward = async (customerId, itemId, pointsCost = LOYALTY_CONFIG.rewardPointsCost) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();

    const loyalty = await Loyalty.findOne({ customer: customerId }).session(session);

    if (!loyalty) {
      throw new Error('Loyalty record not found');
    }

    if (loyalty.currentPoints < pointsCost) {
      throw new Error(`Insufficient points. Need ${pointsCost}, have ${loyalty.currentPoints}`);
    }

    // Redeem points
    loyalty.redeemPoints(pointsCost, `Redeemed for item`);
    
    // Add to history
    loyalty.rewardHistory.unshift({
      type: 'points_reward',
      itemId,
      pointsCost,
      claimedAt: new Date(),
      description: `Redeemed ${pointsCost} points`
    });

    // Update customer model
    const customer = await Customer.findById(customerId).session(session);
    if (customer) {
      customer.loyaltyPoints = loyalty.currentPoints;
      await customer.save({ session });
    }

    await loyalty.save({ session });
    await session.commitTransaction();

    return {
      id: loyalty.rewardHistory[0]._id,
      type: 'points_reward',
      itemId,
      pointsCost,
      remainingPoints: loyalty.currentPoints,
      claimedAt: loyalty.rewardHistory[0].claimedAt,
    };
  } catch (error) {
    await session.abortTransaction();
    throw new Error(`Redeem points failed: ${error.message}`);
  } finally {
    await session.endSession();
  }
};

// Get available free items
exports.getAvailableFreeItems = async () => {
  try {
    let MenuItem;
    try {
      MenuItem = require('../menu/menu.model');
      const items = await MenuItem.find({ 
        rewardEligible: true,
        isAvailable: true 
      })
        .select('name category description price image pointsCost')
        .limit(20)
        .lean();
      
      if (items.length > 0) {
        return items;
      }
    } catch (err) {
      console.log('Menu model not available, using default items');
    }

    // Fallback items with points cost
    return [
      { id: '1', name: 'Cappuccino', category: 'Hot Drinks', price: 4.50, pointsCost: 450 },
      { id: '2', name: 'Latte', category: 'Hot Drinks', price: 5.00, pointsCost: 500 },
      { id: '3', name: 'Croissant', category: 'Pastries', price: 3.50, pointsCost: 350 },
      { id: '4', name: 'Muffin', category: 'Pastries', price: 4.00, pointsCost: 400 },
    ];
  } catch (error) {
    throw new Error('Failed to get free items');
  }
};

// Get loyalty configuration
exports.getLoyaltyConfig = async () => {
  return LOYALTY_CONFIG;
};

// Get points balance
exports.getPointsBalance = async (customerId) => {
  const loyalty = await Loyalty.findOne({ customer: customerId });
  
  if (!loyalty) {
    return { currentPoints: 0, totalEarned: 0, totalRedeemed: 0 };
  }
  
  return {
    currentPoints: loyalty.currentPoints,
    totalEarned: loyalty.totalPointsEarned,
    totalRedeemed: loyalty.totalPointsRedeemed,
    tier: loyalty.tier,
  };
};