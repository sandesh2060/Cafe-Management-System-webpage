// File: backend/src/app.js
// 🎯 EXPRESS APP - Configured for your exact project structure
// ✅ All routes loaded safely with error handling + All Modules
// 🔧 UPDATED: Fixed biometric routes path

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Cafe Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// SAFE ROUTE LOADER
// ============================================

const safeRequire = (path, routeName) => {
  try {
    const route = require(path);
    console.log(`✅ ${routeName} routes loaded`);
    return route;
  } catch (err) {
    console.log(`⚠️  ${routeName} routes not found (${err.message})`);
    return null;
  }
};

// ============================================
// AUTH ROUTES
// ============================================

const authRoutes = safeRequire('./auth/auth.routes', 'Auth');
if (authRoutes) {
  app.use('/api/auth', authRoutes);
}

// ============================================
// 🆕 BIOMETRIC ROUTES (Face Recognition + Fingerprint)
// ✅ FIXED: Changed from fingerprint.routes to biometric.routes
// ============================================

const biometricRoutes = safeRequire('./modules/biometric/biometric.routes', 'Biometric');
if (biometricRoutes) {
  app.use('/api/biometric', biometricRoutes);
  console.log('🔐 Biometric routes registered at /api/biometric');
}

// ============================================
// MODULE ROUTES (Based on your structure)
// ============================================

// Billing
const billingRoutes = safeRequire('./modules/billing/billing.routes', 'Billing');
if (billingRoutes) app.use('/api/billing', billingRoutes);

// Customer
const customerRoutes = safeRequire('./modules/customer/customer.routes', 'Customer');
if (customerRoutes) app.use('/api/customers', customerRoutes);

// Cart (Customer cart management)
const cartRoutes = safeRequire('./modules/customer/cart.routes', 'Cart');
if (cartRoutes) {
  app.use('/api/cart', cartRoutes);
  console.log('🛒 Cart routes registered at /api/cart');
}

// Inventory
const inventoryRoutes = safeRequire('./modules/inventory/inventory.routes', 'Inventory');
if (inventoryRoutes) app.use('/api/inventory', inventoryRoutes);

// Kitchen
const kitchenRoutes = safeRequire('./modules/kitchen/kitchen.routes', 'Kitchen');
if (kitchenRoutes) app.use('/api/kitchen', kitchenRoutes);

// Loyalty
const loyaltyRoutes = safeRequire('./modules/loyalty/loyalty.routes', 'Loyalty');
if (loyaltyRoutes) app.use('/api/loyalty', loyaltyRoutes);

// Manager (CRITICAL - WAS MISSING!)
const managerRoutes = safeRequire('./modules/manager/manager.routes', 'Manager');
if (managerRoutes) {
  app.use('/api/manager', managerRoutes);
  console.log('👔 Manager routes registered at /api/manager');
} else {
  console.error('❌ CRITICAL: Manager routes missing!');
}

// Menu
const menuRoutes = safeRequire('./modules/menu/menu.routes', 'Menu');
if (menuRoutes) app.use('/api/menu', menuRoutes);

// Notification (from your directory structure)
const notificationRoutes = safeRequire('./modules/notification/notification.routes', 'Notification');
if (notificationRoutes) {
  app.use('/api/notifications', notificationRoutes);
  console.log('🔔 Notification routes registered at /api/notifications');
}

// Order (CRITICAL)
const orderRoutes = safeRequire('./modules/order/order.routes', 'Order');
if (orderRoutes) {
  app.use('/api/orders', orderRoutes);
  console.log('🎯 Order routes registered at /api/orders');
} else {
  console.error('❌ CRITICAL: Order routes missing!');
}

// Recommendations (AI-Powered)
const recommendationsRoutes = safeRequire('./modules/recommendations/recommendations.routes', 'Recommendations');
if (recommendationsRoutes) {
  app.use('/api/recommendations', recommendationsRoutes);
  console.log('🤖 Recommendations routes registered at /api/recommendations');
}

// Request (Customer assistance)
const requestRoutes = safeRequire('./modules/request/request.routes', 'Request');
if (requestRoutes) {
  app.use('/api/requests', requestRoutes);
  console.log('🙋 Request routes registered at /api/requests');
}

// Table
const tableRoutes = safeRequire('./modules/table/table.routes', 'Table');
if (tableRoutes) app.use('/api/tables', tableRoutes);

// Table Sessions (WAS MISSING!)
const tableSessionRoutes = safeRequire('./modules/table/tableSession.routes', 'Table Sessions');
if (tableSessionRoutes) {
  app.use('/api/table-sessions', tableSessionRoutes);
  console.log('🪑 Table Session routes registered at /api/table-sessions');
}

// User
const userRoutes = safeRequire('./modules/user/user.routes', 'User');
if (userRoutes) app.use('/api/users', userRoutes);

// Waiter (CRITICAL)
const waiterRoutes = safeRequire('./modules/waiter/waiter.routes', 'Waiter');
if (waiterRoutes) {
  app.use('/api/waiter', waiterRoutes);
  console.log('👨‍🍳 Waiter routes registered at /api/waiter');
} else {
  console.error('❌ CRITICAL: Waiter routes missing!');
}

// Waiter Assignment (WAS MISSING!)
const waiterAssignmentRoutes = safeRequire('./modules/waiter/waiter-assignment.routes', 'Waiter Assignment');
if (waiterAssignmentRoutes) {
  app.use('/api/waiter-assignment', waiterAssignmentRoutes);
  console.log('📋 Waiter Assignment routes registered at /api/waiter-assignment');
}

// Zone (from your directory structure)
const zoneRoutes = safeRequire('./modules/zone/zone.routes', 'Zone');
if (zoneRoutes) {
  app.use('/api/zones', zoneRoutes);
  console.log('🗺️  Zone routes registered at /api/zones');
}

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  console.log(`🔴 Not Found: Route ${req.originalUrl} not found`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404,
    availableRoutes: [
      '/api/health',
      '/api/auth/*',
      '/api/biometric/*',
      '/api/billing/*',
      '/api/cart/*',
      '/api/customers/*',
      '/api/inventory/*',
      '/api/kitchen/*',
      '/api/loyalty/*',
      '/api/manager/*',
      '/api/menu/*',
      '/api/notifications/*',
      '/api/orders/*',
      '/api/recommendations/*',
      '/api/requests/*',
      '/api/tables/*',
      '/api/table-sessions/*',
      '/api/users/*',
      '/api/waiter/*',
      '/api/waiter-assignment/*',
      '/api/zones/*'
    ]
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: err.stack,
      error: err 
    })
  });
});

module.exports = app;