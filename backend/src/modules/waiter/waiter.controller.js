// File: backend/src/modules/waiter/waiter.controller.js
// 🎯 WAITER CONTROLLER - Complete endpoints for waiter operations
// ✅ Matches your existing controller patterns

const waiterService = require('./waiter.service');
const { successResponse, errorResponse } = require('../../shared/utils/response');

class WaiterController {
  /**
   * Get waiter's assigned tables
   * GET /api/waiter/:waiterId/tables
   */
  async getAssignedTables(req, res) {
    try {
      const { waiterId } = req.params;

      console.log('📥 Get assigned tables request:', waiterId);

      const result = await waiterService.getAssignedTables(waiterId);

      return successResponse(res, result, 'Assigned tables fetched successfully', 200);
    } catch (error) {
      console.error('❌ Get assigned tables error:', error);
      return errorResponse(res, error.message || 'Failed to fetch assigned tables', error.statusCode || 500);
    }
  }

  /**
   * Get waiter's orders
   * GET /api/waiter/:waiterId/orders
   */
  async getWaiterOrders(req, res) {
    try {
      const { waiterId } = req.params;
      const filters = {
        status: req.query.status,
        tableId: req.query.tableId,
        limit: req.query.limit,
        skip: req.query.skip,
      };

      console.log('📥 Get waiter orders request:', { waiterId, filters });

      const result = await waiterService.getWaiterOrders(waiterId, filters);

      return successResponse(res, result, 'Waiter orders fetched successfully', 200);
    } catch (error) {
      console.error('❌ Get waiter orders error:', error);
      return errorResponse(res, error.message || 'Failed to fetch waiter orders', error.statusCode || 500);
    }
  }

  /**
   * Update order status (waiter action)
   * PATCH /api/waiter/:waiterId/orders/:orderId/status
   */
  async updateOrderStatus(req, res) {
    try {
      const { waiterId, orderId } = req.params;
      const { status } = req.body;

      console.log('📥 Waiter update order status:', { waiterId, orderId, status });

      const result = await waiterService.updateOrderStatus(orderId, status, waiterId);

      // Emit WebSocket event
      const io = req.app.get('io');
      if (io) {
        io.to(`order-${orderId}`).emit('order:statusChanged', {
          orderId,
          status,
          updatedBy: waiterId,
          timestamp: new Date()
        });
      }

      return successResponse(res, result, 'Order status updated successfully', 200);
    } catch (error) {
      console.error('❌ Update order status error:', error);
      return errorResponse(res, error.message || 'Failed to update order status', error.statusCode || 500);
    }
  }

  /**
   * Mark order as served
   * PATCH /api/waiter/:waiterId/orders/:orderId/served
   */
  async markOrderServed(req, res) {
    try {
      const { waiterId, orderId } = req.params;

      console.log('📥 Mark order as served:', { waiterId, orderId });

      const result = await waiterService.markOrderServed(orderId, waiterId);

      // Emit WebSocket event
      const io = req.app.get('io');
      if (io) {
        io.to(`order-${orderId}`).emit('order:served', {
          orderId,
          servedBy: waiterId,
          timestamp: new Date()
        });
      }

      return successResponse(res, result, 'Order marked as served successfully', 200);
    } catch (error) {
      console.error('❌ Mark order served error:', error);
      return errorResponse(res, error.message || 'Failed to mark order as served', error.statusCode || 500);
    }
  }

  /**
   * Get waiter statistics
   * GET /api/waiter/:waiterId/stats
   */
  async getWaiterStats(req, res) {
    try {
      const { waiterId } = req.params;
      const { startDate, endDate, period } = req.query;

      console.log('📥 Get waiter stats request:', { waiterId, startDate, endDate, period });

      const result = await waiterService.getWaiterStats(waiterId, { startDate, endDate, period });

      return successResponse(res, result, 'Waiter statistics fetched successfully', 200);
    } catch (error) {
      console.error('❌ Get waiter stats error:', error);
      return errorResponse(res, error.message || 'Failed to fetch waiter statistics', error.statusCode || 500);
    }
  }

  /**
   * Get waiter performance metrics
   * GET /api/waiter/:waiterId/performance
   */
  async getPerformanceMetrics(req, res) {
    try {
      const { waiterId } = req.params;
      const { period } = req.query;

      console.log('📥 Get performance metrics request:', { waiterId, period });

      const result = await waiterService.getPerformanceMetrics(waiterId, period || 'today');

      return successResponse(res, result, 'Performance metrics fetched successfully', 200);
    } catch (error) {
      console.error('❌ Get performance metrics error:', error);
      return errorResponse(res, error.message || 'Failed to fetch performance metrics', error.statusCode || 500);
    }
  }

