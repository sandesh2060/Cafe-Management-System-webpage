// ================================================================
// FILE: backend/src/modules/customer/favorites.routes.js
// ⭐ FAVORITES ROUTES - Nested under /api/customers/:customerId
// ================================================================

const express = require('express');
const router = express.Router({ mergeParams: true });
const favoritesController = require('./favorites.controller');

/**
 * GET /api/customers/:customerId/favorites
 * Get customer's favorite items
 */
router.get('/', favoritesController.getFavorites);

/**
 * POST /api/customers/:customerId/favorites/:menuItemId
 * Add item to favorites
 */
router.post('/:menuItemId', favoritesController.addFavorite);

/**
 * DELETE /api/customers/:customerId/favorites/:menuItemId
 * Remove item from favorites
 */
router.delete('/:menuItemId', favoritesController.removeFavorite);

/**
 * POST /api/customers/:customerId/favorites/:menuItemId/toggle
 * Toggle favorite status
 */
router.post('/:menuItemId/toggle', favoritesController.toggleFavorite);

module.exports = router;