// ================================================================
// FILE: backend/src/modules/customer/customer.routes.js
// 👥 CUSTOMER ROUTES - COMPLETE & PRODUCTION READY
// ✅ Nested cart & favorites routes
// ✅ Stats endpoint
// ✅ All CRUD operations
// ================================================================

const express = require('express');
const router = express.Router();
const customerController = require('./customer.controller');

// ============================================
// NESTED ROUTES (MUST BE BEFORE :customerId)
// ============================================
const cartRoutes = require('./cart.routes');
const favoritesRoutes = require('./favorites.routes');

// Mount nested routes
// All cart operations: /api/customers/:customerId/cart/*
router.use('/:customerId/cart', cartRoutes);

// All favorites operations: /api/customers/:customerId/favorites/*
router.use('/:customerId/favorites', favoritesRoutes);

// ============================================
// SPECIFIC CUSTOMER ROUTES (BEFORE :customerId)
// ============================================

/**
 * GET /api/customers/:customerId/stats
 * Get comprehensive customer statistics
 * - Orders, spending, ratings
 * - Loyalty points, visit count
 * - Average order value
 * ⚠️ MUST come BEFORE the general /:customerId route
 */
router.get('/:customerId/stats', customerController.getCustomerStats);

// ============================================
// GENERAL CUSTOMER ROUTES
// ============================================

/**
 * POST /api/customers/register
 * Register new customer
 * Body: { username, displayName?, email?, phone?, tableId, tableNumber, descriptorSample? }
 * - Creates new customer account
 * - Optional face recognition data
 * - Starts table session
 */
router.post('/register', customerController.register);

/**
 * GET /api/customers
 * Get all customers (admin/staff only)
 * Query params: page, limit, search
 * ⚠️ MUST be before /:customerId to avoid route conflict
 */
router.get('/', customerController.getAllCustomers);

/**
 * GET /api/customers/:customerId
 * Get customer by ID
 * Returns customer profile (excluding sensitive biometric data)
 */
router.get('/:customerId', customerController.getCustomer);

/**
 * PUT /api/customers/:customerId
 * Update customer profile
 * Body: { displayName?, email?, phone? }
 */
router.put('/:customerId', customerController.updateCustomer);

/**
 * DELETE /api/customers/:customerId
 * Delete customer account
 * Removes all customer data including biometric data
 */
router.delete('/:customerId', customerController.deleteCustomer);

// ============================================
// HEALTH CHECK
// ============================================
router.get('/health/check', (req, res) => {
  res.json({
    success: true,
    service: 'Customer Service',
    status: 'operational',
    timestamp: new Date().toISOString(),
    routes: {
      registration: 'POST /api/customers/register',
      getAll: 'GET /api/customers',
      getById: 'GET /api/customers/:customerId',
      stats: 'GET /api/customers/:customerId/stats',
      update: 'PUT /api/customers/:customerId',
      delete: 'DELETE /api/customers/:customerId',
      cart: '/api/customers/:customerId/cart/*',
      favorites: '/api/customers/:customerId/favorites/*'
    }
  });
});

module.exports = router;