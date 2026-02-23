// File: backend/src/modules/table/tableSession.routes.js
// 🪑 TABLE SESSION ROUTES - MATCHES YOUR EXACT MODEL

const express = require('express');
const router = express.Router();
const TableSession = require('./tableSession.model');
const Table = require('./table.model');

// ============================================
// START TABLE SESSION
// ============================================
router.post('/start', async (req, res) => {
  try {
    const { table, customer, tableNumber, customerName, method, location } = req.body;

    console.log('🚀 Starting table session:', { table, customer, tableNumber, customerName });

    // Validate required fields (matching your model)
    if (!table || !customer) {
      return res.status(400).json({
        success: false,
        message: 'Table and customer IDs are required',
      });
    }

    // Check if table exists
    const tableDoc = await Table.findById(table);
    if (!tableDoc) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    // Check if there's already an active session for this table
    let session = await TableSession.findOne({
      table: table,
      status: 'active',
    });

    if (session) {
      console.log('✅ Active session already exists:', session);
      
      return res.status(200).json({
        success: true,
        message: 'Active session found',
        session,
        data: { session }
      });
    }

    // Create new session - EXACT MATCH TO YOUR MODEL
    session = await TableSession.create({
      table: table,           // ✅ ObjectId ref to Table
      customer: customer,     // ✅ ObjectId ref to Customer
      status: 'active',       // ✅ Enum: active/completed/cancelled
      startTime: new Date(),  // ✅ Date (has default but we set it explicitly)
      orders: [],             // ✅ Array of Order refs (empty initially)
      totalAmount: 0,         // ✅ Number (default 0)
      notes: `${customerName} - ${method} login`, // ✅ Optional string
    });

    // Update table status to occupied
    await Table.findByIdAndUpdate(table, {
      status: 'occupied',
      currentSession: session._id,
    });

    console.log('✅ New session created:', session);

    res.status(201).json({
      success: true,
      message: 'Session started successfully',
      session,
      data: { session }
    });
  } catch (error) {
    console.error('❌ Start session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start session',
    });
  }
});

// ============================================
// GET ACTIVE SESSION BY TABLE ID
// ============================================
router.get('/active/:tableId', async (req, res) => {
  try {
    const { tableId } = req.params;

    const session = await TableSession.findOne({
      table: tableId,
      status: 'active',
    })
      .populate('table', 'number capacity status')
      .populate('customer', 'name email phoneNumber')
      .populate('orders');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active session found for this table',
      });
    }

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Get active session error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// GET SESSION BY ID
// ============================================
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await TableSession.findById(sessionId)
      .populate('table', 'number capacity status location')
      .populate('customer', 'name email phoneNumber')
      .populate('orders');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// GET ALL SESSIONS
// ============================================
router.get('/', async (req, res) => {
  try {
    const { status, tableId, customerId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (tableId) filter.table = tableId;
    if (customerId) filter.customer = customerId;

    const sessions = await TableSession.find(filter)
      .populate('table', 'number capacity status')
      .populate('customer', 'name email phoneNumber')
      .populate('orders')
      .sort({ startTime: -1 });

    res.json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// ADD ORDER TO SESSION
// ============================================
router.post('/:sessionId/add-order', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { orderId, orderAmount } = req.body;

    const session = await TableSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    if (session.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Session is not active',
      });
    }

    // Add order to session
    if (!session.orders.includes(orderId)) {
      session.orders.push(orderId);
      session.totalAmount += orderAmount || 0;
      await session.save();
    }

    res.json({
      success: true,
      message: 'Order added to session',
      session,
    });
  } catch (error) {
    console.error('Add order error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// END SESSION
// ============================================
router.post('/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { notes } = req.body;

    const session = await TableSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Update session
    session.status = 'completed';
    session.endTime = new Date();
    if (notes) session.notes = notes;
    await session.save();

    // Update table status to available
    await Table.findByIdAndUpdate(session.table, {
      status: 'available',
      currentSession: null,
    });

    console.log('✅ Session ended:', session);

    res.json({
      success: true,
      message: 'Session ended successfully',
      session,
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// CANCEL SESSION
// ============================================
router.post('/:sessionId/cancel', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;

    const session = await TableSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    session.status = 'cancelled';
    session.endTime = new Date();
    session.notes = reason || 'Session cancelled';
    await session.save();

    // Update table status
    await Table.findByIdAndUpdate(session.table, {
      status: 'available',
      currentSession: null,
    });

    res.json({
      success: true,
      message: 'Session cancelled',
      session,
    });
  } catch (error) {
    console.error('Cancel session error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;