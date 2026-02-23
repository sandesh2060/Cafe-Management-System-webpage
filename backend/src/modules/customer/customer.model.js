// ================================================================
// FILE: backend/src/modules/customer/customer.model.js
// 👥 CUSTOMER MODEL - COMPLETE & PRODUCTION READY
// ✅ Supports both single and multiple face embeddings
// ✅ Biometric authentication (face + fingerprint)
// ✅ Session management
// ✅ Loyalty tracking
// ✅ Cart & favorites
// ================================================================

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  // ============================================
  // BASIC INFORMATION
  // ============================================
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  
  displayName: {
    type: String,
    trim: true,
  },
  
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true, // Allows multiple null values
  },
  
  phone: {
    type: String,
    trim: true,
    sparse: true,
  },

  // ============================================
  // BIOMETRIC DATA
  // ============================================
  biometric: {
    // Face Recognition
    face: {
      // SUPPORTS BOTH MODES:
      // 1. Single embedding (backward compatible)
      embedding: {
        type: [Number], // 128-dimensional face descriptor
        default: null,
      },
      
      // 2. Multiple embeddings (ultra-strict mode)
      embeddings: {
        type: [[Number]], // Array of 128-dimensional descriptors
        default: []
      },
      
      version: {
        type: String,
        default: '1.0',
      },
      lastUpdated: {
        type: Date,
        default: null,
      },
      registrationCount: {
        type: Number,
        default: 0,
      },
      registeredAt: {
        type: Date,
        default: null,
      },
      sampleCount: {
        type: Number,
        default: 0
      },
      quality: {
        score: {
          type: Number,
          default: 0
        },
        variance: {
          type: Number,
          default: 0
        },
        consistency: {
          type: Number,
          default: 0
        }
      }
    },
    
    // Fingerprint (WebAuthn)
    fingerprint: {
      credentialId: String,
      publicKey: String,
      counter: {
        type: Number,
        default: 0,
      },
      registeredAt: Date,
    },
    
    // Login History
    loginHistory: [{
      method: {
        type: String,
        enum: ['face', 'fingerprint', 'manual'],
      },
      success: Boolean,
      confidence: Number, // For face recognition
      timestamp: {
        type: Date,
        default: Date.now,
      },
      tableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
      },
    }],
  },

  // ============================================
  // SESSION & TABLE TRACKING
  // ============================================
  currentSession: {
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
    },
    sessionId: String,
    startedAt: Date,
    isActive: {
      type: Boolean,
      default: false,
    },
  },

  // ============================================
  // LOYALTY & ENGAGEMENT
  // ============================================
  loyaltyPoints: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  visitCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  totalSpent: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  totalOrders: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  averageOrderValue: {
    type: Number,
    default: 0,
    min: 0,
  },

  // ============================================
  // CART
  // ============================================
  cart: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 99,
      default: 1,
    },
    customizations: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],

  // ============================================
  // FAVORITES (for recommendations)
  // ============================================
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
  }],

  // ============================================
  // PREFERENCES
  // ============================================
  preferences: {
    dietaryRestrictions: [String],
    allergens: [String],
  },

  // ============================================
  // STATUS
  // ============================================
  isGuest: {
    type: Boolean,
    default: false,
  },
  
  isActive: {
    type: Boolean,
    default: true,
  },
  
  lastLogin: {
    type: Date,
    default: null,
  },

}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// ============================================
// INDEXES
// ============================================
customerSchema.index({ email: 1 }, { sparse: true });
customerSchema.index({ phone: 1 }, { sparse: true });
customerSchema.index({ 'biometric.face.embedding': 1 });
customerSchema.index({ 'biometric.face.embeddings': 1 });
customerSchema.index({ 'biometric.fingerprint.credentialId': 1 });
customerSchema.index({ createdAt: -1 });
customerSchema.index({ username: 1 }, { unique: true });

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Register face embedding(s) for this customer
 * Supports both single embedding and multiple embeddings
 * @param {Array} embeddings - Array of face descriptors or array containing single descriptor
 * @param {Object} qualityInfo - Optional quality metadata
 */
customerSchema.methods.registerFace = async function(embeddings, qualityInfo = {}) {
  if (!Array.isArray(embeddings)) {
    throw new Error('Embeddings must be an array');
  }

  // Initialize biometric structure if needed
  if (!this.biometric) {
    this.biometric = {};
  }
  
  if (!this.biometric.face) {
    this.biometric.face = {};
  }

  // Determine if single or multiple embeddings
  if (embeddings.length === 1 && embeddings[0].length === 128) {
    // Single embedding mode (backward compatible)
    console.log('📸 Registering single face embedding');
    this.biometric.face.embedding = embeddings[0];
    this.biometric.face.embeddings = []; // Clear multi-mode
    this.biometric.face.version = '1.0-single';
    this.biometric.face.sampleCount = 1;
  } else if (embeddings.length > 1 && embeddings[0].length === 128) {
    // Multiple embeddings mode (ultra-strict)
    console.log(`📸 Registering ${embeddings.length} face embeddings`);
    this.biometric.face.embeddings = embeddings;
    this.biometric.face.embedding = null; // Clear single-mode
    this.biometric.face.version = '2.0-ultra';
    this.biometric.face.sampleCount = embeddings.length;
    
    // Store quality info if provided
    if (qualityInfo) {
      this.biometric.face.quality = {
        score: qualityInfo.score || 0,
        variance: qualityInfo.variance || 0,
        consistency: qualityInfo.consistency || 0
      };
    }
  } else {
    throw new Error('Invalid embeddings format');
  }

  this.biometric.face.lastUpdated = new Date();
  this.biometric.face.registrationCount = (this.biometric.face.registrationCount || 0) + 1;
  
  if (!this.biometric.face.registeredAt) {
    this.biometric.face.registeredAt = new Date();
  }

  await this.save();
  
  console.log(`✅ Face registered for customer: ${this.username} (${this.biometric.face.sampleCount} samples)`);
  return this;
};

