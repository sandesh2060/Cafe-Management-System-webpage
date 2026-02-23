// File: backend/src/modules/zone/zone.service.js
// 🌍 PRODUCTION-READY ZONE SERVICE

const Zone = require('./zone.model');
const Customer = require('../customer/customer.model');

class ZoneService {
  /**
   * Create new zone
   */
  async createZone(zoneData, createdBy) {
    try {
      const zone = await Zone.create({
        ...zoneData,
        createdBy
      });

      console.log('✅ Zone created:', zone.name);
      return zone;
    } catch (error) {
      console.error('❌ Create zone error:', error);
      throw error;
    }
  }

  /**
   * Get all zones
   */
  async getAllZones(filters = {}) {
    try {
      const query = {};
      
      if (filters.status) query.status = filters.status;
      if (filters.type) query.type = filters.type;

      const zones = await Zone.find(query)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .populate('tables', 'tableNumber capacity')
        .sort({ createdAt: -1 });

      return zones;
    } catch (error) {
      console.error('❌ Get zones error:', error);
      throw error;
    }
  }

  /**
   * Get zone by ID
   */
  async getZoneById(zoneId) {
    try {
      const zone = await Zone.findById(zoneId)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .populate('tables', 'tableNumber capacity status');

      if (!zone) {
        throw new Error('Zone not found');
      }

      return zone;
    } catch (error) {
      console.error('❌ Get zone error:', error);
      throw error;
    }
  }

  /**
   * Update zone
   */
  async updateZone(zoneId, updateData, updatedBy) {
    try {
      const zone = await Zone.findByIdAndUpdate(
        zoneId,
        { ...updateData, updatedBy, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('createdBy updatedBy tables');

      if (!zone) {
        throw new Error('Zone not found');
      }

      console.log('✅ Zone updated:', zone.name);
      return zone;
    } catch (error) {
      console.error('❌ Update zone error:', error);
      throw error;
    }
  }

  /**
   * Delete zone
   */
  async deleteZone(zoneId) {
    try {
      const zone = await Zone.findById(zoneId);

      if (!zone) {
        throw new Error('Zone not found');
      }

      // Check if zone has active sessions
      if (zone.stats.activeSessions > 0) {
        throw new Error('Cannot delete zone with active sessions');
      }

      await zone.deleteOne();
      console.log('✅ Zone deleted:', zone.name);
      
      return true;
    } catch (error) {
      console.error('❌ Delete zone error:', error);
      throw error;
    }
  }

  /**
   * Validate customer location
   */
  async validateCustomerLocation(latitude, longitude) {
    try {
      console.log('🔍 Validating location:', { latitude, longitude });

      // Find all zones containing this point
      const zones = await Zone.findZonesContainingPoint(latitude, longitude);

      // Filter zones that allow login
      const validZones = zones.filter(zone => 
        zone.status === 'active' && 
        zone.settings.allowLogin &&
        zone.isAcceptingCustomers
      );

      if (validZones.length === 0) {
        console.log('❌ No valid zones found for location');
        return {
          isValid: false,
          zones: [],
          message: 'You are outside the cafe zone. Please come closer to login.'
        };
      }

      console.log('✅ Valid zones found:', validZones.length);
      return {
        isValid: true,
        zones: validZones,
        primaryZone: validZones[0],
        message: 'Location validated successfully'
      };
    } catch (error) {
      console.error('❌ Validate location error:', error);
      throw error;
    }
  }

  /**
   * Check if customer is still in zone
   */
  async checkCustomerInZone(customerId, zoneId, currentLocation) {
    try {
      const zone = await Zone.findById(zoneId);

      if (!zone) {
        return {
          inZone: false,
          shouldLogout: true,
          reason: 'Zone not found'
        };
      }

      // Check if zone is still active
      if (zone.status !== 'active') {
        return {
          inZone: false,
          shouldLogout: true,
          reason: 'Zone is no longer active'
        };
      }

      // Check location
      const { latitude, longitude } = currentLocation;
      const isInside = zone.location.polygon && zone.location.polygon.length >= 3
        ? zone.isPointInPolygon(latitude, longitude)
        : zone.isPointInside(latitude, longitude);

      if (!isInside) {
        return {
          inZone: false,
          shouldLogout: zone.settings.autoLogout,
          gracePeriod: zone.settings.logoutGracePeriod,
          reason: 'Customer left the zone'
        };
      }

      return {
        inZone: true,
        shouldLogout: false,
        zone: zone
      };
    } catch (error) {
      console.error('❌ Check customer in zone error:', error);
      throw error;
    }
  }

  /**
   * Get zone statistics
   */
  async getZoneStatistics(zoneId) {
    try {
      const zone = await Zone.findById(zoneId);

      if (!zone) {
        throw new Error('Zone not found');
      }

      // Get additional statistics
      const customers = await Customer.find({
        'lastKnownLocation.zoneId': zoneId
      });

      return {
        zone: {
          id: zone._id,
          name: zone.name,
          type: zone.type,
          status: zone.status
        },
        stats: zone.stats,
        capacity: {
          current: zone.stats.activeSessions,
          maximum: zone.settings.maxConcurrentSessions,
          percentage: (zone.stats.activeSessions / zone.settings.maxConcurrentSessions * 100).toFixed(1)
        },
        customers: customers.length
      };
    } catch (error) {
      console.error('❌ Get zone statistics error:', error);
      throw error;
    }
  }

  /**
   * Find nearest zone to location
   */
  async findNearestZone(latitude, longitude) {
    try {
      const zone = await Zone.findNearestZone(latitude, longitude);
      return zone;
    } catch (error) {
      console.error('❌ Find nearest zone error:', error);
      throw error;
    }
  }

  /**
   * Assign tables to zone
   */
  async assignTablesToZone(zoneId, tableIds) {
    try {
      const zone = await Zone.findById(zoneId);

      if (!zone) {
        throw new Error('Zone not found');
      }

      zone.tables = tableIds;
      await zone.save();

      console.log('✅ Tables assigned to zone:', tableIds.length);
      return zone;
    } catch (error) {
      console.error('❌ Assign tables error:', error);
      throw error;
    }
  }

  /**
   * Update zone settings
   */
  async updateZoneSettings(zoneId, settings, updatedBy) {
    try {
      const zone = await Zone.findById(zoneId);

      if (!zone) {
        throw new Error('Zone not found');
      }

      zone.settings = { ...zone.settings, ...settings };
      zone.updatedBy = updatedBy;
      await zone.save();

      console.log('✅ Zone settings updated');
      return zone;
    } catch (error) {
      console.error('❌ Update zone settings error:', error);
      throw error;
    }
  }

  /**
   * Get zones by type
   */
  async getZonesByType(type) {
    try {
      const zones = await Zone.find({ type, status: 'active' })
        .sort({ createdAt: -1 });

      return zones;
    } catch (error) {
      console.error('❌ Get zones by type error:', error);
      throw error;
    }
  }
}

module.exports = new ZoneService();