// File: backend/src/server.js
// 🎯 SERVER STARTUP FILE WITH SOCKET.IO
// ✅ Real-time waiter notifications & proximity-based routing
// ✅ Modern MongoDB connection (no deprecated options)

const app = require('./app');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();

// ============================================
// CONFIGURATION
// ============================================

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe-management';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ============================================
// CREATE HTTP SERVER
// ============================================

const httpServer = http.createServer(app);

// ============================================
// SOCKET.IO SETUP
// ============================================

const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Make io accessible to routes
app.set('io', io);

// Connected users storage
const connectedWaiters = new Map(); // waiterId -> socketId
const connectedCustomers = new Map(); // customerId -> socketId

// ============================================
// SOCKET.IO EVENT HANDLERS
// ============================================

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Waiter connects
  socket.on('waiter:connect', (data) => {
    const { waiterId, name } = data;
    connectedWaiters.set(waiterId, {
      socketId: socket.id,
      name,
      connectedAt: new Date(),
      location: null
    });
    
    // Join waiter-specific room
    socket.join(`waiter-${waiterId}`);
    
    console.log(`👨‍🍳 Waiter connected: ${name} (${waiterId})`);
    
    // Send confirmation
    socket.emit('waiter:connected', {
      success: true,
      waiterId,
      message: 'Connected to notification system'
    });
  });

  // Update waiter location for proximity matching
  socket.on('waiter:location', (data) => {
    const { waiterId, latitude, longitude } = data;
    const waiter = connectedWaiters.get(waiterId);
    
    if (waiter) {
      waiter.location = { latitude, longitude, updatedAt: new Date() };
      connectedWaiters.set(waiterId, waiter);
      console.log(`📍 Waiter location updated: ${waiterId}`);
    }
  });

  // Customer connects
  socket.on('customer:connect', (data) => {
    const { customerId, tableNumber } = data;
    connectedCustomers.set(customerId, {
      socketId: socket.id,
      tableNumber,
      connectedAt: new Date()
    });
    
    socket.join(`table-${tableNumber}`);
    
    console.log(`👤 Customer connected: ${customerId} at Table ${tableNumber}`);
  });

  // Handle waiter accepting request
  socket.on('request:accept', async (data) => {
    const { requestId, waiterId } = data;
    
    console.log(`✅ Request ${requestId} accepted by waiter ${waiterId}`);
    
    // Notify other waiters that request was accepted
    io.emit('request:accepted', {
      requestId,
      waiterId,
      acceptedAt: new Date()
    });
    
    // Notify customer
    const Request = require('./modules/request/request.model');
    const request = await Request.findById(requestId).populate('tableId');
    
    if (request?.tableId?.number) {
      io.to(`table-${request.tableId.number}`).emit('waiter:assigned', {
        requestId,
        waiterId,
        message: 'A waiter is on the way!'
      });
    }
  });

  // Handle waiter passing request
  socket.on('request:pass', (data) => {
    const { requestId, waiterId } = data;
    
    console.log(`⏭️ Request ${requestId} passed by waiter ${waiterId}`);
    
    // Trigger escalation to next waiter
    io.emit('request:passed', {
      requestId,
      passedBy: waiterId,
      passedAt: new Date()
    });
  });

  // Waiter joins table room (for order updates)
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`📍 Socket ${socket.id} joined room: ${room}`);
  });

  // Waiter leaves table room
  socket.on('leave-room', (room) => {
    socket.leave(room);
    console.log(`🚪 Socket ${socket.id} left room: ${room}`);
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`❌ Client disconnected: ${socket.id} (${reason})`);
    
    // Remove from connected waiters
    for (const [waiterId, data] of connectedWaiters.entries()) {
      if (data.socketId === socket.id) {
        connectedWaiters.delete(waiterId);
        console.log(`👨‍🍳 Waiter disconnected: ${waiterId}`);
        break;
      }
    }
    
    // Remove from connected customers
    for (const [customerId, data] of connectedCustomers.entries()) {
      if (data.socketId === socket.id) {
        connectedCustomers.delete(customerId);
        console.log(`👤 Customer disconnected: ${customerId}`);
        break;
      }
    }
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('⚠️ Socket error:', error);
  });
});

// Make connected users accessible
app.set('connectedWaiters', connectedWaiters);
app.set('connectedCustomers', connectedCustomers);

// ============================================
// DATABASE CONNECTION
// ============================================

const connectDB = async () => {
  try {
    // ✅ Modern connection - no deprecated options needed for MongoDB driver v4+
    const conn = await mongoose.connect(MONGODB_URI);

    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🖥️  Host: ${conn.connection.host}`);
    
    // Log all registered models
    const models = mongoose.modelNames();
    if (models.length > 0) {
      console.log('📦 Registered models:', models.join(', '));
    }
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('❌ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const gracefulShutdown = async () => {
  console.log('\n⚠️  Shutting down gracefully...');
  
  try {
    // Close Socket.IO connections
    io.close(() => {
      console.log('✅ Socket.IO server closed');
    });
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start HTTP + Socket.IO server
    httpServer.listen(PORT, () => {
      console.log('🚀 Server started successfully');
      console.log(`📡 API URL: http://localhost:${PORT}/api`);
      console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
      console.log(`🔌 Socket.IO: ws://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('\n✨ Server is ready to accept requests\n');
    });

    // Handle server errors
    httpServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error('❌ Server error:', error);
      }
      gracefulShutdown();
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Export for testing
module.exports = { httpServer, io };