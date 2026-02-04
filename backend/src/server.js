// backend/src/server.js
const http = require('http')
const app = require('./app')
const mongoose = require('mongoose')
const { Server } = require('socket.io')

// Load environment variables
require('dotenv').config()

// Import socket handlers
const { setupOrderSocket } = require('./websockets/orderSocket')
const { setupKitchenSocket } = require('./websockets/kitchenSocket')
const { setupTableSocket } = require('./websockets/tableSocket')

/**
 * Server Configuration
 */
const PORT = process.env.PORT || 5000
const NODE_ENV = process.env.NODE_ENV || 'development'
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe-management'

/**
 * Create HTTP Server
 */
const server = http.createServer(app)

/**
 * Initialize Socket.IO
 */
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  pingTimeout: 60000,
  pingInterval: 25000
})

// Make io accessible to routes
app.set('io', io)

/**
 * Setup WebSocket Handlers
 */
io.on('connection', (socket) => {
  console.log(`✅ New client connected: ${socket.id}`)

  // Setup different socket handlers
  setupOrderSocket(io, socket)
  setupKitchenSocket(io, socket)
  setupTableSocket(io, socket)

  socket.on('disconnect', (reason) => {
    console.log(`❌ Client disconnected: ${socket.id} - Reason: ${reason}`)
  })

  socket.on('error', (error) => {
    console.error(`🔴 Socket error for ${socket.id}:`, error)
  })
})

/**
 * MongoDB Connection with Retry Logic
 */
const connectDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })

      console.log('✅ MongoDB Connected Successfully')
      console.log(`📊 Database: ${mongoose.connection.name}`)
      console.log(`🔗 Host: ${mongoose.connection.host}`)
      
      // Setup database event listeners
      setupDatabaseListeners()
      
      return true
    } catch (error) {
      console.error(`❌ MongoDB Connection Failed (Attempt ${i + 1}/${retries}):`, error.message)
      
      if (i === retries - 1) {
        console.error('🔴 All connection attempts failed. Exiting...')
        process.exit(1)
      }
      
      console.log(`⏳ Retrying in ${delay / 1000} seconds...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

/**
 * Setup Database Event Listeners
 */
const setupDatabaseListeners = () => {
  mongoose.connection.on('error', (err) => {
    console.error('🔴 MongoDB connection error:', err)
  })

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...')
  })

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully')
  })

  mongoose.connection.on('close', () => {
    console.log('🔴 MongoDB connection closed')
  })
}

/**
 * Graceful Shutdown Handler
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️ ${signal} received. Starting graceful shutdown...`)

  try {
    // Close HTTP server
    server.close(async () => {
      console.log('✅ HTTP server closed')

      // Close Socket.IO connections
      io.close(() => {
        console.log('✅ Socket.IO connections closed')
      })

      // Close MongoDB connection
      await mongoose.connection.close(false)
      console.log('✅ MongoDB connection closed')

      console.log('✅ Graceful shutdown completed')
      process.exit(0)
    })

    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error('⚠️ Forcing shutdown after timeout')
      process.exit(1)
    }, 30000)
  } catch (error) {
    console.error('🔴 Error during shutdown:', error)
    process.exit(1)
  }
}

/**
 * Process Event Handlers
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

process.on('uncaughtException', (error) => {
  console.error('🔴 Uncaught Exception:', error)
  gracefulShutdown('uncaughtException')
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 Unhandled Rejection at:', promise, 'reason:', reason)
  gracefulShutdown('unhandledRejection')
})

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Connect to database
    await connectDB()

    // Start HTTP server
    server.listen(PORT, () => {
      console.log('\n' + '='.repeat(60))
      console.log('🚀 SERVER STARTED SUCCESSFULLY')
      console.log('='.repeat(60))
      console.log(`📍 Server running on: http://localhost:${PORT}`)
      console.log(`🌍 Environment: ${NODE_ENV}`)
      console.log(`⏰ Started at: ${new Date().toLocaleString()}`)
      console.log(`🔌 Socket.IO: Enabled`)
      console.log(`📦 API Version: v1`)
      console.log('='.repeat(60) + '\n')

      // Log available routes in development
      if (NODE_ENV === 'development') {
        console.log('📋 Available Routes:')
        console.log('   - Health Check: GET /health')
        console.log('   - API Docs: GET /api-docs')
        console.log('   - Customer: /api/v1/customer/*')
        console.log('   - SuperAdmin: /api/v1/superadmin/*')
        console.log('   - Cashier: /api/v1/cashier/*')
        console.log('   - Chef: /api/v1/chef/*')
        console.log('   - Waiter: /api/v1/waiter/*')
        console.log('   - Auth: /api/v1/auth/*')
        console.log('\n')
      }
    })

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`🔴 Port ${PORT} is already in use`)
        process.exit(1)
      } else {
        console.error('🔴 Server error:', error)
        process.exit(1)
      }
    })
  } catch (error) {
    console.error('🔴 Failed to start server:', error)
    process.exit(1)
  }
}

// Start the server
startServer()

// Export server and io for testing
module.exports = { server, io }