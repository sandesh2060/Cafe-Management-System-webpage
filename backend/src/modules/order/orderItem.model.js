// File: backend/src/modules/order/orderItem.model.js
// Production-ready OrderItem Model for granular item-level tracking

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  customizations: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  customizationCost: {
    type: Number,
    default: 0,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  finalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled'],
    default: 'pending',
    index: true
  },
  preparationTime: {
    type: Number, // in minutes
    default: 5
  },
  estimatedReadyTime: {
    type: Date
  },
  actualReadyTime: {
    type: Date
  },
  servedAt: {
    type: Date
  },
  preparedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Kitchen staff
  },
  servedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Waiter
  },
  notes: {
    type: String,
    maxlength: 500
  },
  specialInstructions: {
    type: String,
    maxlength: 500
  },
  allergenInfo: [{
    type: String
  }],
  dietaryInfo: [{
    type: String
  }],
  cancelReason: {
    type: String,
    maxlength: 500
  },
  cancelledAt: {
    type: Date
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

// Indexes
orderItemSchema.index({ orderId: 1, status: 1 });
orderItemSchema.index({ menuItemId: 1, createdAt: -1 });
orderItemSchema.index({ status: 1, createdAt: -1 });

// Virtual for preparation duration
orderItemSchema.virtual('preparationDuration').get(function() {
  if (this.actualReadyTime && this.createdAt) {
    return Math.floor((this.actualReadyTime - this.createdAt) / 60000);
  }
  return null;
});

// Virtual for is delayed
orderItemSchema.virtual('isDelayed').get(function() {
  if (this.estimatedReadyTime && !this.actualReadyTime) {
    return new Date() > this.estimatedReadyTime;
  }
  return false;
});

// Pre-save middleware to calculate totals
orderItemSchema.pre('save', function(next) {
  if (this.isModified('quantity') || this.isModified('unitPrice') || this.isModified('customizationCost')) {
    this.subtotal = (this.unitPrice + this.customizationCost) * this.quantity;
    this.finalPrice = this.subtotal - (this.discount || 0);
  }
  
  if (this.isNew && !this.estimatedReadyTime) {
    this.estimatedReadyTime = new Date(Date.now() + this.preparationTime * 60000);
  }
  
  next();
});

// Pre-save middleware to add timeline entry
orderItemSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      notes: `Item status changed to ${this.status}`
    });
  }
  next();
});

// Instance Methods

// Mark as preparing
orderItemSchema.methods.startPreparing = async function(preparedBy = null) {
  if (this.status !== 'confirmed' && this.status !== 'pending') {
    throw new Error('Item must be confirmed before preparing');
  }

  this.status = 'preparing';
  if (preparedBy) this.preparedBy = preparedBy;
  
  this.timeline.push({
    status: 'preparing',
    timestamp: new Date(),
    updatedBy: preparedBy,
    notes: 'Started preparing item'
  });

  return this.save();
};

// Mark as ready
orderItemSchema.methods.markReady = async function(preparedBy = null) {
  if (this.status !== 'preparing') {
    throw new Error('Item must be preparing before marking ready');
  }

  this.status = 'ready';
  this.actualReadyTime = new Date();
  if (preparedBy) this.preparedBy = preparedBy;
  
  this.timeline.push({
    status: 'ready',
    timestamp: new Date(),
    updatedBy: preparedBy,
    notes: 'Item ready for serving'
  });

  return this.save();
};

// Mark as served
orderItemSchema.methods.markServed = async function(servedBy = null) {
  if (this.status !== 'ready') {
    throw new Error('Item must be ready before serving');
  }

  this.status = 'served';
  this.servedAt = new Date();
  if (servedBy) this.servedBy = servedBy;
  
  this.timeline.push({
    status: 'served',
    timestamp: new Date(),
    updatedBy: servedBy,
    notes: 'Item served to customer'
  });

  return this.save();
};

// Cancel item
orderItemSchema.methods.cancel = async function(reason, cancelledBy = null) {
  if (['served', 'cancelled'].includes(this.status)) {
    throw new Error('Cannot cancel served or already cancelled item');
  }

  this.status = 'cancelled';
  this.cancelReason = reason;
  this.cancelledAt = new Date();
  
  this.timeline.push({
    status: 'cancelled',
    timestamp: new Date(),
    updatedBy: cancelledBy,
    notes: `Item cancelled: ${reason}`
  });

  return this.save();
};

// Static Methods

// Find items by order
orderItemSchema.statics.findByOrder = function(orderId) {
  return this.find({ orderId })
    .populate('menuItemId', 'name image category')
    .sort({ createdAt: 1 })
    .lean();
};

// Find items in kitchen queue
orderItemSchema.statics.findKitchenQueue = function(status = ['confirmed', 'preparing']) {
  return this.find({
    status: { $in: Array.isArray(status) ? status : [status] }
  })
    .populate('orderId', 'orderNumber tableId customerId')
    .populate('menuItemId', 'name image category preparationTime')
    .sort({ estimatedReadyTime: 1 })
    .lean();
};

// Find delayed items
orderItemSchema.statics.findDelayed = function() {
  return this.find({
    status: { $in: ['confirmed', 'preparing'] },
    estimatedReadyTime: { $lt: new Date() }
  })
    .populate('orderId', 'orderNumber tableId')
    .populate('menuItemId', 'name')
    .sort({ estimatedReadyTime: 1 })
    .lean();
};

// Get item statistics
orderItemSchema.statics.getStatistics = async function(filters = {}) {
  const { startDate, endDate, menuItemId } = filters;
  
  const matchStage = { status: { $ne: 'cancelled' } };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  if (menuItemId) matchStage.menuItemId = mongoose.Types.ObjectId(menuItemId);

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalItems: { $sum: '$quantity' },
        totalRevenue: { $sum: '$finalPrice' },
        averagePrice: { $avg: '$finalPrice' },
        averagePrepTime: { $avg: '$preparationDuration' }
      }
    }
  ]);

  return stats[0] || {
    totalItems: 0,
    totalRevenue: 0,
    averagePrice: 0,
    averagePrepTime: 0
  };
};

const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = OrderItem;