// File: backend/src/modules/table/table.service.js

const Table = require('./table.model');
const mongoose = require('mongoose');

class TableService {
  // ============================================
  // CREATE
  // ============================================
  
  async create(tableData) {
    try {
      const { number } = tableData;

      // ⭐ UPDATED: Simple duplicate check (no restaurant context)
      const existingTable = await Table.findByNumber(number);
      if (existingTable) {
        throw new Error('Table number already exists');
      }

      // Generate QR code if not provided
      if (!tableData.qrCode) {
        tableData.qrCode = `QR-TABLE-${number}-${Date.now()}`;
      }

      const table = await Table.create(tableData);
      return table;
    } catch (error) {
      // Handle mongoose validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(e => e.message);
        throw new Error(messages.join(', '));
      }
      
      // Handle duplicate key errors
      if (error.code === 11000) {
        throw new Error('Table number already exists');
      }
      
      throw error;
    }
  }

  // ============================================
  // READ
  // ============================================

  async getAll(filters = {}) {
    try {
      const query = { isActive: true };

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.restaurantId) {
        query.restaurant = filters.restaurantId;
      }

      const tables = await Table.find(query)
        .populate('restaurant', 'name')
        .populate('currentCustomer', 'name email')
        .sort({ number: 1 });

      return tables;
    } catch (error) {
      throw new Error(`Error fetching tables: ${error.message}`);
    }
  }

  async getById(tableId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(tableId)) {
        throw new Error('Invalid table ID format');
      }

      const table = await Table.findOne({ _id: tableId, isActive: true })
        .populate('restaurant', 'name address')
        .populate('currentCustomer', 'name email phone');

      if (!table) {
        throw new Error('Table not found');
      }

      return table;
    } catch (error) {
      throw error;
    }
  }

  // ⭐ UPDATED: Removed restaurantId parameter (optional)
  async getByNumber(tableNumber, restaurantId = null) {
    try {
      const query = { 
        number: tableNumber.toString().toUpperCase().trim(), 
        isActive: true 
      };

      // Optional restaurant filter
      if (restaurantId) {
        query.restaurant = restaurantId;
      }

      const table = await Table.findOne(query)
        .populate('restaurant', 'name')
        .populate('currentCustomer', 'name email');

      if (!table) {
        throw new Error('Table not found');
      }

      return table;
    } catch (error) {
      throw error;
    }
  }

  async getByQRCode(tableId, restaurantId) {
    try {
      const query = {
        _id: tableId,
        isActive: true
      };
      
      if (restaurantId) {
        query.restaurant = restaurantId;
      }

      const table = await Table.findOne(query)
        .populate('restaurant', 'name address');

      if (!table) {
        throw new Error('Invalid QR code or table not found');
      }

      return table;
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // UPDATE
  // ============================================

  async update(tableId, updateData) {
    try {
      if (!mongoose.Types.ObjectId.isValid(tableId)) {
        throw new Error('Invalid table ID format');
      }

      const table = await Table.findOne({ _id: tableId, isActive: true });

      if (!table) {
        throw new Error('Table not found');
      }

      // ⭐ UPDATED: Check for duplicate table number (simplified)
      if (updateData.number && updateData.number !== table.number) {
        const isDuplicate = await Table.isNumberTaken(
          updateData.number,
          tableId
        );

        if (isDuplicate) {
          throw new Error('Table number already exists');
        }
      }

      // Prevent certain fields from being updated
      delete updateData.restaurant; // Can't change restaurant
      delete updateData.createdAt;
      delete updateData.isActive;

      Object.assign(table, updateData);
      await table.save();

      return table;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(e => e.message);
        throw new Error(messages.join(', '));
      }
      throw error;
    }
  }

  async updateStatus(tableId, status) {
    try {
      const table = await this.getById(tableId);
      await table.updateStatus(status);
      return table;
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // DELETE (Soft Delete)
  // ============================================

  async delete(tableId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(tableId)) {
        throw new Error('Invalid table ID format');
      }

      const table = await Table.findOne({ _id: tableId, isActive: true });

      if (!table) {
        throw new Error('Table not found');
      }

      // Prevent deletion if table is occupied
      if (table.status === 'occupied') {
        throw new Error('Cannot delete an occupied table');
      }

      // Soft delete
      table.isActive = false;
      await table.save();

      return { message: 'Table deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // ============================================
  // LOCATION MATCHING
  // ============================================

  async matchByLocation(latitude, longitude, maxDistance = 50) {
    try {
      // Find nearest table within maxDistance meters
      const tables = await Table.find({
        isActive: true,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: maxDistance
          }
        }
      })
        .populate('restaurant', 'name')
        .limit(5);

      if (tables.length === 0) {
        throw new Error('No tables found at this location');
      }

      return {
        matchedTables: tables,
        count: tables.length
      };
    } catch (error) {
      throw new Error(`Location matching failed: ${error.message}`);
    }
  }

  // ============================================
  // ADDITIONAL METHODS
  // ============================================

  async getStatus(tableId) {
    try {
      const table = await this.getById(tableId);
      return {
        status: table.status,
        isAvailable: table.isAvailable,
        currentCustomer: table.currentCustomer
      };
    } catch (error) {
      throw error;
    }
  }

  async getQRCode(tableId) {
    try {
      const table = await this.getById(tableId);
      return table.qrCode;
    } catch (error) {
      throw error;
    }
  }

  async getActiveSession(tableId) {
    try {
      const table = await this.getById(tableId);

      if (!table.currentCustomer) {
        throw new Error('No active session for this table');
      }

      return {
        tableNumber: table.number,
        customer: table.currentCustomer,
        status: table.status,
        sessionStart: table.updatedAt
      };
    } catch (error) {
      throw error;
    }
  }

  async assignCustomer(tableId, customerId) {
    try {
      const table = await this.getById(tableId);
      await table.assignCustomer(customerId);
      return table;
    } catch (error) {
      throw error;
    }
  }

  async releaseTable(tableId) {
    try {
      const table = await this.getById(tableId);
      await table.release();
      return table;
    } catch (error) {
      throw error;
    }
  }

  async getAvailableTables(restaurantId = null) {
    try {
      const tables = await Table.getAvailable(restaurantId);
      return tables;
    } catch (error) {
      throw new Error(`Error fetching available tables: ${error.message}`);
    }
  }
}

module.exports = new TableService();