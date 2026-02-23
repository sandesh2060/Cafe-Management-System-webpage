// File: backend/src/modules/table/table.model.js

const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'Table number is required'],
    trim: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: [true, 'Table capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  status: {
    type: String,
    enum: {
      values: ['available', 'occupied', 'reserved'],
      message: '{VALUE} is not a valid status'
    },
    default: 'available'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Location coordinates are required'],
      validate: {
        validator: function(coords) {
          return coords.length === 2 &&
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Invalid coordinates format. Must be [longitude, latitude]'
      }
    }
  },
  // Detection radius in metres. Default = 3ft (0.9144m).
  // Manager sets this per table — tighter for densely packed tables.
  radius: {
    type: Number,
    default: 0.9144,
    min: [0.5, 'Radius must be at least 0.5 metres'],
    max: [50, 'Radius cannot exceed 50 metres']
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: false,
    default: null
  },
  currentCustomer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  qrCode: {
    type: String,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// INDEXES
// ============================================

tableSchema.index({ location: '2dsphere' });
tableSchema.index({ status: 1 });
tableSchema.index({ isActive: 1 });

// ============================================
// VIRTUALS
// ============================================

tableSchema.virtual('isAvailable').get(function() {
  return this.status === 'available' && this.isActive;
});

// ============================================
// MIDDLEWARE
// ============================================

tableSchema.pre('save', function(next) {
  if (this.number) {
    this.number = this.number.toUpperCase().trim();
  }
  next();
});

tableSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    if (error.keyPattern.number) {
      next(new Error('Table number already exists'));
    } else if (error.keyPattern.qrCode) {
      next(new Error('QR code already exists'));
    } else {
      next(new Error('Duplicate entry detected'));
    }
  } else {
    next(error);
  }
});

// ============================================
// STATIC METHODS
// ============================================

tableSchema.statics.findByNumber = async function(number) {
  return this.findOne({
    number: number.toUpperCase().trim(),
    isActive: true
  });
};

tableSchema.statics.isNumberTaken = async function(number, excludeId = null) {
  const query = {
    number: number.toUpperCase().trim(),
    isActive: true
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const exists = await this.findOne(query);
  return !!exists;
};

tableSchema.statics.getAvailable = async function(restaurantId = null) {
  const query = {
    status: 'available',
    isActive: true
  };

  if (restaurantId) {
    query.restaurant = restaurantId;
  }

  return this.find(query).sort({ number: 1 });
};

// ============================================
// INSTANCE METHODS
// ============================================

tableSchema.methods.updateStatus = async function(newStatus) {
  const validStatuses = ['available', 'occupied', 'reserved'];

  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  this.status = newStatus;

  if (newStatus === 'available') {
    this.currentCustomer = null;
  }

  return this.save();
};

tableSchema.methods.assignCustomer = async function(customerId) {
  this.currentCustomer = customerId;
  this.status = 'occupied';
  return this.save();
};

tableSchema.methods.release = async function() {
  this.currentCustomer = null;
  this.status = 'available';
  return this.save();
};

module.exports = mongoose.model('Table', tableSchema);