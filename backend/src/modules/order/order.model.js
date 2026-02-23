// File: backend/src/modules/order/order.model.js
// Production-ready Order Model with complete schema and business logic

const mongoose = require('mongoose');
const OrderCounter = require('./orderCounter.model');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
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
    required: [true, 'Table ID is required'],
    index: true
  },
  items: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    customizations: {
      type: Map,
      of: String,
      default: {}
    },
    preparationTime: {
      type: Number,
      default: 5 // minutes
    },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'served'],
      default: 'pending'
    },
    subtotal: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet', 'pending'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  },
  specialInstructions: {
    type: String,
    maxlength: [500, 'Special instructions cannot exceed 500 characters'],
    trim: true
  },
  estimatedPrepTime: {
    type: Number, // in minutes
    default: 15
  },
  actualPrepTime: {
    type: Number // in minutes
  },
  servedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    maxlength: 500
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: 1000
  },
  reviewedAt: {
    type: Date
  },
  metadata: {
    source: {
      type: String,
      enum: ['tablet', 'qr', 'staff', 'api'],
      default: 'tablet'
    },
    ipAddress: String,
    userAgent: String,
    sessionId: String
  },
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== INDEXES ====================
orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ tableId: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });

// ==================== VIRTUALS ====================

// Virtual for order age (in minutes)
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / 60000);
});

// Virtual for total items
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for order progress percentage
orderSchema.virtual('progressPercentage').get(function() {
  const statusProgress = {
    'pending': 10,
    'confirmed': 25,
    'preparing': 50,
    'ready': 75,
    'served': 90,
    'completed': 100,
    'cancelled': 0
  };
  return statusProgress[this.status] || 0;
});

// ==================== PRE-SAVE MIDDLEWARE ====================

/**
 * Generate order number atomically
 * CRITICAL: Only generates if orderNumber is not already set
 * This is a fallback - order numbers should be generated in the service layer
 */
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    try {
      console.warn('⚠️ Generating order number in model (should be done in service layer)');
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      
      // Get atomic sequence number
      const sequence = await OrderCounter.getNextSequence(dateStr);
      
      this.orderNumber = `ORD-${dateStr}-${String(sequence).padStart(4, '0')}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

/**
 * Calculate estimated prep time based on items
 */
orderSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('items')) {
    this.estimatedPrepTime = this.items.reduce((max, item) => {
      return Math.max(max, item.preparationTime || 5);
    }, 0);
  }
  next();
});

/**
 * Add timeline entry when status changes
 */
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      notes: `Order status changed to ${this.status}`
    });
  }
  next();
});

// ==================== INSTANCE METHODS ====================

/**
 * Update order status with validation and timeline
 */
orderSchema.methods.updateStatus = async function(newStatus, updatedBy = null, notes = '') {
  const validTransitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['preparing', 'cancelled'],
    'preparing': ['ready', 'cancelled'],
    'ready': ['served', 'cancelled'],
    'served': ['completed'],
    'completed': [],
    'cancelled': []
  };

  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }

  this.status = newStatus;
  
  // Update timestamps
  if (newStatus === 'served') {
    this.servedAt = new Date();
    this.actualPrepTime = Math.floor((this.servedAt - this.createdAt) / 60000);
  } else if (newStatus === 'completed') {
    this.completedAt = new Date();
  } else if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
  }

  // Add timeline entry
  this.timeline.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy,
    notes: notes || `Order ${newStatus}`
  });

  return this.save();
};

/**
 * Cancel order with reason
 */
orderSchema.methods.cancel = async function(reason, cancelledBy = null) {
  if (['completed', 'cancelled'].includes(this.status)) {
    throw new Error('Cannot cancel completed or already cancelled order');
  }

  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  
  this.timeline.push({
    status: 'cancelled',
    timestamp: new Date(),
    updatedBy: cancelledBy,
    notes: `Order cancelled: ${reason}`
  });

  return this.save();
};

/**
 * Add rating and review
 */
orderSchema.methods.addReview = async function(rating, review = '') {
  if (this.status !== 'completed') {
    throw new Error('Can only review completed orders');
  }

  if (this.rating) {
    throw new Error('Order already reviewed');
  }

  this.rating = rating;
  this.review = review;
  this.reviewedAt = new Date();

  // Update menu item ratings
  for (const item of this.items) {
    const MenuItem = mongoose.model('MenuItem');
    const menuItem = await MenuItem.findById(item.menuItemId);
    if (menuItem) {
      await menuItem.updateRating(rating);
    }
  }

  return this.save();
};

/**
 * Calculate totals
 */
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.tax = this.subtotal * 0.1; // 10% tax
  this.total = this.subtotal + this.tax - (this.discount || 0);
  return this;
};

/**
 * Check if order can be modified
 */
orderSchema.methods.canBeModified = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

/**
 * Check if order is active
 */
orderSchema.methods.isActive = function() {
  return !['completed', 'cancelled'].includes(this.status);
};

// ==================== STATIC METHODS ====================

/**
 * Find active orders
 */
orderSchema.statics.findActive = function(filters = {}) {
  return this.find({
    status: { $in: ['pending', 'confirmed', 'preparing', 'ready', 'served'] },
    ...filters
  }).sort({ createdAt: -1 });
};

/**
 * Find orders by customer
 */
orderSchema.statics.findByCustomer = function(customerId, options = {}) {
  const { status, limit = 50, skip = 0 } = options;
  
  const query = { customerId };
  if (status) query.status = status;

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('items.menuItemId', 'name image category')
    .lean();
};

/**
 * Find orders by table
 */
orderSchema.statics.findByTable = function(tableId, activeOnly = true) {
  const query = { tableId };
  
  if (activeOnly) {
    query.status = { $in: ['pending', 'confirmed', 'preparing', 'ready', 'served'] };
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('items.menuItemId', 'name image')
    .lean();
};

/**
 * Get order statistics
 */
orderSchema.statics.getStatistics = async function(filters = {}) {
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
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        averagePrepTime: { $avg: '$actualPrepTime' }
      }
    }
  ]);

  return stats[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    averagePrepTime: 0
  };
};

/**
 * Get popular items from orders
 */
orderSchema.statics.getPopularItems = async function(limit = 10, filters = {}) {
  const { startDate, endDate } = filters;
  
  const matchStage = { status: { $ne: 'cancelled' } };
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  return this.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.menuItemId',
        name: { $first: '$items.name' },
        totalOrdered: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.subtotal' }
      }
    },
    { $sort: { totalOrdered: -1 } },
    { $limit: limit }
  ]);
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;