/**
 * Start a new session for this customer
 */
customerSchema.methods.startSession = async function(tableId, sessionId) {
  this.currentSession = {
    tableId,
    sessionId,
    startedAt: new Date(),
    isActive: true,
  };
  
  this.lastLogin = new Date();
  
  // Safely increment visitCount
  if (typeof this.visitCount !== 'number' || isNaN(this.visitCount)) {
    this.visitCount = 1;
  } else {
    this.visitCount += 1;
  }
  
  await this.save();
  
  console.log(`✅ Session started for ${this.username}: ${sessionId}`);
  return this;
};

/**
 * End current session
 */
customerSchema.methods.endSession = async function() {
  if (this.currentSession.isActive) {
    this.currentSession.isActive = false;
    await this.save();
    console.log(`✅ Session ended for ${this.username}`);
  }
  return this;
};

/**
 * Log a biometric login attempt
 */
customerSchema.methods.logBiometricLogin = async function(method, success, confidence = null) {
  const loginEntry = {
    method,
    success,
    confidence,
    timestamp: new Date(),
    tableId: this.currentSession?.tableId || null,
  };

  if (!this.biometric.loginHistory) {
    this.biometric.loginHistory = [];
  }

  this.biometric.loginHistory.push(loginEntry);
  
  // Keep only last 100 login attempts
  if (this.biometric.loginHistory.length > 100) {
    this.biometric.loginHistory = this.biometric.loginHistory.slice(-100);
  }

  await this.save();
  return this;
};

/**
 * Add loyalty points
 */
customerSchema.methods.addLoyaltyPoints = async function(points) {
  this.loyaltyPoints += points;
  await this.save();
  console.log(`✅ Added ${points} loyalty points to ${this.username}`);
  return this;
};

/**
 * Track spending
 */
customerSchema.methods.addSpending = async function(amount) {
  this.totalSpent = (this.totalSpent || 0) + amount;
  this.totalOrders = (this.totalOrders || 0) + 1;
  this.averageOrderValue = this.totalSpent / this.totalOrders;
  await this.save();
  return this;
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Find customer by face embedding (backward compatible)
 */
customerSchema.statics.findByFaceEmbedding = async function(embedding, threshold = 0.6) {
  const customers = await this.find({
    $or: [
      { 'biometric.face.embedding': { $exists: true, $ne: null } },
      { 'biometric.face.embeddings.0': { $exists: true } }
    ]
  });

  let bestMatch = null;
  let bestDistance = Infinity;

  for (const customer of customers) {
    // Check single embedding
    if (customer.biometric.face.embedding) {
      const distance = calculateEuclideanDistance(embedding, customer.biometric.face.embedding);
      
      if (distance < bestDistance && distance < threshold) {
        bestDistance = distance;
        bestMatch = customer;
      }
    }
    
    // Check multiple embeddings
    if (customer.biometric.face.embeddings && customer.biometric.face.embeddings.length > 0) {
      for (const storedEmbedding of customer.biometric.face.embeddings) {
        const distance = calculateEuclideanDistance(embedding, storedEmbedding);
        
        if (distance < bestDistance && distance < threshold) {
          bestDistance = distance;
          bestMatch = customer;
        }
      }
    }
  }

  return bestMatch ? { customer: bestMatch, distance: bestDistance } : null;
};

/**
 * Find customer by fingerprint credential
 */
customerSchema.statics.findByFingerprint = async function(credentialId) {
  return this.findOne({
    'biometric.fingerprint.credentialId': credentialId,
  });
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate Euclidean distance between two vectors
 */
function calculateEuclideanDistance(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) {
    return Infinity;
  }

  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    const diff = vec1[i] - vec2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// ============================================
// PRE-SAVE HOOKS
// ============================================

customerSchema.pre('save', function(next) {
  // Update guest status based on contact info
  if (!this.email && !this.phone) {
    this.isGuest = true;
  } else {
    this.isGuest = false;
  }
  
  next();
});

// ============================================
// VIRTUAL PROPERTIES
// ============================================

customerSchema.virtual('hasFaceData').get(function() {
  return !!(
    (this.biometric?.face?.embeddings?.length > 0) || 
    (this.biometric?.face?.embedding)
  );
});

// Ensure virtuals are included in JSON
customerSchema.set('toJSON', { virtuals: true });
customerSchema.set('toObject', { virtuals: true });

// ============================================
// EXPORT MODEL
// ============================================

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;