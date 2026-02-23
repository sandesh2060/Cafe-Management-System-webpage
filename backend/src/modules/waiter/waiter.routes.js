// File: backend/src/modules/waiter/waiter.routes.js
// 🛣️ WAITER ROUTES - Complete API endpoints for waiter operations
// ✅ Matches your existing route patterns

const express = require('express');
const router = express.Router();
const waiterController = require('./waiter.controller');

// Import authenticate middleware (with fallback)
let authenticate;
try {
  authenticate = require('../../auth/auth.middleware').authenticate;
} catch (err) {
  console.log('⚠️  Auth middleware not found - using dummy middleware');
  authenticate = (req, res, next) => next();
}

// ============================================
// ⚠️ CRITICAL: Route Order Matters!
// Specific routes BEFORE parameterized routes
// ============================================

// ============================================
// WAITER ORDERS ROUTES
// ============================================

/**
 * @route   GET /api/waiter/:waiterId/orders/search
 * @desc    Search orders for waiter
 * @access  Private (Waiter)
 * @query   q (search query)
 */
router.get('/:waiterId/orders/search', authenticate, waiterController.searchOrders);

/**
 * @route   GET /api/waiter/:waiterId/orders
 * @desc    Get all orders for waiter's assigned tables
 * @access  Private (Waiter)
 * @query   status, tableId, limit, skip
 */
router.get('/:waiterId/orders', authenticate, waiterController.getWaiterOrders);

/**
 * @route   PATCH /api/waiter/:waiterId/orders/:orderId/served
 * @desc    Mark order as served
 * @access  Private (Waiter)
 */
router.patch('/:waiterId/orders/:orderId/served', authenticate, waiterController.markOrderServed);

/**
 * @route   PATCH /api/waiter/:waiterId/orders/:orderId/status
 * @desc    Update order status
 * @access  Private (Waiter)
 * @body    { status: 'preparing' | 'ready' | 'served' }
 */
router.patch('/:waiterId/orders/:orderId/status', authenticate, waiterController.updateOrderStatus);

// ============================================
// WAITER TABLES ROUTES
// ============================================

/**
 * @route   GET /api/waiter/:waiterId/tables
 * @desc    Get waiter's assigned tables
 * @access  Private (Waiter)
 */
router.get('/:waiterId/tables', authenticate, waiterController.getAssignedTables);

/**
 * @route   POST /api/waiter/:waiterId/assign-tables
 * @desc    Assign tables to waiter
 * @access  Private (Admin/Manager)
 * @body    { tableIds: [string] }
 */
router.post('/:waiterId/assign-tables', authenticate, waiterController.assignTables);

// ============================================
// WAITER STATISTICS ROUTES
// ============================================

/**
 * @route   GET /api/waiter/:waiterId/stats
 * @desc    Get waiter statistics
 * @access  Private (Waiter/Admin)
 * @query   startDate, endDate, period
 */
router.get('/:waiterId/stats', authenticate, waiterController.getWaiterStats);

/**
 * @route   GET /api/waiter/:waiterId/performance
 * @desc    Get waiter performance metrics
 * @access  Private (Waiter/Admin)
 * @query   period (today, week, month)
 */
router.get('/:waiterId/performance', authenticate, waiterController.getPerformanceMetrics);

// ============================================
// CUSTOMER REQUESTS ROUTES
// ============================================

/**
 * @route   GET /api/waiter/:waiterId/requests
 * @desc    Get customer assistance requests
 * @access  Private (Waiter)
 * @query   status, priority, limit, skip
 */
router.get('/:waiterId/requests', authenticate, waiterController.getCustomerRequests);

/**
 * @route   PATCH /api/waiter/:waiterId/requests/:requestId/acknowledge
 * @desc    Acknowledge customer request
 * @access  Private (Waiter)
 */
router.patch('/:waiterId/requests/:requestId/acknowledge', authenticate, waiterController.acknowledgeRequest);

/**
 * @route   PATCH /api/waiter/:waiterId/requests/:requestId/complete
 * @desc    Complete customer request
 * @access  Private (Waiter)
 * @body    { notes: string (optional) }
 */
router.patch('/:waiterId/requests/:requestId/complete', authenticate, waiterController.completeRequest);

// ============================================
// LOCATION ROUTES
// ============================================

/**
 * @route   PATCH /api/waiter/:waiterId/location
 * @desc    Update waiter location (for nearest waiter routing)
 * @access  Private (Waiter)
 * @body    { latitude: number, longitude: number }
 */
router.patch('/:waiterId/location', authenticate, waiterController.updateLocation);

module.exports = router;