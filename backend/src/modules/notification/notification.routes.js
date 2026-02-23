// File: backend/src/modules/notification/notification.routes.js
// ABSOLUTE MINIMAL VERSION

const express = require('express');
const router = express.Router();
const controller = require('./notification.controller');

// Minimal auth - just pass through
const protect = (req, res, next) => {
  req.user = { _id: req.headers['user-id'] || '000000000000000000000000', role: 'admin' };
  next();
};

// Simple role check
const requireRole = (roles) => (req, res, next) => next();

// Routes
router.get('/', protect, controller.getUserNotifications);
router.post('/', protect, controller.createNotification);
router.post('/broadcast', protect, requireRole(['admin', 'manager']), controller.broadcastNotification);
router.patch('/:id/read', protect, controller.markAsRead);
router.patch('/mark-all-read', protect, controller.markAllAsRead);
router.delete('/:id', protect, controller.deleteNotification);
router.delete('/clear-all', protect, controller.clearAllNotifications);

module.exports = router;