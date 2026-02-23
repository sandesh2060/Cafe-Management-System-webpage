const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^[0-9]{10,15}$/, 'Please provide a valid phone number']
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'cashier', 'cook', 'waiter', 'customer'],
      default: 'customer',
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    },
    
    // ⭐ NEW: Restaurant reference for staff members
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: function() {
        // Required for staff roles (not customers)
        return ['admin', 'manager', 'cashier', 'cook', 'waiter'].includes(this.role);
      },
      index: true
    },
    
    // Employee-specific fields (for staff roles: admin, manager, cashier, cook, waiter)
    employeeId: {
      type: String,
      sparse: true,
      unique: true,
      trim: true
    },
    department: {
      type: String,
      trim: true,
      enum: ['Kitchen', 'Service', 'Management', 'Finance', 'Other'],
      default: function() {
        if (this.role === 'cook') return 'Kitchen';
        if (this.role === 'waiter') return 'Service';
        if (this.role === 'cashier') return 'Finance';
        if (this.role === 'admin' || this.role === 'manager') return 'Management';
        return 'Other';
      }
    },
    salary: {
      type: Number,
      min: 0
    },
    shiftTiming: {
      type: String,
      trim: true
    },
    joinDate: {
      type: Date,
      default: Date.now
    },

    // Waiter-specific fields
    assignedTables: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table'
    }],
    
    // Customer-specific fields
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: 0
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Common fields
    profileImage: {
      type: String,
      default: ''
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    lastLogin: {
      type: Date
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    refreshToken: String
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ employeeId: 1 });
userSchema.index({ status: 1 });
userSchema.index({ assignedTables: 1 });
userSchema.index({ restaurant: 1, role: 1 }); // ⭐ NEW: Compound index for restaurant queries

// Virtual for full name or display name
userSchema.virtual('displayName').get(function() {
  return this.name;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update lastLogin timestamp
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Check if user is staff
userSchema.methods.isStaff = function() {
  return ['admin', 'manager', 'cashier', 'cook', 'waiter'].includes(this.role);
};

// Check if user has management access
userSchema.methods.isManagement = function() {
  return ['admin', 'manager'].includes(this.role);
};

// Check if user is waiter
userSchema.methods.isWaiter = function() {
  return this.role === 'waiter';
};

// Check if user is manager
userSchema.methods.isManager = function() {
  return this.role === 'manager';
};

// Check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Get assigned table count
userSchema.methods.getAssignedTableCount = function() {
  return this.assignedTables ? this.assignedTables.length : 0;
};

// ⭐ NEW: Get user's restaurant ID
userSchema.methods.getRestaurantId = function() {
  return this.restaurant;
};

// Remove sensitive data before converting to JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpire;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;