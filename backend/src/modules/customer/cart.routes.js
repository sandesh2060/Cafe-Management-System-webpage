// ================================================================
// FILE: backend/src/modules/customer/cart.routes.js
// 🛒 CART ROUTES - Nested under /api/customers/:customerId
// ================================================================

const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :customerId
const cartController = require('./cart.controller');

/**
 * GET /api/customers/:customerId/cart
 * Get customer's cart
 */
router.get('/', cartController.getCart);

/**
 * POST /api/customers/:customerId/cart/items
 * Add item to cart
 * Body: { menuItemId, quantity, customizations }
 */
router.post('/items', cartController.addItem);

/**
 * PUT /api/customers/:customerId/cart/items/:itemId
 * Update cart item quantity
 * Body: { quantity }
 */
router.put('/items/:itemId', cartController.updateItem);

/**
 * DELETE /api/customers/:customerId/cart/items/:itemId
 * Remove item from cart
 */
router.delete('/items/:itemId', cartController.removeItem);

/**
 * DELETE /api/customers/:customerId/cart
 * Clear entire cart
 */
router.delete('/', cartController.clearCart);

/**
 * POST /api/customers/:customerId/cart/sync
 * Sync cart from frontend (bulk update)
 * Body: { items: [{ menuItemId, quantity, customizations }] }
 */
router.post('/sync', cartController.syncCart);

/**
 * POST /api/customers/:customerId/cart/validate
 * Validate cart items and calculate totals
 */
router.post('/validate', cartController.validateCart);

module.exports = router;