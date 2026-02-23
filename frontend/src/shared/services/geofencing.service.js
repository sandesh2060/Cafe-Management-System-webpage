// File: frontend/src/shared/services/geofencing.service.js
// 🌍 PRODUCTION-READY GEOFENCING SERVICE

class GeofencingService {
  constructor() {
    this.watchId = null;
    this.currentPosition = null;
    this.currentZone = null;
    this.isTracking = false;
    this.callbacks = {
      onLocationUpdate: [],
      onZoneEnter: [],
      onZoneExit: [],
      onError: []
    };
    this.checkInterval = null;
    this.exitGraceTimer = null;
  }

  /**
   * Initialize geofencing
   */
  async initialize() {
    try {
      console.log('🌍 Initializing geofencing service...');

      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // Request permission
      const permission = await this.requestPermission();
      
      if (!permission) {
        throw new Error('Location permission denied');
      }

      console.log('✅ Geofencing service initialized');
      return true;
    } catch (error) {
      console.error('❌ Geofencing init error:', error);
      this.triggerCallbacks('onError', error);
      throw error;
    }
  }

  /**
   * Request location permission
   */
  async requestPermission() {
    try {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.currentPosition = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            };
            console.log('✅ Location permission granted');
            resolve(true);
          },
          (error) => {
            console.error('❌ Location permission error:', error);
            reject(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Start tracking customer location
   */
  startTracking(options = {}) {
    try {
      if (this.isTracking) {
        console.log('⚠️ Already tracking location');
        return;
      }

      const {
        checkInterval = 5000, // Check every 5 seconds
        enableHighAccuracy = true,
        timeout = 10000,
        maximumAge = 0
      } = options;

      console.log('🚀 Starting location tracking...');

      // Watch position changes
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.handlePositionUpdate(position);
        },
        (error) => {
          this.handlePositionError(error);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge
        }
      );

      // Periodic zone check
      this.checkInterval = setInterval(() => {
        if (this.currentPosition && this.currentZone) {
          this.checkZoneBoundary();
        }
      }, checkInterval);

      this.isTracking = true;
      console.log('✅ Location tracking started');

      return true;
    } catch (error) {
      console.error('❌ Start tracking error:', error);
      this.triggerCallbacks('onError', error);
      return false;
    }
  }

  /**
   * Stop tracking location
   */
  stopTracking() {
    try {
      console.log('🛑 Stopping location tracking...');

      if (this.watchId) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }

      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }

      if (this.exitGraceTimer) {
        clearTimeout(this.exitGraceTimer);
        this.exitGraceTimer = null;
      }

      this.isTracking = false;
      console.log('✅ Location tracking stopped');

      return true;
    } catch (error) {
      console.error('❌ Stop tracking error:', error);
      return false;
    }
  }

  /**
   * Handle position update
   */
  handlePositionUpdate(position) {
    this.currentPosition = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp
    };

    console.log('📍 Location updated:', this.currentPosition);
    this.triggerCallbacks('onLocationUpdate', this.currentPosition);
  }

  /**
   * Handle position error
   */
  handlePositionError(error) {
    console.error('❌ Position error:', error);
    
    const errorMessage = {
      1: 'Location permission denied',
      2: 'Location unavailable',
      3: 'Location request timeout'
    }[error.code] || 'Unknown location error';

    this.triggerCallbacks('onError', new Error(errorMessage));
  }

  /**
   * Check if still in zone
   */
  async checkZoneBoundary() {
    try {
      if (!this.currentPosition || !this.currentZone) {
        return;
      }

      const response = await fetch('/api/zones/check-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: localStorage.getItem('customerId'),
          zoneId: this.currentZone.id,
          location: {
            latitude: this.currentPosition.latitude,
            longitude: this.currentPosition.longitude
          }
        })
      });

      const data = await response.json();

      if (data.success && data.data) {
        if (!data.data.inZone) {
          this.handleZoneExit(data.data);
        }
      }
    } catch (error) {
      console.error('❌ Zone boundary check error:', error);
    }
  }

  /**
   * Validate current location against zones
   */
  async validateLocation() {
    try {
      if (!this.currentPosition) {
        await this.requestPermission();
      }

      const response = await fetch('/api/zones/validate-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: this.currentPosition.latitude,
          longitude: this.currentPosition.longitude
        })
      });

      const data = await response.json();

      if (data.success && data.data.isValid) {
        this.currentZone = {
          id: data.data.primaryZone._id,
          name: data.data.primaryZone.name,
          settings: data.data.primaryZone.settings
        };
        this.triggerCallbacks('onZoneEnter', this.currentZone);
        return { isValid: true, zone: this.currentZone };
      }

      return { isValid: false, message: data.message || data.data?.message };
    } catch (error) {
      console.error('❌ Validate location error:', error);
      return { isValid: false, message: error.message };
    }
  }

  /**
   * Handle zone exit
   */
  handleZoneExit(exitData) {
    console.log('🚪 Customer exiting zone:', exitData);

    if (exitData.shouldLogout) {
      const gracePeriod = exitData.gracePeriod || 0;

      if (gracePeriod > 0) {
        console.log(`⏰ Grace period: ${gracePeriod}s before logout`);
        
        this.exitGraceTimer = setTimeout(() => {
          this.triggerCallbacks('onZoneExit', {
            zone: this.currentZone,
            reason: exitData.reason
          });
          this.currentZone = null;
        }, gracePeriod * 1000);
      } else {
        this.triggerCallbacks('onZoneExit', {
          zone: this.currentZone,
          reason: exitData.reason
        });
        this.currentZone = null;
      }
    }
  }

  /**
   * Get current location
   */
  getCurrentLocation() {
    return this.currentPosition;
  }

  /**
   * Get current zone
   */
  getCurrentZone() {
    return this.currentZone;
  }

  /**
   * Register callback
   */
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  /**
   * Unregister callback
   */
  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Trigger callbacks
   */
  triggerCallbacks(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Callback error for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }
}

// Singleton instance
const geofencingService = new GeofencingService();

export default geofencingService;