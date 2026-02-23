// ================================================================
// FILE: backend/src/modules/order/order.routes.js
// 🎯 ORDER ROUTES - Complete route configuration
// ⚠️  ROUTE ORDER MATTERS: Specific routes BEFORE parameterized routes!
// ================================================================

const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');

// ============================================
// SPECIFIC ROUTES (MUST COME FIRST!)
// ============================================

/**
 * GET /api/orders/customer/:customerId
 * Get all orders for a specific customer
 * Query params: status (comma-separated), limit, skip
 * Example: /api/orders/customer/123?status=pending,confirmed&limit=10
 * ⚠️  MUST be before /api/orders/:orderId
 */
router.get('/customer/:customerId', orderController.getCustomerOrders);

/**
 * GET /api/orders/table/:tableId
 * Get orders for a specific table
 * Query params: activeOnly (true/false)
 * ⚠️  MUST be before /api/orders/:orderId
 */
router.get('/table/:tableId', orderController.getTableOrders);

/**
 * GET /api/orders/kitchen/queue
 * Get kitchen queue (confirmed + preparing orders)
 * ⚠️  MUST be before /api/orders/:orderId
 */
router.get('/kitchen/queue', orderController.getKitchenQueue);

/**
 * GET /api/orders/active
 * Get all active orders (pending through served)
 * ⚠️  MUST be before /api/orders/:orderId
 */
router.get('/active', orderController.getActiveOrders);

/**
 * GET /api/orders/stats
 * Get order statistics
 * Query params: startDate, endDate
 * ⚠️  MUST be before /api/orders/:orderId
 */
router.get('/stats', orderController.getOrderStatistics);

// ============================================
// MAIN ORDER ROUTES
// ============================================

/**
 * POST /api/orders
 * Create a new order
 * Body: { customerId, tableId, items[], notes, specialInstructions }
 */
router.post('/', orderController.createOrder);

/**
 * GET /api/orders
 * Get all orders with filters
 * Query params: status, paymentStatus, startDate, endDate, limit, skip, sortBy, sortOrder
 */
router.get('/', orderController.getAllOrders);

/**
 * GET /api/orders/:orderId
 * Get order by ID with full details
 * ⚠️  MUST come AFTER specific routes like /customer, /table, /active, etc.
 */
router.get('/:orderId', orderController.getOrderById);

/**
 * GET /api/orders/:orderId/track
 * Track order status with timeline
 */
router.get('/:orderId/track', orderController.trackOrder);

/**
 * POST /api/orders/:orderId/items
 * Add items to an existing order
 * Body: { items: [{ menuItemId, name, quantity, price, customizations }] }
 */
router.post('/:orderId/items', orderController.addItemsToOrder);

/**
 * DELETE /api/orders/:orderId/items/:itemId
 * Remove an item from an order (only for pending/confirmed orders)
 */
router.delete('/:orderId/items/:itemId', orderController.removeItemFromOrder);

/**
 * PATCH /api/orders/:orderId/status
 * Update order status
 * Body: { status, notes, updatedBy }
 */
router.patch('/:orderId/status', orderController.updateOrderStatus);

/**
 * PATCH /api/orders/:orderId/cancel
 * Cancel order
 * Body: { reason, cancelledBy }
 */
router.patch('/:orderId/cancel', orderController.cancelOrder);

module.exports = router;