// File: backend/src/modules/table/table.controller.js

const tableService = require('./table.service');
const tableDetectionService = require('./table-detection.service');
const { successResponse, errorResponse } = require('../../shared/utils/response');

class TableController {
  // ⭐ UPDATED: Match table by location with smart detection
  async matchLocation(req, res) {
    try {
      const { latitude, longitude, accuracy } = req.body;

      if (!latitude || !longitude) {
        return errorResponse(res, 'Latitude and longitude are required', 400);
      }

      console.log('📍 Matching location:', { latitude, longitude, accuracy });

      // Use the smart detection service
      const result = await tableDetectionService.findClosestTable(latitude, longitude, 15);

      // Multiple tables nearby - need selection
      if (result.needsSelection) {
        return res.json({
          success: true,
          needsSelection: true,
          matchedTables: result.tables.map(t => ({
            ...t.table.toObject(),
            distance: t.distance
          })),
          count: result.tables.length,
          message: result.message
        });
      }

      // Single table detected
      return res.json({
        success: true,
        matchedTables: [
          {
            ...result.table.toObject(),
            distance: result.distance
          }
        ],
        count: 1,
        message: 'Location matched',
        detection: {
          method: result.method,
          confidence: result.confidence,
          distance: result.distance
        },
        nearbyTables: result.nearbyTables?.map(t => ({
          ...t.table.toObject(),
          distance: t.distance
        }))
      });

    } catch (error) {
      console.error('❌ Location matching error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  // ⭐ NEW: Smart table detection endpoint
  async detectTable(req, res) {
    try {
      const { qrCode, latitude, longitude, tableNumber } = req.body;

      const result = await tableDetectionService.detectTable({
        qrCode,
        latitude,
        longitude,
        tableNumber
      });

      // If multiple tables found, return selection options
      if (result.needsSelection) {
        return res.json({
          success: true,
          needsSelection: true,
          tables: result.tables,
          message: result.message
        });
      }

      // Single table detected
      return res.json({
        success: true,
        table: result.table,
        detection: {
          method: result.method,
          confidence: result.confidence,
          distance: result.distance,
          nearbyTables: result.nearbyTables
        }
      });
    } catch (error) {
      console.error('❌ Table detection error:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // ⭐ NEW: Get nearby tables
  async getTablesNearby(req, res) {
    try {
      const { latitude, longitude, radius = 20 } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude required'
        });
      }

      const tables = await tableDetectionService.getTablesInRadius(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius)
      );

      return res.json({
        success: true,
        tables,
        count: tables.length
      });
    } catch (error) {
      console.error('❌ Get nearby tables error:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  async matchLocation(req, res) {
    try {
      const { latitude, longitude } = req.body;

      if (!latitude || !longitude) {
        return errorResponse(res, 'Latitude and longitude are required', 400);
      }

      const result = await tableService.matchByLocation(latitude, longitude);
      return successResponse(res, result, 'Location matched');
    } catch (error) {
      console.error('Location matching error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  // Get table by number
  async getByNumber(req, res) {
    try {
      const { tableNumber } = req.params;

      if (!tableNumber) {
        return errorResponse(res, 'Table number is required', 400);
      }

      const table = await tableService.getByNumber(tableNumber);
      return successResponse(res, { table }, 'Table found');
    } catch (error) {
      console.error('Get table by number error:', error);
      return errorResponse(res, error.message, 404);
    }
  }

  async getById(req, res) {
    try {
      const { tableId } = req.params;

      if (!tableId) {
        return errorResponse(res, 'Table ID is required', 400);
      }

      const table = await tableService.getById(tableId);
      return successResponse(res, { table }, 'Table found');
    } catch (error) {
      console.error('Get table by ID error:', error);
      return errorResponse(res, error.message, 404);
    }
  }

  async verifyQRCode(req, res) {
    try {
      const { tableId, restaurantId } = req.body;

      if (!tableId || !restaurantId) {
        return errorResponse(res, 'Table ID and Restaurant ID are required', 400);
      }

      const table = await tableService.getByQRCode(tableId, restaurantId);
      return successResponse(res, { table }, 'QR code verified');
    } catch (error) {
      console.error('QR verification error:', error);
      return errorResponse(res, error.message, 404);
    }
  }

  async getAll(req, res) {
    try {
      const { status, restaurantId } = req.query;
      const tables = await tableService.getAll({ status, restaurantId });
      return successResponse(res, { tables }, 'Tables retrieved');
    } catch (error) {
      console.error('Get all tables error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  async create(req, res) {
    try {
      const tableData = req.body;
      
      if (!tableData.restaurant && req.user && req.user.restaurant) {
        tableData.restaurant = req.user.restaurant;
        console.log(`📍 Auto-injected restaurant ID from user: ${tableData.restaurant}`);
      } else if (!tableData.restaurant) {
        console.log(`ℹ️ Creating table without restaurant assignment`);
      }
      
      const table = await tableService.create(tableData);
      return successResponse(res, { table }, 'Table created', 201);
    } catch (error) {
      console.error('Create table error:', error);
      
      if (error.message.includes('already exists')) {
        return errorResponse(res, error.message, 409);
      }
      
      if (error.message.includes('required') || 
          error.message.includes('Invalid') ||
          error.message.includes('must be')) {
        return errorResponse(res, error.message, 400);
      }
      
      return errorResponse(res, error.message, 500);
    }
  }

  async update(req, res) {
    try {
      const { tableId } = req.params;
      const updateData = req.body;
      const table = await tableService.update(tableId, updateData);
      return successResponse(res, { table }, 'Table updated');
    } catch (error) {
      console.error('Update table error:', error);
      
      if (error.message.includes('already exists')) {
        return errorResponse(res, error.message, 409);
      }
      
      if (error.message.includes('required') || error.message.includes('Invalid')) {
        return errorResponse(res, error.message, 400);
      }
      
      if (error.message.includes('not found')) {
        return errorResponse(res, error.message, 404);
      }
      
      return errorResponse(res, error.message, 500);
    }
  }

  async delete(req, res) {
    try {
      const { tableId } = req.params;
      await tableService.delete(tableId);
      return successResponse(res, null, 'Table deleted');
    } catch (error) {
      console.error('Delete table error:', error);
      
      if (error.message.includes('Cannot delete')) {
        return errorResponse(res, error.message, 400);
      }
      
      if (error.message.includes('not found')) {
        return errorResponse(res, error.message, 404);
      }
      
      return errorResponse(res, error.message, 500);
    }
  }

  async getStatus(req, res) {
    try {
      const { tableId } = req.params;
      const status = await tableService.getStatus(tableId);
      return successResponse(res, { status }, 'Status retrieved');
    } catch (error) {
      console.error('Get status error:', error);
      return errorResponse(res, error.message, 404);
    }
  }

  async updateStatus(req, res) {
    try {
      const { tableId } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return errorResponse(res, 'Status is required', 400);
      }
      
      const table = await tableService.updateStatus(tableId, status);
      return successResponse(res, { table }, 'Status updated');
    } catch (error) {
      console.error('Update status error:', error);
      
      if (error.message.includes('Invalid status')) {
        return errorResponse(res, error.message, 400);
      }
      
      return errorResponse(res, error.message, 500);
    }
  }

  async getQRCode(req, res) {
    try {
      const { tableId } = req.params;
      const qrCode = await tableService.getQRCode(tableId);
      return successResponse(res, { qrCode }, 'QR code retrieved');
    } catch (error) {
      console.error('Get QR code error:', error);
      return errorResponse(res, error.message, 404);
    }
  }

  async getActiveSession(req, res) {
    try {
      const { tableId } = req.params;
      const session = await tableService.getActiveSession(tableId);
      return successResponse(res, { session }, 'Session retrieved');
    } catch (error) {
      console.error('Get session error:', error);
      return errorResponse(res, error.message, 404);
    }
  }

  async assignCustomer(req, res) {
    try {
      const { tableId } = req.params;
      const { customerId } = req.body;
      
      if (!customerId) {
        return errorResponse(res, 'Customer ID is required', 400);
      }
      
      const table = await tableService.assignCustomer(tableId, customerId);
      return successResponse(res, { table }, 'Customer assigned to table');
    } catch (error) {
      console.error('Assign customer error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async releaseTable(req, res) {
    try {
      const { tableId } = req.params;
      const table = await tableService.releaseTable(tableId);
      return successResponse(res, { table }, 'Table released');
    } catch (error) {
      console.error('Release table error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  async getAvailableTables(req, res) {
    try {
      const { restaurantId } = req.query;
      
      if (!restaurantId) {
        return errorResponse(res, 'Restaurant ID is required', 400);
      }
      
      const tables = await tableService.getAvailableTables(restaurantId);
      return successResponse(res, { tables }, 'Available tables retrieved');
    } catch (error) {
      console.error('Get available tables error:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new TableController();