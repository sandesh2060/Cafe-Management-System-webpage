// File: backend/src/services/socketService.js
// Socket.IO service for real-time communication

const { Server } = require('socket.io');

let io;

/**
 * Initialize Socket.IO server
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.IO instance
 */
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    // Join room event
    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`📍 Socket ${socket.id} joined room: ${room}`);
    });

    // Leave room event
    socket.on('leave-room', (room) => {
      socket.leave(room);
      console.log(`🚪 Socket ${socket.id} left room: ${room}`);
    });

    // Disconnect event
    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket ${socket.id} disconnected:`, reason);
    });

    // Error event
    socket.on('error', (error) => {
      console.error(`⚠️ Socket ${socket.id} error:`, error);
    });
  });

  console.log('🔌 Socket.IO initialized');
  return io;
};

/**
 * Get Socket.IO instance
 * @returns {Object} Socket.IO instance
 * @throws {Error} If Socket.IO is not initialized
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized! Call initializeSocket(server) first.');
  }
  return io;
};

/**
 * Emit event to a specific room
 * @param {string} room - Room name
 * @param {string} event - Event name
 * @param {*} data - Data to send
 */
const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
    console.log(`📡 Emitted "${event}" to room "${room}"`);
  } else {
    console.warn('⚠️ Socket.IO not initialized, cannot emit to room');
  }
};

/**
 * Emit event to a specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {*} data - Data to send
 */
const emitToUser = (userId, event, data) => {
  if (io) {
    const room = `user-${userId}`;
    io.to(room).emit(event, data);
    console.log(`📡 Emitted "${event}" to user "${userId}"`);
  } else {
    console.warn('⚠️ Socket.IO not initialized, cannot emit to user');
  }
};

/**
 * Emit event to waiter
 * @param {string} waiterId - Waiter ID
 * @param {string} event - Event name
 * @param {*} data - Data to send
 */
const emitToWaiter = (waiterId, event, data) => {
  if (io) {
    const room = `waiter-${waiterId}`;
    io.to(room).emit(event, data);
    console.log(`📡 Emitted "${event}" to waiter "${waiterId}"`);
  } else {
    console.warn('⚠️ Socket.IO not initialized, cannot emit to waiter');
  }
};

/**
 * Emit event to kitchen
 * @param {string} event - Event name
 * @param {*} data - Data to send
 */
const emitToKitchen = (event, data) => {
  if (io) {
    io.to('kitchen').emit(event, data);
    console.log(`📡 Emitted "${event}" to kitchen`);
  } else {
    console.warn('⚠️ Socket.IO not initialized, cannot emit to kitchen');
  }
};

/**
 * Emit event to all connected clients
 * @param {string} event - Event name
 * @param {*} data - Data to send
 */
const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
    console.log(`📡 Broadcasted "${event}" to all clients`);
  } else {
    console.warn('⚠️ Socket.IO not initialized, cannot broadcast');
  }
};

/**
 * Get all connected sockets in a room
 * @param {string} room - Room name
 * @returns {Promise<Set>} Set of socket IDs
 */
const getSocketsInRoom = async (room) => {
  if (io) {
    const sockets = await io.in(room).fetchSockets();
    return new Set(sockets.map(s => s.id));
  }
  return new Set();
};

/**
 * Check if Socket.IO is initialized
 * @returns {boolean} True if initialized
 */
const isInitialized = () => {
  return !!io;
};

module.exports = {
  initializeSocket,
  getIO,
  emitToRoom,
  emitToUser,
  emitToWaiter,
  emitToKitchen,
  emitToAll,
  getSocketsInRoom,
  isInitialized,
};