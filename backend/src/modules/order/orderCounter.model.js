// ================================================================
// FILE: backend/src/modules/order/orderCounter.model.js
// 🎯 ORDER COUNTER - Atomic sequence generation for order numbers
// ✅ Thread-safe counter using MongoDB's findOneAndUpdate
// ================================================================

const mongoose = require('mongoose');

const orderCounterSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
    index: true
    // Format: YYYYMMDD (e.g., "20260213")
  },
  sequence: {
    type: Number,
    required: true,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

/**
 * Get next sequence number atomically
 * Thread-safe using findOneAndUpdate with upsert
 * @param {string} date - Date string in YYYYMMDD format
 * @returns {Promise<number>} Next sequence number
 */
orderCounterSchema.statics.getNextSequence = async function(date) {
  const counter = await this.findOneAndUpdate(
    { date },
    { 
      $inc: { sequence: 1 },
      $set: { lastUpdated: new Date() }
    },
    { 
      new: true, 
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  return counter.sequence;
};

/**
 * Reset counter for a specific date (admin use)
 */
orderCounterSchema.statics.resetCounter = async function(date) {
  return this.findOneAndUpdate(
    { date },
    { sequence: 0, lastUpdated: new Date() },
    { new: true, upsert: true }
  );
};

/**
 * Get current sequence without incrementing
 */
orderCounterSchema.statics.getCurrentSequence = async function(date) {
  const counter = await this.findOne({ date });
  return counter ? counter.sequence : 0;
};

const OrderCounter = mongoose.model('OrderCounter', orderCounterSchema);

module.exports = OrderCounter;