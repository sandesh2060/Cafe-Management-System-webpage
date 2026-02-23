// File: backend/src/modules/table/tableSession.controller.js
// 🎯 TABLE SESSION CONTROLLER

const tableSessionService = require('./tableSession.service');
const { successResponse, errorResponse } = require('../../shared/utils/response');

const tableSessionController = {
  // Create or join table session
  createOrJoinSession: async (req, res) => {
    try {
      const { tableNumber } = req.body;

      if (!tableNumber) {
        return errorResponse(res, 'Table number is required', 400);
      }

      const result = await tableSessionService.createOrJoinSession(tableNumber);

      if (result.success) {
        return successResponse(res, 'Session created successfully', {
          session: result.session
        });
      } else {
        return errorResponse(res, result.error || 'Failed to create session', 400);
      }
    } catch (error) {
      console.error('Create/join session error:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  },

  // Get active session for table
  getActiveSession: async (req, res) => {
    try {
      const { tableNumber } = req.params;

      if (!tableNumber) {
        return errorResponse(res, 'Table number is required', 400);
      }

      const result = await tableSessionService.getActiveSession(parseInt(tableNumber));

      if (result.success) {
        return successResponse(res, 'Session retrieved successfully', {
          session: result.session
        });
      } else {
        return errorResponse(res, result.error || 'No active session found', 404);
      }
    } catch (error) {
      console.error('Get active session error:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  },

  // Get session by ID
  getSessionById: async (req, res) => {
    try {
      const { sessionId } = req.params;

      const result = await tableSessionService.getSessionById(sessionId);

      if (result.success) {
        return successResponse(res, 'Session retrieved successfully', {
          session: result.session
        });
      } else {
        return errorResponse(res, result.error || 'Session not found', 404);
      }
    } catch (error) {
      console.error('Get session by ID error:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  },

  // Update cart in session
  updateCart: async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { cart } = req.body;

      if (!cart || !Array.isArray(cart)) {
        return errorResponse(res, 'Invalid cart data', 400);
      }

      const result = await tableSessionService.updateCart(sessionId, cart);

      if (result.success) {
        // Emit WebSocket event for real-time updates
        const io = req.app.get('io');
        if (io) {
          io.to(`session-${sessionId}`).emit('sessionUpdated', result.session);
        }

        return successResponse(res, 'Cart updated successfully', {
          session: result.session
        });
      } else {
        return errorResponse(res, result.error || 'Failed to update cart', 400);
      }
    } catch (error) {
      console.error('Update cart error:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  },

  // End session
  endSession: async (req, res) => {
    try {
      const { sessionId } = req.params;

      const result = await tableSessionService.endSession(sessionId);

      if (result.success) {
        // Emit WebSocket event
        const io = req.app.get('io');
        if (io) {
          io.to(`session-${sessionId}`).emit('sessionEnded', { sessionId });
        }

        return successResponse(res, 'Session ended successfully');
      } else {
        return errorResponse(res, result.error || 'Failed to end session', 400);
      }
    } catch (error) {
      console.error('End session error:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  },

  // Get all active sessions (admin/waiter use)
  getAllActiveSessions: async (req, res) => {
    try {
      const result = await tableSessionService.getAllActiveSessions();

      if (result.success) {
        return successResponse(res, 'Active sessions retrieved successfully', {
          sessions: result.sessions,
          count: result.count
        });
      } else {
        return errorResponse(res, result.error || 'Failed to get sessions', 400);
      }
    } catch (error) {
      console.error('Get all sessions error:', error);
      return errorResponse(res, 'Internal server error', 500);
    }
  }
};

module.exports = tableSessionController;