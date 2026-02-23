// File: backend/src/modules/request/request.routes.js
// 🔔 REQUEST ROUTES - Customer assistance & arrival notifications

const express = require('express');
const router = express.Router();
const Request = require('./request.model');
const User = require('../user/user.model');
const Table = require('../table/table.model');

// Socket.IO instance (will be set by app.js)
let io;

const setSocketIO = (socketInstance) => {
  io = socketInstance;
};

// Helper function to emit to socket
const emitToSocket = (event, data) => {
  if (io) {
    io.emit(event, data);
    console.log(`📡 Emitted ${event}:`, data);
  }
};

const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
    console.log(`📡 Emitted ${event} to room ${room}:`, data);
  }
};

// ============================================
// CUSTOMER ARRIVAL NOTIFICATION
// ============================================
router.post('/customer-arrived', async (req, res) => {
  try {
    const { tableId, tableNumber, customerId, customerName, sessionId, message } = req.body;

    console.log('🔔 Customer arrival notification:', { tableNumber, customerName });

    // Validate required fields
    if (!tableId || !tableNumber || !customerName) {
      return res.status(400).json({
        success: false,
        message: 'Table ID, table number, and customer name are required',
      });
    }

    // Get table details
    const table = await Table.findById(tableId).populate('location');

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    // Find nearest available waiter
    let nearestWaiter = null;

    try {
      // Get all active waiters
      const waiters = await User.find({
        role: 'waiter',
        isActive: true,
        isOnline: true,
      });

      console.log(`📍 Found ${waiters.length} active waiters`);

      if (waiters.length > 0) {
        // Find waiter assigned to this table
        nearestWaiter = waiters.find(waiter => 
          waiter.assignedTables?.some(t => t.toString() === tableId)
        );

        // If no assigned waiter, get first available
        if (!nearestWaiter) {
          nearestWaiter = waiters[0];
        }

        console.log(`✅ Selected waiter: ${nearestWaiter.name} (${nearestWaiter._id})`);
      }
    } catch (err) {
      console.warn('⚠️ Could not find waiter:', err.message);
    }

    // Create arrival request
    const request = await Request.create({
      type: 'customer_arrival',
      tableId,
      tableNumber,
      customerId,
      customerName,
      sessionId,
      assignedTo: nearestWaiter?._id,
      message: message || `${customerName} has arrived at Table ${tableNumber}`,
      status: 'pending',
      priority: 'normal',
      createdAt: new Date(),
    });

    console.log('✅ Arrival request created:', request);

    // Emit socket event to notify waiter
    if (nearestWaiter && io) {
      const notification = {
        requestId: request._id,
        type: 'customer_arrival',
        tableNumber,
        customerName,
        message: `${customerName} arrived at Table ${tableNumber}`,
        timestamp: new Date(),
        tableId,
        customerId,
        sessionId,
      };

      // Emit to specific waiter's room
      emitToRoom(`waiter-${nearestWaiter._id}`, 'customer:arrived', notification);
      
      // Also emit general waiter notification
      emitToSocket('request:new', notification);

      console.log(`📡 Notified waiter ${nearestWaiter.name}`);
    }

    res.status(201).json({
      success: true,
      message: 'Waiter notified successfully',
      notification: {
        success: true,
        request,
        assignedWaiter: nearestWaiter ? {
          id: nearestWaiter._id,
          name: nearestWaiter.name,
        } : null,
      },
      data: {
        request,
        assignedWaiter: nearestWaiter,
      }
    });
  } catch (error) {
    console.error('❌ Customer arrival notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to notify waiter',
    });
  }
});

// ============================================
// CREATE ASSISTANCE REQUEST
// ============================================
router.post('/', async (req, res) => {
  try {
    const { type, tableId, tableNumber, customerId, customerName, message, priority } = req.body;

    console.log('🔔 Creating assistance request:', { type, tableNumber });

    if (!type || !tableId || !tableNumber) {
      return res.status(400).json({
        success: false,
        message: 'Type, table ID, and table number are required',
      });
    }

    // Find nearest waiter
    const waiters = await User.find({
      role: 'waiter',
      isActive: true,
      isOnline: true,
    });

    const nearestWaiter = waiters.find(w => 
      w.assignedTables?.some(t => t.toString() === tableId)
    ) || waiters[0];

    // Create request
    const request = await Request.create({
      type,
      tableId,
      tableNumber,
      customerId,
      customerName,
      assignedTo: nearestWaiter?._id,
      message: message || `Assistance needed at Table ${tableNumber}`,
      status: 'pending',
      priority: priority || 'normal',
    });

    // Emit socket event
    if (nearestWaiter && io) {
      emitToRoom(`waiter-${nearestWaiter._id}`, 'request:new', {
        requestId: request._id,
        type,
        tableNumber,
        message: request.message,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      request,
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// GET ALL REQUESTS
// ============================================
router.get('/', async (req, res) => {
  try {
    const { status, type, tableId, assignedTo } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (tableId) filter.tableId = tableId;
    if (assignedTo) filter.assignedTo = assignedTo;

    const requests = await Request.find(filter)
      .populate('tableId', 'number capacity status')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// GET REQUEST BY ID
// ============================================
router.get('/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findById(requestId)
      .populate('tableId', 'number capacity status location')
      .populate('assignedTo', 'name email role');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    res.json({
      success: true,
      request,
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// ACKNOWLEDGE REQUEST
// ============================================
router.patch('/:requestId/acknowledge', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { waiterId } = req.body;

    const request = await Request.findByIdAndUpdate(
      requestId,
      {
        status: 'acknowledged',
        acknowledgedAt: new Date(),
        acknowledgedBy: waiterId,
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Emit socket event
    emitToSocket('request:acknowledged', {
      requestId: request._id,
      tableNumber: request.tableNumber,
    });

    res.json({
      success: true,
      message: 'Request acknowledged',
      request,
    });
  } catch (error) {
    console.error('Acknowledge request error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// COMPLETE REQUEST
// ============================================
router.patch('/:requestId/complete', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { waiterId, notes } = req.body;

    const request = await Request.findByIdAndUpdate(
      requestId,
      {
        status: 'completed',
        completedAt: new Date(),
        completedBy: waiterId,
        notes,
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Emit socket event
    emitToSocket('request:completed', {
      requestId: request._id,
      tableNumber: request.tableNumber,
    });

    res.json({
      success: true,
      message: 'Request completed',
      request,
    });
  } catch (error) {
    console.error('Complete request error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// CANCEL REQUEST
// ============================================
router.patch('/:requestId/cancel', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;

    const request = await Request.findByIdAndUpdate(
      requestId,
      {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason,
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    res.json({
      success: true,
      message: 'Request cancelled',
      request,
    });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// DELETE REQUEST
// ============================================
router.delete('/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findByIdAndDelete(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    res.json({
      success: true,
      message: 'Request deleted',
      request,
    });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
module.exports.setSocketIO = setSocketIO;