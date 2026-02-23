// File: backend/src/modules/zone/zone.controller.js
// 🌍 PRODUCTION-READY ZONE CONTROLLER

const zoneService = require('./zone.service');
const { successResponse, errorResponse } = require('../../shared/utils/response');

class ZoneController {
  /**
   * Create new zone
   * @route POST /api/zones
   */
  async createZone(req, res) {
    try {
      const zoneData = req.body;
      const createdBy = req.user?._id || req.body.createdBy;

      console.log('📝 Create zone request:', zoneData.name);

      if (!zoneData.name || !zoneData.location?.center) {
        return errorResponse(res, 'Zone name and center location are required', 400);
      }

      const zone = await zoneService.createZone(zoneData, createdBy);

      return successResponse(res, { zone }, 'Zone created successfully', 201);
    } catch (error) {
      console.error('❌ Create zone error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get all zones
   * @route GET /api/zones
   */
  async getAllZones(req, res) {
    try {
      const filters = {
        status: req.query.status,
        type: req.query.type
      };

      console.log('📥 Get all zones request');

      const zones = await zoneService.getAllZones(filters);

      console.log('✅ Zones retrieved:', zones.length);

      return successResponse(res, { zones, total: zones.length }, 'Zones retrieved successfully');
    } catch (error) {
      console.error('❌ Get zones error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get zone by ID
   * @route GET /api/zones/:id
   */
  async getZoneById(req, res) {
    try {
      const { id } = req.params;

      console.log('📥 Get zone by ID:', id);

      const zone = await zoneService.getZoneById(id);

      return successResponse(res, { zone }, 'Zone retrieved successfully');
    } catch (error) {
      console.error('❌ Get zone error:', error);
      
      if (error.message === 'Zone not found') {
        return errorResponse(res, error.message, 404);
      }
      
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Update zone
   * @route PUT /api/zones/:id
   */
  async updateZone(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedBy = req.user?._id || req.body.updatedBy;

      console.log('✏️ Update zone:', id);

      const zone = await zoneService.updateZone(id, updateData, updatedBy);

      return successResponse(res, { zone }, 'Zone updated successfully');
    } catch (error) {
      console.error('❌ Update zone error:', error);
      
      if (error.message === 'Zone not found') {
        return errorResponse(res, error.message, 404);
      }
      
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Delete zone
   * @route DELETE /api/zones/:id
   */
  async deleteZone(req, res) {
    try {
      const { id } = req.params;

      console.log('🗑️ Delete zone:', id);

      await zoneService.deleteZone(id);

      return successResponse(res, null, 'Zone deleted successfully');
    } catch (error) {
      console.error('❌ Delete zone error:', error);
      
      if (error.message === 'Zone not found') {
        return errorResponse(res, error.message, 404);
      }

      if (error.message.includes('active sessions')) {
        return errorResponse(res, error.message, 400);
      }
      
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Validate customer location
   * @route POST /api/zones/validate-location
   */
  async validateLocation(req, res) {
    try {
      const { latitude, longitude } = req.body;

      console.log('🔍 Validate location request:', { latitude, longitude });

      if (!latitude || !longitude) {
        return errorResponse(res, 'Latitude and longitude are required', 400);
      }

      const result = await zoneService.validateCustomerLocation(latitude, longitude);

      if (!result.isValid) {
        return res.status(200).json({
          success: false,
          isValid: false,
          zones: [],
          message: result.message
        });
      }

      return successResponse(res, result, 'Location validated successfully');
    } catch (error) {
      console.error('❌ Validate location error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Check if customer is in zone
   * @route POST /api/zones/check-customer
   */
  async checkCustomerInZone(req, res) {
    try {
      const { customerId, zoneId, location } = req.body;

      console.log('🔍 Check customer in zone:', { customerId, zoneId });

      if (!customerId || !zoneId || !location) {
        return errorResponse(res, 'Customer ID, zone ID, and location are required', 400);
      }

      const result = await zoneService.checkCustomerInZone(customerId, zoneId, location);

      return successResponse(res, result, 'Customer zone check completed');
    } catch (error) {
      console.error('❌ Check customer in zone error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get zone statistics
   * @route GET /api/zones/:id/statistics
   */
  async getZoneStatistics(req, res) {
    try {
      const { id } = req.params;

      console.log('📊 Get zone statistics:', id);

      const stats = await zoneService.getZoneStatistics(id);

      return successResponse(res, stats, 'Zone statistics retrieved successfully');
    } catch (error) {
      console.error('❌ Get zone statistics error:', error);
      
      if (error.message === 'Zone not found') {
        return errorResponse(res, error.message, 404);
      }
      
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Find nearest zone
   * @route POST /api/zones/nearest
   */
  async findNearestZone(req, res) {
    try {
      const { latitude, longitude } = req.body;

      console.log('🔍 Find nearest zone:', { latitude, longitude });

      if (!latitude || !longitude) {
        return errorResponse(res, 'Latitude and longitude are required', 400);
      }

      const zone = await zoneService.findNearestZone(latitude, longitude);

      if (!zone) {
        return errorResponse(res, 'No zones found nearby', 404);
      }

      return successResponse(res, { zone }, 'Nearest zone found');
    } catch (error) {
      console.error('❌ Find nearest zone error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Assign tables to zone
   * @route POST /api/zones/:id/tables
   */
  async assignTables(req, res) {
    try {
      const { id } = req.params;
      const { tableIds } = req.body;

      console.log('📋 Assign tables to zone:', id, tableIds?.length);

      if (!Array.isArray(tableIds)) {
        return errorResponse(res, 'Table IDs must be an array', 400);
      }

      const zone = await zoneService.assignTablesToZone(id, tableIds);

      return successResponse(res, { zone }, 'Tables assigned successfully');
    } catch (error) {
      console.error('❌ Assign tables error:', error);
      
      if (error.message === 'Zone not found') {
        return errorResponse(res, error.message, 404);
      }
      
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Update zone settings
   * @route PATCH /api/zones/:id/settings
   */
  async updateSettings(req, res) {
    try {
      const { id } = req.params;
      const settings = req.body;
      const updatedBy = req.user?._id || req.body.updatedBy;

      console.log('⚙️ Update zone settings:', id);

      const zone = await zoneService.updateZoneSettings(id, settings, updatedBy);

      return successResponse(res, { zone }, 'Zone settings updated successfully');
    } catch (error) {
      console.error('❌ Update zone settings error:', error);
      
      if (error.message === 'Zone not found') {
        return errorResponse(res, error.message, 404);
      }
      
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get zones by type
   * @route GET /api/zones/type/:type
   */
  async getZonesByType(req, res) {
    try {
      const { type } = req.params;

      console.log('📥 Get zones by type:', type);

      const zones = await zoneService.getZonesByType(type);

      return successResponse(res, { zones, total: zones.length }, 'Zones retrieved successfully');
    } catch (error) {
      console.error('❌ Get zones by type error:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new ZoneController();