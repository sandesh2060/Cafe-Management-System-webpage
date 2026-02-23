// File: backend/src/modules/loyalty/loyaltyTransaction.model.js
// Loyalty transaction history model

const mongoose = require('mongoose');

const loyaltyTransactionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  type: {
    type: String,
    enum: ['visit', 'reward_claimed', 'points_adjusted'],
    required: true
  },
  visitsAdded: {
    type: Number,
    default: 0
  },
  currentVisits: {
    type: Number,
    required: true
  },
  totalVisits: {
    type: Number,
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
loyaltyTransactionSchema.index({ customer: 1, createdAt: -1 });
loyaltyTransactionSchema.index({ type: 1 });

module.exports = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);