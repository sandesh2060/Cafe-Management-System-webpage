// File: backend/src/modules/request/request.model.js
// 🔔 CUSTOMER REQUEST MODEL - Assistance requests from customers
// ✅ Matches your existing model patterns

const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: [true, 'Table ID is required'],
    index: true
  },
  tableNumber: {
    type: String,
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    index: true
  },
  customerName: {
    type: String
  },
  type: {
    type: String,
    enum: ['assistance', 'bill', 'complaint', 'refill', 'question', 'other'],
    default: 'assistance',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  message: {
    type: String,
    required: [true, 'Request message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  details: {
    type: String,
    trim: true,
    maxlength: [1000, 'Details cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  acknowledged: {
    type: Boolean,
    default: false
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acknowledgedAt: {
    type: Date
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: {
    type: Date
  },
  completionNotes: {
    type: String,
    maxlength: 500
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    maxlength: 500
  },
  responseTime: {
    type: Number // in seconds
  },
  metadata: {
    source: {
      type: String,
      enum: ['tablet', 'qr', 'button', 'voice', 'other'],
      default: 'tablet'
    },
    location: {
      latitude: Number,
      longitude: Number
    },
    deviceInfo: String,
    sessionId: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== INDEXES ====================
requestSchema.index({ createdAt: -1 });
requestSchema.index({ tableId: 1, status: 1 });
requestSchema.index({ status: 1, priority: -1, createdAt: -1 });
requestSchema.index({ acknowledgedBy: 1, status: 1 });

// ==================== VIRTUALS ====================

// Virtual for request age (in minutes)
requestSchema.virtual('requestAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / 60000);
});

// Virtual for is urgent
requestSchema.virtual('isUrgent').get(function() {
  return this.priority === 'urgent' || this.requestAge > 10;
});

// ==================== PRE-SAVE MIDDLEWARE ====================

/**
 * Calculate response time when request is completed
 */
requestSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && this.completedAt) {
    this.responseTime = Math.floor((this.completedAt - this.createdAt) / 1000);
  }
  next();
});

// ==================== INSTANCE METHODS ====================

/**
 * Acknowledge request
 */
requestSchema.methods.acknowledge = async function(userId) {
  this.acknowledged = true;
  this.acknowledgedBy = userId;
  this.acknowledgedAt = new Date();
  
  if (this.status === 'pending') {
    this.status = 'acknowledged';
  }
  
  return this.save();
};

/**
 * Complete request
 */
requestSchema.methods.complete = async function(userId, notes = '') {
  this.status = 'completed';
  this.completedBy = userId;
  this.completedAt = new Date();
  this.completionNotes = notes;
  
  // Calculate response time
  this.responseTime = Math.floor((this.completedAt - this.createdAt) / 1000);
  
  return this.save();
};

/**
 * Cancel request
 */
requestSchema.methods.cancel = async function(userId, reason = '') {
  this.status = 'cancelled';
  this.cancelledBy = userId;
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  
  return this.save();
};

// ==================== STATIC METHODS ====================

/**
 * Find pending requests
 */
requestSchema.statics.findPending = function(filters = {}) {
  return this.find({
    status: { $in: ['pending', 'acknowledged', 'in-progress'] },
    ...filters
  })
    .populate('tableId', 'number location')
    .populate('customerId', 'name phone')
    .sort({ priority: -1, createdAt: 1 })
    .lean();
};

/**
 * Find requests by table
 */
requestSchema.statics.findByTable = function(tableId, activeOnly = true) {
  const query = { tableId };
  
  if (activeOnly) {
    query.status = { $in: ['pending', 'acknowledged', 'in-progress'] };
  }

  return this.find(query)
    .populate('acknowledgedBy', 'name')
    .populate('completedBy', 'name')
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Find requests by waiter (assigned tables)
 */
requestSchema.statics.findByWaiter = async function(waiterId, activeOnly = true) {
  // Get tables assigned to this waiter
  const Table = mongoose.model('Table');
  const tables = await Table.find({
    $or: [
      { assignedTo: waiterId },
      { assignedWaiter: waiterId }
    ]
  }).select('_id');
  
  const tableIds = tables.map(t => t._id);
  
  const query = { tableId: { $in: tableIds } };
  
  if (activeOnly) {
    query.status = { $in: ['pending', 'acknowledged', 'in-progress'] };
  }

  return this.find(query)
    .populate('tableId', 'number location')
    .populate('customerId', 'name phone')
    .sort({ priority: -1, createdAt: 1 })
    .lean();
};

/**
 * Get request statistics
 */
requestSchema.statics.getStatistics = async function(filters = {}) {
  const { startDate, endDate } = filters;
  
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        pendingRequests: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        completedRequests: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        averageResponseTime: { $avg: '$responseTime' }
      }
    }
  ]);

  return stats[0] || {
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    averageResponseTime: 0
  };
};

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;