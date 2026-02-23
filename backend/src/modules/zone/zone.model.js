// File: backend/src/modules/zone/zone.model.js
// 🌍 PRODUCTION-READY GEOFENCING ZONE MODEL

const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  // Zone basic info
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },

  // Zone type
  type: {
    type: String,
    enum: ['cafe', 'dining_area', 'terrace', 'parking', 'custom'],
    default: 'cafe',
    required: true
  },

  // Geofencing data
  location: {
    // Center point of the zone
    center: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      }
    },
    
    // Radius in meters
    radius: {
      type: Number,
      required: true,
      min: 10,
      max: 1000,
      default: 50 // 50 meters default
    },

    // Optional: Polygon coordinates for complex shapes
    polygon: [{
      latitude: Number,
      longitude: Number
    }],

    // Address details
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    }
  },

  // Zone settings
  settings: {
    // Allow customer login in this zone
    allowLogin: {
      type: Boolean,
      default: true
    },

    // Auto-logout when customer leaves
    autoLogout: {
      type: Boolean,
      default: true
    },

    // Grace period before logout (seconds)
    logoutGracePeriod: {
      type: Number,
      default: 30, // 30 seconds
      min: 0,
      max: 300
    },

    // Require location permission
    requireLocation: {
      type: Boolean,
      default: true
    },

    // WiFi SSID for additional validation
    wifiSSID: {
      type: String,
      trim: true
    },

    // Maximum concurrent sessions in zone
    maxConcurrentSessions: {
      type: Number,
      default: 100,
      min: 1
    }
  },

  // Zone status
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },

  // Statistics
  stats: {
    totalSessions: {
      type: Number,
      default: 0
    },
    activeSessions: {
      type: Number,
      default: 0
    },
    totalCustomers: {
      type: Number,
      default: 0
    },
    averageSessionDuration: {
      type: Number,
      default: 0 // in minutes
    },
    lastActivity: Date
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Integration with tables
  tables: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
zoneSchema.index({ 'location.center': '2dsphere' });
zoneSchema.index({ status: 1 });
zoneSchema.index({ type: 1 });
zoneSchema.index({ createdAt: -1 });

// Virtual: Is zone currently accepting customers
zoneSchema.virtual('isAcceptingCustomers').get(function() {
  return this.status === 'active' && 
         this.settings.allowLogin &&
         this.stats.activeSessions < this.settings.maxConcurrentSessions;
});

// Method: Check if point is inside zone (circular)
zoneSchema.methods.isPointInside = function(latitude, longitude) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = this.location.center.latitude * Math.PI / 180;
  const φ2 = latitude * Math.PI / 180;
  const Δφ = (latitude - this.location.center.latitude) * Math.PI / 180;
  const Δλ = (longitude - this.location.center.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const distance = R * c; // Distance in meters

  return distance <= this.location.radius;
};

// Method: Check if point is inside polygon zone
zoneSchema.methods.isPointInPolygon = function(latitude, longitude) {
  if (!this.location.polygon || this.location.polygon.length < 3) {
    return false;
  }

  const polygon = this.location.polygon;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].latitude;
    const yi = polygon[i].longitude;
    const xj = polygon[j].latitude;
    const yj = polygon[j].longitude;

    const intersect = ((yi > longitude) !== (yj > longitude)) &&
      (latitude < (xj - xi) * (longitude - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }

  return inside;
};

// Method: Increment active sessions
zoneSchema.methods.incrementSessions = async function() {
  this.stats.activeSessions += 1;
  this.stats.totalSessions += 1;
  this.stats.lastActivity = new Date();
  await this.save();
};

// Method: Decrement active sessions
zoneSchema.methods.decrementSessions = async function() {
  this.stats.activeSessions = Math.max(0, this.stats.activeSessions - 1);
  this.stats.lastActivity = new Date();
  await this.save();
};

// Static: Find zones containing point
zoneSchema.statics.findZonesContainingPoint = async function(latitude, longitude) {
  const zones = await this.find({ status: 'active' });
  
  const containingZones = zones.filter(zone => {
    if (zone.location.polygon && zone.location.polygon.length >= 3) {
      return zone.isPointInPolygon(latitude, longitude);
    }
    return zone.isPointInside(latitude, longitude);
  });

  return containingZones;
};

// Static: Get nearest zone
zoneSchema.statics.findNearestZone = async function(latitude, longitude, maxDistance = 1000) {
  const zones = await this.find({
    status: 'active',
    'location.center': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });

  return zones[0] || null;
};

const Zone = mongoose.model('Zone', zoneSchema);

module.exports = Zone;