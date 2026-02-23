// File: backend/src/modules/request/request.service.js
// 💼 REQUEST SERVICE - Business logic for customer assistance requests
// ✅ Matches your existing service patterns

const Request = require('./request.model');
const Table = require('../table/table.model');
const { AppError } = require('../../shared/utils/response');

class RequestService {
  /**
   * Create new customer request
   */
  async createRequest(requestData) {
    try {
      // Validate table exists
      const table = await Table.findById(requestData.tableId);
      if (!table) {
        throw new AppError('Table not found', 404);
      }

      // Create request
      const request = new Request({
        ...requestData,
        tableNumber: table.number || requestData.tableNumber,
        status: 'pending',
        acknowledged: false
      });

      await request.save();

      // Populate references
      await request.populate('tableId', 'number location');
      if (request.customerId) {
        await request.populate('customerId', 'name phone');
      }

      console.log('✅ Request created:', request._id);

      return {
        success: true,
        request: request.toObject(),
        assignedWaiterId: table.assignedTo || table.assignedWaiter
      };
    } catch (error) {
      console.error('❌ Create request error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create request', 500);
    }
  }

  /**
   * Get all requests with filters
   */
  async getAllRequests(filters = {}) {
    try {
      // Build query
      const query = {};

      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.priority) {
        query.priority = filters.priority;
      }

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.tableId) {
        query.tableId = filters.tableId;
      }

      // Pagination
      const limit = parseInt(filters.limit) || 50;
      const skip = parseInt(filters.skip) || 0;

      // Execute query
      const requests = await Request.find(query)
        .populate('tableId', 'number location')
        .populate('customerId', 'name phone')
        .populate('acknowledgedBy', 'name')
        .populate('completedBy', 'name')
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
      console.error('❌ Get all requests error:', error);
      throw new AppError('Failed to fetch requests', 500);
    }
  }

  /**
   * Get request by ID
   */
  async getRequestById(requestId) {
    try {
      const request = await Request.findById(requestId)
        .populate('tableId', 'number location')
        .populate('customerId', 'name phone')
        .populate('acknowledgedBy', 'name')
        .populate('completedBy', 'name')
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
      console.error('❌ Get request error:', error);
      throw new AppError('Failed to fetch request', 500);
    }
  }

  /**
   * Get requests by table
   */
  async getTableRequests(tableId, activeOnly = true) {
    try {
      const query = { tableId };

      if (activeOnly) {
        query.status = { $in: ['pending', 'acknowledged', 'in-progress'] };
      }

      const requests = await Request.find(query)
        .populate('customerId', 'name phone')
        .populate('acknowledgedBy', 'name')
        .populate('completedBy', 'name')
        .sort({ createdAt: -1 })
        .lean();

      return {
        success: true,
        requests,
        total: requests.length
      };
    } catch (error) {
      console.error('❌ Get table requests error:', error);
      throw new AppError('Failed to fetch table requests', 500);
    }
  }

  /**
   * Get requests by waiter (assigned tables)
   */
  async getWaiterRequests(waiterId, filters = {}) {
    try {
      // Get tables assigned to this waiter
      const tables = await Table.find({
        $or: [
          { assignedTo: waiterId },
          { assignedWaiter: waiterId }
        ]
      }).select('_id').lean();

      const tableIds = tables.map(t => t._id);

      if (tableIds.length === 0) {
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
      } else if (filters.activeOnly) {
        query.status = { $in: ['pending', 'acknowledged', 'in-progress'] };
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
        .populate('acknowledgedBy', 'name')
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
      console.error('❌ Get waiter requests error:', error);
      throw new AppError('Failed to fetch waiter requests', 500);
    }
  }

  /**
   * Update request status
   */
  async updateRequestStatus(requestId, status, updatedBy) {
    try {
      const request = await Request.findByIdAndUpdate(
        requestId,
        {
          status,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      )
        .populate('tableId', 'number location')
        .populate('customerId', 'name phone')
        .lean();

      if (!request) {
        throw new AppError('Request not found', 404);
      }

      console.log('✅ Request status updated:', { requestId, status });

      return {
        success: true,
        request
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('❌ Update request status error:', error);
      throw new AppError('Failed to update request status', 500);
    }
  }

  /**
   * Acknowledge request
   */
  async acknowledgeRequest(requestId, acknowledgedBy) {
    try {
      const request = await Request.findByIdAndUpdate(
        requestId,
        {
          acknowledged: true,
          acknowledgedBy,
          acknowledgedAt: new Date(),
          status: 'acknowledged'
        },
        { new: true }
      )
        .populate('tableId', 'number location')
        .populate('customerId', 'name phone')
        .lean();

      if (!request) {
        throw new AppError('Request not found', 404);
      }

      console.log('✅ Request acknowledged:', requestId);

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
   * Complete request
   */
  async completeRequest(requestId, completedBy, notes = '') {
    try {
      const request = await Request.findByIdAndUpdate(
        requestId,
        {
          status: 'completed',
          completedBy,
          completedAt: new Date(),
          completionNotes: notes
        },
        { new: true }
      )
        .populate('tableId', 'number location')
        .populate('customerId', 'name phone')
        .lean();

      if (!request) {
        throw new AppError('Request not found', 404);
      }

      // Calculate response time
      const responseTime = Math.floor(
        (new Date(request.completedAt) - new Date(request.createdAt)) / 1000
      );

      console.log('✅ Request completed:', { requestId, responseTime });

      return {
        success: true,
        request: {
          ...request,
          responseTime
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('❌ Complete request error:', error);
      throw new AppError('Failed to complete request', 500);
    }
  }

  /**
   * Cancel request
   */
  async cancelRequest(requestId, cancelledBy, reason = '') {
    try {
      const request = await Request.findByIdAndUpdate(
        requestId,
        {
          status: 'cancelled',
          cancelledBy,
          cancelledAt: new Date(),
          cancellationReason: reason
        },
        { new: true }
      )
        .populate('tableId', 'number location')
        .populate('customerId', 'name phone')
        .lean();

      if (!request) {
        throw new AppError('Request not found', 404);
      }

      console.log('✅ Request cancelled:', requestId);

      return {
        success: true,
        request
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('❌ Cancel request error:', error);
      throw new AppError('Failed to cancel request', 500);
    }
  }

  /**
   * Get request statistics
   */
  async getRequestStatistics(filters = {}) {
    try {
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

      const totalRequests = await Request.countDocuments(dateFilter);
      const pendingRequests = await Request.countDocuments({ 
        ...dateFilter, 
        status: 'pending' 
      });
      const completedRequests = await Request.countDocuments({ 
        ...dateFilter, 
        status: 'completed' 
      });

      // Average response time for completed requests
      const responseTimeData = await Request.aggregate([
        { 
          $match: { 
            ...dateFilter, 
            status: 'completed',
            responseTime: { $exists: true }
          } 
        },
        {
          $group: {
            _id: null,
            averageResponseTime: { $avg: '$responseTime' }
          }
        }
      ]);

      // Requests by priority
      const priorityDistribution = await Request.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        success: true,
        stats: {
          totalRequests,
          pendingRequests,
          completedRequests,
          averageResponseTime: responseTimeData[0]?.averageResponseTime || 0,
          priorityDistribution,
          completionRate: totalRequests > 0 
            ? (completedRequests / totalRequests) * 100 
            : 0
        }
      };
    } catch (error) {
      console.error('❌ Get request statistics error:', error);
      throw new AppError('Failed to fetch request statistics', 500);
    }
  }
}

module.exports = new RequestService();