  /**
   * Update waiter location (for nearest waiter routing)
   * PATCH /api/waiter/:waiterId/location
   */
  async updateLocation(req, res) {
    try {
      const { waiterId } = req.params;
      const { latitude, longitude } = req.body;

      console.log('📥 Update waiter location:', { waiterId, latitude, longitude });

      const result = await waiterService.updateLocation(waiterId, { latitude, longitude });

      return successResponse(res, result, 'Location updated successfully', 200);
    } catch (error) {
      console.error('❌ Update location error:', error);
      return errorResponse(res, error.message || 'Failed to update location', error.statusCode || 500);
    }
  }

  /**
   * Assign tables to waiter
   * POST /api/waiter/:waiterId/assign-tables
   */
  async assignTables(req, res) {
    try {
      const { waiterId } = req.params;
      const { tableIds } = req.body;

      console.log('📥 Assign tables request:', { waiterId, tableIds });

      const result = await waiterService.assignTables(waiterId, tableIds);

      return successResponse(res, result, 'Tables assigned successfully', 200);
    } catch (error) {
      console.error('❌ Assign tables error:', error);
      return errorResponse(res, error.message || 'Failed to assign tables', error.statusCode || 500);
    }
  }

  /**
   * Get customer requests for waiter's tables
   * GET /api/waiter/:waiterId/requests
   */
  async getCustomerRequests(req, res) {
    try {
      const { waiterId } = req.params;
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        limit: req.query.limit,
        skip: req.query.skip,
      };

      console.log('📥 Get customer requests:', { waiterId, filters });

      const result = await waiterService.getCustomerRequests(waiterId, filters);

      return successResponse(res, result, 'Customer requests fetched successfully', 200);
    } catch (error) {
      console.error('❌ Get customer requests error:', error);
      return errorResponse(res, error.message || 'Failed to fetch customer requests', error.statusCode || 500);
    }
  }

  /**
   * Acknowledge customer request
   * PATCH /api/waiter/:waiterId/requests/:requestId/acknowledge
   */
  async acknowledgeRequest(req, res) {
    try {
      const { waiterId, requestId } = req.params;

      console.log('📥 Acknowledge request:', { waiterId, requestId });

      const result = await waiterService.acknowledgeRequest(requestId, waiterId);

      // Emit WebSocket event
      const io = req.app.get('io');
      if (io) {
        io.to(`request-${requestId}`).emit('request:acknowledged', {
          requestId,
          acknowledgedBy: waiterId,
          timestamp: new Date()
        });
      }

      return successResponse(res, result, 'Request acknowledged successfully', 200);
    } catch (error) {
      console.error('❌ Acknowledge request error:', error);
      return errorResponse(res, error.message || 'Failed to acknowledge request', error.statusCode || 500);
    }
  }

  /**
   * Complete customer request
   * PATCH /api/waiter/:waiterId/requests/:requestId/complete
   */
  async completeRequest(req, res) {
    try {
      const { waiterId, requestId } = req.params;
      const { notes } = req.body;

      console.log('📥 Complete request:', { waiterId, requestId, notes });

      const result = await waiterService.completeRequest(requestId, waiterId, notes);

      // Emit WebSocket event
      const io = req.app.get('io');
      if (io) {
        io.to(`request-${requestId}`).emit('request:completed', {
          requestId,
          completedBy: waiterId,
          timestamp: new Date()
        });
      }

      return successResponse(res, result, 'Request completed successfully', 200);
    } catch (error) {
      console.error('❌ Complete request error:', error);
      return errorResponse(res, error.message || 'Failed to complete request', error.statusCode || 500);
    }
  }

  /**
   * Search orders for waiter
   * GET /api/waiter/:waiterId/orders/search
   */
  async searchOrders(req, res) {
    try {
      const { waiterId } = req.params;
      const { q } = req.query;

      console.log('📥 Search orders:', { waiterId, query: q });

      const result = await waiterService.searchOrders(waiterId, q);

      return successResponse(res, result, 'Orders search completed', 200);
    } catch (error) {
      console.error('❌ Search orders error:', error);
      return errorResponse(res, error.message || 'Failed to search orders', error.statusCode || 500);
    }
  }
}

module.exports = new WaiterController();