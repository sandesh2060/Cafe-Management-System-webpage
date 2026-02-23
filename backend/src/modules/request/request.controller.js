// File: backend/src/modules/request/request.controller.js
// 🔔 REQUEST CONTROLLER - Customer assistance requests
// ✅ Customer arrival notifications, accept/pass/complete

const Request = require('./request.model');
const notificationService = require('../notification/notification.service');
const { successResponse, errorResponse } = require('../../shared/utils/response');

class RequestController {
  /**
   * Create customer arrival request
   * POST /api/requests/customer-arrived
   */
  async createCustomerArrival(req, res) {
    try {
      const { tableId, tableNumber, customerId, customerName, message } = req.body;

      console.log('📥 Customer arrival request:', { tableId, tableNumber, customerId, customerName });

      // Validate required fields
      if (!tableId || !tableNumber) {
        return errorResponse(res, 'Table ID and number are required', 400);
      }

      // Create assistance request
      const request = await Request.create({
        tableId,
        tableNumber,
        customerId,
        customerName: customerName || 'Guest',
        type: 'assistance',
        priority: 'high',
        message: message || `Customer arrived at Table ${tableNumber}`,
        status: 'pending',
        metadata: {
          source: 'tablet',
          sessionId: req.body.sessionId
        }
      });

      console.log('✅ Request created:', request._id);

      // Get Socket.IO instance and connected waiters
      const io = req.app.get('io');
      const connectedWaiters = req.app.get('connectedWaiters');

      if (!io || !connectedWaiters) {
        console.warn('⚠️ Socket.IO not available, skipping notification');
        return successResponse(res, {
          request,
          notification: { success: false, message: 'Real-time notifications unavailable' }
        }, 'Request created (notifications disabled)', 201);
      }

      // Notify nearest waiter
      const notificationResult = await notificationService.notifyNearestWaiter(
        request._id.toString(),
        tableId,
        customerId,
        customerName || 'Guest',
        io,
        connectedWaiters
      );

      console.log('🔔 Notification result:', notificationResult);

      return successResponse(res, {
        request,
        notification: notificationResult
      }, 'Waiter notified successfully', 201);

    } catch (error) {
      console.error('❌ Create customer arrival error:', error);
      return errorResponse(res, error.message || 'Failed to create request', 500);
    }
  }

  /**
   * Accept request (waiter action)
   * PATCH /api/requests/:requestId/accept
   */
  async acceptRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { waiterId } = req.body;

      console.log('📥 Accept request:', { requestId, waiterId });

      if (!waiterId) {
        return errorResponse(res, 'Waiter ID is required', 400);
      }

      // Accept via notification service
      const result = await notificationService.acceptRequest(requestId, waiterId);

      // Emit acceptance to all clients
      const io = req.app.get('io');
      if (io) {
        io.emit('request:accepted', {
          requestId,
          waiterId,
          acceptedAt: new Date()
        });

        // Notify customer
        if (result.request?.tableNumber) {
          io.to(`table-${result.request.tableNumber}`).emit('waiter:assigned', {
            requestId,
            waiterId,
            waiterName: result.request.acknowledgedBy?.name || 'Waiter',
            message: 'A waiter is on the way!'
          });
        }
      }

      return successResponse(res, result.request, 'Request accepted successfully', 200);

    } catch (error) {
      console.error('❌ Accept request error:', error);
      return errorResponse(res, error.message || 'Failed to accept request', 500);
    }
  }

  /**
   * Pass request to next waiter
   * PATCH /api/requests/:requestId/pass
   */
  async passRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { waiterId } = req.body;

      console.log('📥 Pass request:', { requestId, waiterId });

      if (!waiterId) {
        return errorResponse(res, 'Waiter ID is required', 400);
      }

      const io = req.app.get('io');
      const connectedWaiters = req.app.get('connectedWaiters');

      if (!io || !connectedWaiters) {
        return errorResponse(res, 'Real-time notifications unavailable', 503);
      }

      // Pass to next waiter
      const result = await notificationService.passRequest(requestId, waiterId, io, connectedWaiters);

      // Emit pass event
      io.emit('request:passed', {
        requestId,
        passedBy: waiterId,
        passedAt: new Date()
      });

      return successResponse(res, result, 'Request passed to next waiter', 200);

    } catch (error) {
      console.error('❌ Pass request error:', error);
      return errorResponse(res, error.message || 'Failed to pass request', 500);
    }
  }

  /**
   * Complete request
   * PATCH /api/requests/:requestId/complete
   */
  async completeRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { waiterId, notes } = req.body;

      console.log('📥 Complete request:', { requestId, waiterId, notes });

      const request = await Request.findById(requestId);

      if (!request) {
        return errorResponse(res, 'Request not found', 404);
      }

      // Complete the request
      await request.complete(waiterId, notes);

      // Clean up notification
      notificationService.cleanupNotification(requestId);

      // Emit completion
      const io = req.app.get('io');
      if (io) {
        io.emit('request:completed', {
          requestId,
          completedBy: waiterId,
          completedAt: new Date()
        });

        // Notify customer
        if (request.tableNumber) {
          io.to(`table-${request.tableNumber}`).emit('request:completed', {
            requestId,
            message: 'Your request has been completed'
          });
        }
      }

      return successResponse(res, request, 'Request completed successfully', 200);

    } catch (error) {
      console.error('❌ Complete request error:', error);
      return errorResponse(res, error.message || 'Failed to complete request', 500);
    }
  }

  /**
   * Get all requests (with filters)
   * GET /api/requests
   */
  async getAllRequests(req, res) {
    try {
      const { status, tableId, priority, limit = 50, skip = 0 } = req.query;

      const query = {};

      if (status) {
        query.status = status;
      }

      if (tableId) {
        query.tableId = tableId;
      }

      if (priority) {
        query.priority = priority;
      }

      const requests = await Request.find(query)
        .populate('tableId', 'number location zone')
        .populate('customerId', 'name phone')
        .populate('acknowledgedBy', 'name')
        .populate('completedBy', 'name')
        .sort({ priority: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .lean();

      const total = await Request.countDocuments(query);

      return successResponse(res, {
        requests,
        total,
        page: Math.floor(parseInt(skip) / parseInt(limit)) + 1,
        totalPages: Math.ceil(total / parseInt(limit))
      }, 'Requests fetched successfully', 200);

    } catch (error) {
      console.error('❌ Get all requests error:', error);
      return errorResponse(res, error.message || 'Failed to fetch requests', 500);
    }
  }

  /**
   * Get request by ID
   * GET /api/requests/:requestId
   */
  async getRequestById(req, res) {
    try {
      const { requestId } = req.params;

      const request = await Request.findById(requestId)
        .populate('tableId', 'number location zone')
        .populate('customerId', 'name phone')
        .populate('acknowledgedBy', 'name')
        .populate('completedBy', 'name')
        .lean();

      if (!request) {
        return errorResponse(res, 'Request not found', 404);
      }

      return successResponse(res, request, 'Request fetched successfully', 200);

    } catch (error) {
      console.error('❌ Get request by ID error:', error);
      return errorResponse(res, error.message || 'Failed to fetch request', 500);
    }
  }

  /**
   * Get request statistics
   * GET /api/requests/stats
   */
  async getStatistics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const stats = await Request.getStatistics({ startDate, endDate });

      return successResponse(res, stats, 'Statistics fetched successfully', 200);

    } catch (error) {
      console.error('❌ Get statistics error:', error);
      return errorResponse(res, error.message || 'Failed to fetch statistics', 500);
    }
  }
}

module.exports = new RequestController();