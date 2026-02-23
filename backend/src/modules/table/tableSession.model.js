const mongoose = require('mongoose');

const tableSessionSchema = new mongoose.Schema({
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  totalAmount: {
    type: Number,
    default: 0
  },
  notes: String
}, {
  timestamps: true
});

// Index for finding active sessions
tableSessionSchema.index({ table: 1, status: 1 });
tableSessionSchema.index({ customer: 1, status: 1 });

module.exports = mongoose.model('TableSession', tableSessionSchema);