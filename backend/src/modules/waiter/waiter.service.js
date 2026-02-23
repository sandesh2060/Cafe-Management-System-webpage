// File: backend/src/modules/waiter/waiter.service.js
// 💼 WAITER SERVICE - Business logic for waiter operations
// ✅ Matches your existing service patterns

const Order = require('../order/order.model');
const Table = require('../table/table.model');
const TableSession = require('../table/tableSession.model');
const { AppError } = require('../../shared/utils/response');

class WaiterService {
  /**
   * Get waiter's assigned tables
   */
  async getAssignedTables(waiterId) {
    try {
      // Find tables assigned to this waiter
      // Assuming Table model has 'assignedTo' or 'assignedWaiter' field
      const tables = await Table.find({
        $or: [
          { assignedTo: waiterId },
          { assignedWaiter: waiterId }
        ]
      })
        .populate('currentCustomer', 'name phone')
        .sort({ number: 1 })
        .lean();

      // Get active sessions for each table
      const tablesWithSessions = await Promise.all(
        tables.map(async (table) => {
          const activeSession = await TableSession.findOne({
            table: table._id,
            status: 'active'
          })
            .populate('customer', 'name phone')
            .populate('orders')
            .lean();

          // Get active orders count for this table
          const activeOrdersCount = await Order.countDocuments({
            tableId: table._id,
            status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
          });

          return {
            ...table,
            currentSession: activeSession,
            activeOrders: activeOrdersCount
          };
        })
      );

      return {
        success: true,
        tables: tablesWithSessions,
        total: tablesWithSessions.length
      };
    } catch (error) {
      console.error('❌ Get assigned tables error:', error);
      throw new AppError('Failed to fetch assigned tables', 500);
    }
  }

  /**
   * Get waiter's orders from assigned tables
   */
  async getWaiterOrders(waiterId, filters = {}) {
    try {
      // First, get waiter's assigned tables
      const assignedTables = await Table.find({
        $or: [
          { assignedTo: waiterId },
          { assignedWaiter: waiterId }
        ]
      }).select('_id').lean();

      const tableIds = assignedTables.map(t => t._id);

      if (tableIds.length === 0) {
        return {
          success: true,
          orders: [],
          total: 0
        };
      }

      // Build query
      const query = {
        tableId: { $in: tableIds }
      };

      // Apply status filter
      if (filters.status) {
        if (typeof filters.status === 'string' && filters.status.includes(',')) {
          query.status = { $in: filters.status.split(',').map(s => s.trim()) };
        } else if (Array.isArray(filters.status)) {
          query.status = { $in: filters.status };
        } else {
          query.status = filters.status;
        }
      }

      // Apply table filter
      if (filters.tableId) {
        query.tableId = filters.tableId;
      }

      // Pagination
      const limit = parseInt(filters.limit) || 50;
      const skip = parseInt(filters.skip) || 0;

      // Execute query
      const orders = await Order.find(query)
        .populate('items.menuItemId', 'name price category image')
        .populate('customerId', 'name phone')
        .populate('tableId', 'number location')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await Order.countDocuments(query);

      return {
        success: true,
        orders,
        total,
        page: Math.floor(skip / limit) + 1,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('❌ Get waiter orders error:', error);
      throw new AppError('Failed to fetch waiter orders', 500);
    }
  }

  /**
   * Update order status (waiter action)
   */
  async updateOrderStatus(orderId, status, waiterId) {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          status,
          updatedBy: waiterId,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      )
        .populate('items.menuItemId', 'name price category image')
        .populate('customerId', 'name phone')
        .lean();

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      return {
        success: true,
        order
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('❌ Update order status error:', error);
      throw new AppError('Failed to update order status', 500);
    }
  }

