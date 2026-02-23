// File: backend/src/modules/table/tableSession.service.js
// 💼 TABLE SESSION BUSINESS LOGIC

const TableSession = require('./tableSession.model');
const Table = require('./table.model');

const tableSessionService = {
  // Create or join existing session
  createOrJoinSession: async (tableNumber) => {
    try {
      // Check if table exists
      const table = await Table.findOne({ tableNumber });
      if (!table) {
        return {
          success: false,
          error: 'Table not found'
        };
      }

      // Check if there's an active session for this table
      let session = await TableSession.findOne({
        tableNumber,
        status: 'active'
      });

      if (session) {
        // Join existing session
        return {
          success: true,
          session,
          isNew: false
        };
      }

      // Create new session
      session = new TableSession({
        tableNumber,
        tableId: table._id,
        status: 'active',
        cart: [],
        startTime: new Date()
      });

      await session.save();

      // Update table status
      table.status = 'occupied';
      table.currentSessionId = session._id;
      await table.save();

      return {
        success: true,
        session,
        isNew: true
      };
    } catch (error) {
      console.error('Create/join session error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create session'
      };
    }
  },

  // Get active session for table
  getActiveSession: async (tableNumber) => {
    try {
      const session = await TableSession.findOne({
        tableNumber,
        status: 'active'
      }).populate('orders');

      if (!session) {
        return {
          success: false,
          error: 'No active session found'
        };
      }

      return {
        success: true,
        session
      };
    } catch (error) {
      console.error('Get active session error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get session'
      };
    }
  },

  // Get session by ID
  getSessionById: async (sessionId) => {
    try {
      const session = await TableSession.findById(sessionId).populate('orders');

      if (!session) {
        return {
          success: false,
          error: 'Session not found'
        };
      }

      return {
        success: true,
        session
      };
    } catch (error) {
      console.error('Get session by ID error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get session'
      };
    }
  },

  // Update cart in session
  updateCart: async (sessionId, cart) => {
    try {
      const session = await TableSession.findById(sessionId);

      if (!session) {
        return {
          success: false,
          error: 'Session not found'
        };
      }

      if (session.status !== 'active') {
        return {
          success: false,
          error: 'Session is not active'
        };
      }

      // Update cart
      session.cart = cart;
      session.updatedAt = new Date();
      await session.save();

      return {
        success: true,
        session
      };
    } catch (error) {
      console.error('Update cart error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update cart'
      };
    }
  },

  // End session
  endSession: async (sessionId) => {
    try {
      const session = await TableSession.findById(sessionId);

      if (!session) {
        return {
          success: false,
          error: 'Session not found'
        };
      }

      // Update session status
      session.status = 'completed';
      session.endTime = new Date();
      await session.save();

      // Update table status
      const table = await Table.findOne({ tableNumber: session.tableNumber });
      if (table) {
        table.status = 'available';
        table.currentSessionId = null;
        await table.save();
      }

      return {
        success: true,
        session
      };
    } catch (error) {
      console.error('End session error:', error);
      return {
        success: false,
        error: error.message || 'Failed to end session'
      };
    }
  },

  // Get all active sessions
  getAllActiveSessions: async () => {
    try {
      const sessions = await TableSession.find({
        status: 'active'
      })
        .populate('orders')
        .sort({ startTime: -1 });

      return {
        success: true,
        sessions,
        count: sessions.length
      };
    } catch (error) {
      console.error('Get all active sessions error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get sessions'
      };
    }
  },

  // Add order to session
  addOrderToSession: async (sessionId, orderId) => {
    try {
      const session = await TableSession.findById(sessionId);

      if (!session) {
        return {
          success: false,
          error: 'Session not found'
        };
      }

      // Add order to session
      if (!session.orders) {
        session.orders = [];
      }
      session.orders.push(orderId);
      session.updatedAt = new Date();
      await session.save();

      return {
        success: true,
        session
      };
    } catch (error) {
      console.error('Add order to session error:', error);
      return {
        success: false,
        error: error.message || 'Failed to add order to session'
      };
    }
  }
};

module.exports = tableSessionService;