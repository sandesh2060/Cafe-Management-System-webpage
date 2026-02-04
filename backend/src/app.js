// backend/src/app.js
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const compression = require('compression')
const morgan = require('morgan')
const path = require('path')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')

// Import middleware
const { errorHandler } = require('./middleware/errorHandler')
const { logger } = require('./middleware/logger')

// Import routes
const authRoutes = require('./routes/authRoutes')

// Customer routes
const customerMenuRoutes = require('./routes/customer/menuRoutes')
const customerOrderRoutes = require('./routes/customer/orderRoutes')
const customerCartRoutes = require('./routes/customer/cartRoutes')
const customerOfferRoutes = require('./routes/customer/offerRoutes')
const customerLoyaltyRoutes = require('./routes/customer/loyaltyRoutes')
const customerReviewRoutes = require('./routes/customer/reviewRoutes')
const customerSessionRoutes = require('./routes/customer/sessionRoutes')

// SuperAdmin routes
const superadminUserRoutes = require('./routes/superadmin/userRoutes')
const superadminMenuRoutes = require('./routes/superadmin/menuManagementRoutes')
const superadminOfferRoutes = require('./routes/superadmin/offerManagementRoutes')
const superadminLoyaltyRoutes = require('./routes/superadmin/loyaltyManagementRoutes')
const superadminReportRoutes = require('./routes/superadmin/reportRoutes')
const superadminSettingsRoutes = require('./routes/superadmin/settingsRoutes')

// Cashier routes
const cashierBillingRoutes = require('./routes/cashier/billingRoutes')
const cashierCashFlowRoutes = require('./routes/cashier/cashFlowRoutes')
const cashierTransactionRoutes = require('./routes/cashier/transactionRoutes')
const cashierReportRoutes = require('./routes/cashier/reportRoutes')
const cashierPaymentRoutes = require('./routes/cashier/paymentRoutes')

// Chef routes
const chefKitchenRoutes = require('./routes/chef/kitchenRoutes')
const chefOrderQueueRoutes = require('./routes/chef/orderQueueRoutes')
const chefInventoryRoutes = require('./routes/chef/inventoryRoutes')
const chefRecipeRoutes = require('./routes/chef/recipeRoutes')

// Waiter routes
const waiterTableRoutes = require('./routes/waiter/tableRoutes')
const waiterOrderRoutes = require('./routes/waiter/orderRoutes')
const waiterTipRoutes = require('./routes/waiter/tipRoutes')

/**
 * Initialize Express App
 */
const app = express()

/**
 * Trust Proxy (for rate limiting behind reverse proxy)
 */
app.set('trust proxy', 1)

/**
 * Security Middleware
 */
// Helmet - Set security HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5173',
    ]
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
}

app.use(cors(corsOptions))

/**
 * Rate Limiting
 */
// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Auth route rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
})

/**
 * Body Parser Middleware
 */
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

/**
 * Data Sanitization
 */
// Against NoSQL query injection
app.use(mongoSanitize())

/**
 * Compression Middleware
 */
app.use(compression())

/**
 * Logging Middleware
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined', { stream: logger.stream }))
}

// Custom request logger
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`)
  next()
})

/**
 * Static Files
 */
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

/**
 * Health Check Route
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  })
})

/**
 * API Version Info
 */
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Cafe Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      customer: '/api/v1/customer',
      superadmin: '/api/v1/superadmin',
      cashier: '/api/v1/cashier',
      chef: '/api/v1/chef',
      waiter: '/api/v1/waiter',
    },
  })
})

/**
 * API Routes - Version 1
 */
const API_VERSION = '/api/v1'

// Authentication Routes
app.use(`${API_VERSION}/auth`, authLimiter, authRoutes)

// Customer Routes
app.use(`${API_VERSION}/customer/menu`, apiLimiter, customerMenuRoutes)
app.use(`${API_VERSION}/customer/orders`, apiLimiter, customerOrderRoutes)
app.use(`${API_VERSION}/customer/cart`, apiLimiter, customerCartRoutes)
app.use(`${API_VERSION}/customer/offers`, apiLimiter, customerOfferRoutes)
app.use(`${API_VERSION}/customer/loyalty`, apiLimiter, customerLoyaltyRoutes)
app.use(`${API_VERSION}/customer/reviews`, apiLimiter, customerReviewRoutes)
app.use(`${API_VERSION}/customer/session`, apiLimiter, customerSessionRoutes)

// SuperAdmin Routes
app.use(`${API_VERSION}/superadmin/users`, apiLimiter, superadminUserRoutes)
app.use(`${API_VERSION}/superadmin/menu`, apiLimiter, superadminMenuRoutes)
app.use(`${API_VERSION}/superadmin/offers`, apiLimiter, superadminOfferRoutes)
app.use(`${API_VERSION}/superadmin/loyalty`, apiLimiter, superadminLoyaltyRoutes)
app.use(`${API_VERSION}/superadmin/reports`, apiLimiter, superadminReportRoutes)
app.use(`${API_VERSION}/superadmin/settings`, apiLimiter, superadminSettingsRoutes)

// Cashier Routes
app.use(`${API_VERSION}/cashier/billing`, apiLimiter, cashierBillingRoutes)
app.use(`${API_VERSION}/cashier/cash`, apiLimiter, cashierCashFlowRoutes)
app.use(`${API_VERSION}/cashier/transactions`, apiLimiter, cashierTransactionRoutes)
app.use(`${API_VERSION}/cashier/reports`, apiLimiter, cashierReportRoutes)
app.use(`${API_VERSION}/cashier/payment`, apiLimiter, cashierPaymentRoutes)

// Chef Routes
app.use(`${API_VERSION}/chef/kitchen`, apiLimiter, chefKitchenRoutes)
app.use(`${API_VERSION}/chef/orders`, apiLimiter, chefOrderQueueRoutes)
app.use(`${API_VERSION}/chef/inventory`, apiLimiter, chefInventoryRoutes)
app.use(`${API_VERSION}/chef/recipes`, apiLimiter, chefRecipeRoutes)

// Waiter Routes
app.use(`${API_VERSION}/waiter/tables`, apiLimiter, waiterTableRoutes)
app.use(`${API_VERSION}/waiter/orders`, apiLimiter, waiterOrderRoutes)
app.use(`${API_VERSION}/waiter/tips`, apiLimiter, waiterTipRoutes)

/**
 * 404 Handler - Route Not Found
 */
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
    availableRoutes: [
      '/health',
      '/api',
      `${API_VERSION}/auth`,
      `${API_VERSION}/customer/*`,
      `${API_VERSION}/superadmin/*`,
      `${API_VERSION}/cashier/*`,
      `${API_VERSION}/chef/*`,
      `${API_VERSION}/waiter/*`,
    ],
  })
})

/**
 * Global Error Handler
 * Must be last middleware
 */
app.use(errorHandler)

/**
 * Export App
 */
module.exports = app