  /**
   * Mark order as served
   */
  async markOrderServed(orderId, waiterId) {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          status: 'served',
          servedAt: new Date(),
          updatedBy: waiterId,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      )
        .populate('items.menuItemId', 'name price category image')
        .populate('customerId', 'name phone')
        .lean();

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      return {
        success: true,
        order
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('❌ Mark order served error:', error);
      throw new AppError('Failed to mark order as served', 500);
    }
  }

  /**
   * Get waiter statistics
   */
  async getWaiterStats(waiterId, filters = {}) {
    try {
      // Get assigned tables
      const assignedTables = await Table.find({
        $or: [
          { assignedTo: waiterId },
          { assignedWaiter: waiterId }
        ]
      }).select('_id').lean();

      const tableIds = assignedTables.map(t => t._id);

      // Build date filter
      const dateFilter = {};
      if (filters.startDate) {
        dateFilter.createdAt = { $gte: new Date(filters.startDate) };
      }
      if (filters.endDate) {
        dateFilter.createdAt = { 
          ...dateFilter.createdAt, 
          $lte: new Date(filters.endDate) 
        };
      }
      
      // If period is specified, calculate date range
      if (filters.period) {
        const now = new Date();
        let startDate = new Date();
        
        switch (filters.period) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        dateFilter.createdAt = { $gte: startDate };
      }

      // Get order statistics
      const orderStats = await Order.aggregate([
        {
          $match: {
            tableId: { $in: tableIds },
            ...dateFilter
          }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
            averageOrderValue: { $avg: '$total' },
            completedOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            servedOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'served'] }, 1, 0] }
            }
          }
        }
      ]);

      const stats = orderStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        completedOrders: 0,
        servedOrders: 0
      };

      return {
        success: true,
        stats: {
          ...stats,
          assignedTables: tableIds.length,
          period: filters.period || 'all time'
        }
      };
    } catch (error) {
      console.error('❌ Get waiter stats error:', error);
      throw new AppError('Failed to fetch waiter statistics', 500);
    }
  }

  /**
   * Get waiter performance metrics
   */
  async getPerformanceMetrics(waiterId, period = 'today') {
    try {
      // Calculate date range based on period
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      // Get assigned tables
      const assignedTables = await Table.find({
        $or: [
          { assignedTo: waiterId },
          { assignedWaiter: waiterId }
        ]
      }).select('_id').lean();

      const tableIds = assignedTables.map(t => t._id);

      // Get orders for the period
      const orders = await Order.find({
        tableId: { $in: tableIds },
        createdAt: { $gte: startDate },
        updatedBy: waiterId
      }).lean();

      // Calculate metrics
      const completedOrders = orders.filter(o => o.status === 'completed').length;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

      // Average service time (from order creation to served)
      const servedOrders = orders.filter(o => o.servedAt);
      const avgServiceTime = servedOrders.length > 0
        ? servedOrders.reduce((sum, o) => {
            const diff = new Date(o.servedAt) - new Date(o.createdAt);
            return sum + diff;
          }, 0) / servedOrders.length / 60000 // Convert to minutes
        : 0;

      return {
        success: true,
        metrics: {
          ordersCompleted: completedOrders,
          totalOrders,
          completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
          totalRevenue,
          averageServiceTime: Math.round(avgServiceTime),
          tablesServed: tableIds.length,
          period
        }
      };
    } catch (error) {
      console.error('❌ Get performance metrics error:', error);
      throw new AppError('Failed to fetch performance metrics', 500);
    }
  }

  /**
   * Update waiter location
   */
  async updateLocation(waiterId, location) {
    try {
      // This would typically update a User model with location field
      // For now, we'll just return success
      // You can add User.findByIdAndUpdate if you have location field

      console.log('📍 Waiter location updated:', { waiterId, location });

      return {
        success: true,
        location,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Update location error:', error);
      throw new AppError('Failed to update location', 500);
    }
  }

  /**
   * Assign tables to waiter
   */
  async assignTables(waiterId, tableIds) {
    try {
      // Update tables to assign them to this waiter
      const result = await Table.updateMany(
        { _id: { $in: tableIds } },
        { 
          $set: { 
            assignedTo: waiterId,
            assignedWaiter: waiterId 
          } 
        }
      );

      console.log('✅ Tables assigned:', { waiterId, count: result.modifiedCount });

      return {
        success: true,
        assignedCount: result.modifiedCount,
        tableIds
      };
    } catch (error) {
      console.error('❌ Assign tables error:', error);
      throw new AppError('Failed to assign tables', 500);
    }
  }

  /**
   * Get customer requests for waiter's tables
   */
  async getCustomerRequests(waiterId, filters = {}) {
    try {
      // Get assigned tables
      const assignedTables = await Table.find({
        $or: [
          { assignedTo: waiterId },
          { assignedWaiter: waiterId }
        ]
      }).select('_id').lean();

      const tableIds = assignedTables.map(t => t._id);

      // Import Request model (we'll create this next)
      let Request;
      try {
        Request = require('../request/request.model');
      } catch (err) {
        // If request model doesn't exist yet, return empty
        console.warn('⚠️ Request model not found');
        return {
          success: true,
          requests: [],
          total: 0
        };
      }

      // Build query
      const query = {
        tableId: { $in: tableIds }
      };

      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.priority) {
        query.priority = filters.priority;
      }

      // Pagination
      const limit = parseInt(filters.limit) || 50;
      const skip = parseInt(filters.skip) || 0;

      // Execute query
      const requests = await Request.find(query)
        .populate('tableId', 'number location')
        .populate('customerId', 'name phone')
        .sort({ priority: -1, createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await Request.countDocuments(query);

      return {
        success: true,
        requests,
        total,
        page: Math.floor(skip / limit) + 1,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('❌ Get customer requests error:', error);
      throw new AppError('Failed to fetch customer requests', 500);
    }
  }

  /**
   * Acknowledge customer request
   */
  async acknowledgeRequest(requestId, waiterId) {
    try {
      let Request;
      try {
        Request = require('../request/request.model');
      } catch (err) {
        throw new AppError('Request system not available', 500);
      }

      const request = await Request.findByIdAndUpdate(
        requestId,
        {
          acknowledged: true,
          acknowledgedBy: waiterId,
          acknowledgedAt: new Date()
        },
        { new: true }
      )
        .populate('tableId', 'number location')
        .lean();

      if (!request) {
        throw new AppError('Request not found', 404);
      }

      return {
        success: true,
        request
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('❌ Acknowledge request error:', error);
      throw new AppError('Failed to acknowledge request', 500);
    }
  }

  /**
   * Complete customer request
   */
  async completeRequest(requestId, waiterId, notes = '') {
    try {
      let Request;
      try {
        Request = require('../request/request.model');
      } catch (err) {
        throw new AppError('Request system not available', 500);
      }

      const request = await Request.findByIdAndUpdate(
        requestId,
        {
          status: 'completed',
          completedBy: waiterId,
          completedAt: new Date(),
          completionNotes: notes
        },
        { new: true }
      )
        .populate('tableId', 'number location')
        .lean();

      if (!request) {
        throw new AppError('Request not found', 404);
      }

      return {
        success: true,
        request
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('❌ Complete request error:', error);
      throw new AppError('Failed to complete request', 500);
    }
  }

  /**
   * Search orders for waiter
   */
  async searchOrders(waiterId, searchQuery) {
    try {
      // Get assigned tables
      const assignedTables = await Table.find({
        $or: [
          { assignedTo: waiterId },
          { assignedWaiter: waiterId }
        ]
      }).select('_id number').lean();

      const tableIds = assignedTables.map(t => t._id);

      // Build search query
      const query = {
        tableId: { $in: tableIds },
        $or: [
          { orderNumber: { $regex: searchQuery, $options: 'i' } },
          { 'items.name': { $regex: searchQuery, $options: 'i' } }
        ]
      };

      // Execute search
      const orders = await Order.find(query)
        .populate('items.menuItemId', 'name price category image')
        .populate('customerId', 'name phone')
        .populate('tableId', 'number location')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      return {
        success: true,
        orders,
        total: orders.length,
        query: searchQuery
      };
    } catch (error) {
      console.error('❌ Search orders error:', error);
      throw new AppError('Failed to search orders', 500);
    }
  }
}

module.exports = new WaiterService();