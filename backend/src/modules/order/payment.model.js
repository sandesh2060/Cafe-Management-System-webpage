// File: backend/src/modules/order/payment.model.js
// 💳 PAYMENT MODEL - Group Payment & Split Bill Support
// ✅ Tracks individual and group payments with participant status

const mongoose = require('mongoose');

const participantPaymentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Participant name is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet'],
    default: null
  },
  transactionId: {
    type: String,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  }
}, { _id: true, timestamps: true });

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required'],
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer ID is required'],
    index: true
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
    index: true
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentType: {
    type: String,
    enum: ['individual', 'group'],
    required: true,
    default: 'individual'
  },
  groupPayment: {
    splitMode: {
      type: String,
      enum: ['equal', 'unequal'],
      default: null
    },
    participants: [participantPaymentSchema],
    participantCount: {
      type: Number,
      min: 1,
      default: null
    },
    allPaid: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'processing', 'paid', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet', 'multiple'],
    default: null
  },
  transactionId: {
    type: String,
    index: true,
    sparse: true
  },
  paymentGateway: {
    type: String,
    enum: ['stripe', 'razorpay', 'paypal', 'cash', null],
    default: null
  },
  paymentDate: {
    type: Date,
    default: null
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  notes: {
    type: String,
    maxlength: 500
  },
  refund: {
    amount: {
      type: Number,
      default: 0
    },
    reason: String,
    processedAt: Date,
    refundId: String
  },
  timeline: [{
    status: String,
    amount: Number,
    participant: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// INDEXES
// ============================================
paymentSchema.index({ orderId: 1, status: 1 });
paymentSchema.index({ customerId: 1, status: 1 });
paymentSchema.index({ tableId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// ============================================
// VIRTUALS
// ============================================

// Check if payment is complete
paymentSchema.virtual('isFullyPaid').get(function() {
  return this.status === 'paid' && this.paidAmount >= this.totalAmount;
});

// Check if group payment is complete
paymentSchema.virtual('isGroupComplete').get(function() {
  if (this.paymentType !== 'group') return null;
  return this.groupPayment?.allPaid === true;
});

// Get pending participants
paymentSchema.virtual('pendingParticipants').get(function() {
  if (this.paymentType !== 'group') return [];
  return this.groupPayment.participants.filter(p => p.status === 'pending');
});

// Get payment progress percentage
paymentSchema.virtual('paymentProgress').get(function() {
  if (this.totalAmount === 0) return 100;
  return Math.floor((this.paidAmount / this.totalAmount) * 100);
});

// ============================================
// PRE-SAVE MIDDLEWARE
// ============================================

/**
 * Calculate remaining amount before save
 */
paymentSchema.pre('save', function(next) {
  this.remainingAmount = this.totalAmount - this.paidAmount;
  next();
});

/**
 * Update status based on payment amount
 */
paymentSchema.pre('save', function(next) {
  if (this.paidAmount === 0) {
    this.status = 'pending';
  } else if (this.paidAmount < this.totalAmount) {
    this.status = 'partial';
  } else if (this.paidAmount >= this.totalAmount) {
    this.status = 'paid';
    if (!this.paymentDate) {
      this.paymentDate = new Date();
    }
  }
  next();
});

/**
 * Check if group payment is complete
 */
paymentSchema.pre('save', function(next) {
  if (this.paymentType === 'group' && this.groupPayment.participants.length > 0) {
    const allPaid = this.groupPayment.participants.every(p => p.status === 'paid');
    this.groupPayment.allPaid = allPaid;
    
    if (allPaid) {
      this.status = 'paid';
      this.paidAmount = this.totalAmount;
    }
  }
  next();
});

/**
 * Add timeline entry when status changes
 */
paymentSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      amount: this.paidAmount,
      timestamp: new Date(),
      note: `Payment status changed to ${this.status}`
    });
  }
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Initialize group payment
 */
paymentSchema.methods.initializeGroupPayment = function(participants, splitMode = 'equal') {
  this.paymentType = 'group';
  this.groupPayment.splitMode = splitMode;
  this.groupPayment.participantCount = participants.length;
  
  if (splitMode === 'equal') {
    const amountPerPerson = this.totalAmount / participants.length;
    this.groupPayment.participants = participants.map(name => ({
      name,
      amount: amountPerPerson,
      status: 'pending'
    }));
  } else {
    // Unequal split - participants must have amount specified
    this.groupPayment.participants = participants.map(p => ({
      name: p.name,
      amount: p.amount,
      status: 'pending'
    }));
  }
  
  this.timeline.push({
    status: 'group_initialized',
    timestamp: new Date(),
    note: `Group payment initialized with ${participants.length} participants (${splitMode} split)`
  });
  
  return this.save();
};

/**
 * Record participant payment
 */
paymentSchema.methods.recordParticipantPayment = async function(participantName, paymentData) {
  const participant = this.groupPayment.participants.find(p => p.name === participantName);
  
  if (!participant) {
    throw new Error(`Participant "${participantName}" not found`);
  }
  
  if (participant.status === 'paid') {
    throw new Error(`Participant "${participantName}" has already paid`);
  }
  
  // Update participant
  participant.status = 'paid';
  participant.paymentMethod = paymentData.paymentMethod;
  participant.transactionId = paymentData.transactionId;
  participant.paidAt = new Date();
  
  // Update total paid amount
  this.paidAmount += participant.amount;
  
  // Add timeline entry
  this.timeline.push({
    status: 'participant_paid',
    amount: participant.amount,
    participant: participantName,
    timestamp: new Date(),
    note: `${participantName} paid ₹${participant.amount} via ${paymentData.paymentMethod}`
  });
  
  return this.save();
};

/**
 * Process individual payment
 */
paymentSchema.methods.processIndividualPayment = async function(paymentData) {
  if (this.paymentType !== 'individual') {
    throw new Error('Cannot process individual payment for group payment type');
  }
  
  this.status = 'paid';
  this.paidAmount = this.totalAmount;
  this.paymentMethod = paymentData.paymentMethod;
  this.transactionId = paymentData.transactionId;
  this.paymentDate = new Date();
  this.paymentGateway = paymentData.gateway || 'cash';
  
  this.timeline.push({
    status: 'paid',
    amount: this.totalAmount,
    timestamp: new Date(),
    note: `Payment completed via ${paymentData.paymentMethod}`
  });
  
  return this.save();
};

/**
 * Initiate refund
 */
paymentSchema.methods.processRefund = async function(amount, reason) {
  if (this.status !== 'paid') {
    throw new Error('Can only refund paid payments');
  }
  
  if (amount > this.paidAmount) {
    throw new Error('Refund amount cannot exceed paid amount');
  }
  
  this.refund.amount = amount;
  this.refund.reason = reason;
  this.refund.processedAt = new Date();
  this.status = 'refunded';
  
  this.timeline.push({
    status: 'refunded',
    amount: amount,
    timestamp: new Date(),
    note: `Refund processed: ${reason}`
  });
  
  return this.save();
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Find payment by order ID
 */
paymentSchema.statics.findByOrder = function(orderId) {
  return this.findOne({ orderId })
    .populate('orderId')
    .populate('customerId', 'name email phone')
    .populate('tableId', 'number')
    .lean();
};

/**
 * Find pending group payments
 */
paymentSchema.statics.findPendingGroupPayments = function(filters = {}) {
  return this.find({
    paymentType: 'group',
    'groupPayment.allPaid': false,
    status: { $in: ['pending', 'partial'] },
    ...filters
  })
    .populate('orderId', 'orderNumber')
    .populate('tableId', 'number')
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Get payment statistics
 */
paymentSchema.statics.getStatistics = async function(filters = {}) {
  const { startDate, endDate } = filters;
  
  const matchStage = { status: 'paid' };
  if (startDate || endDate) {
    matchStage.paymentDate = {};
    if (startDate) matchStage.paymentDate.$gte = new Date(startDate);
    if (endDate) matchStage.paymentDate.$lte = new Date(endDate);
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalRevenue: { $sum: '$paidAmount' },
        averagePayment: { $avg: '$paidAmount' },
        cashPayments: {
          $sum: { $cond: [{ $eq: ['$paymentMethod', 'cash'] }, 1, 0] }
        },
        cardPayments: {
          $sum: { $cond: [{ $eq: ['$paymentMethod', 'card'] }, 1, 0] }
        },
        groupPayments: {
          $sum: { $cond: [{ $eq: ['$paymentType', 'group'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalPayments: 0,
    totalRevenue: 0,
    averagePayment: 0,
    cashPayments: 0,
    cardPayments: 0,
    groupPayments: 0
  };
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;