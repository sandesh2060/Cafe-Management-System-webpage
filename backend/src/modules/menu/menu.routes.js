const express = require('express');
const router = express.Router();
const menuController = require('./menu.controller');

// Public routes (accessible by customers)
router.get('/', menuController.getAllMenuItems);
router.get('/categories', menuController.getMenuByCategory);
router.get('/popular', menuController.getPopularItems);
router.get('/:id', menuController.getMenuItemById);

// Admin routes (would need authentication middleware in production)
router.post('/', menuController.createMenuItem);
router.put('/:id', menuController.updateMenuItem);
router.delete('/:id', menuController.deleteMenuItem);
router.patch('/:id/availability', menuController.toggleAvailability);

module.exports = router;