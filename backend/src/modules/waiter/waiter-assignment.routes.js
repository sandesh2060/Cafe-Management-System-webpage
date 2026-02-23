// File: backend/src/modules/waiter/waiter-assignment.routes.js
// 🎯 WAITER ASSIGNMENT ROUTES

const express = require('express');
const router = express.Router();
const {
  assignOrderToWaiter,
  acceptOrderAssignment,
  passOrderAssignment,
  getMyPendingAssignments,
} = require('./waiter-assignment.controller');
const { authenticateToken, authorizeRole } = require('../../middleware/auth');

// ==========================================
// ADMIN/SYSTEM ROUTES
// ==========================================

/**
 * POST /api/waiter-assignment/assign/:orderId
 * Auto-assign order to nearest waiter
 * Called automatically when new order is placed
 */
router.post(
  '/assign/:orderId',
  authenticateToken,
  authorizeRole(['admin', 'kitchen', 'system']),
  assignOrderToWaiter
);

// ==========================================
// WAITER ROUTES
// ==========================================

/**
 * GET /api/waiter-assignment/my-pending
 * Get all pending assignment requests for logged-in waiter
 */
router.get(
  '/my-pending',
  authenticateToken,
  authorizeRole(['waiter']),
  getMyPendingAssignments
);

/**
 * POST /api/waiter-assignment/accept/:assignmentId
 * Waiter accepts an order assignment
 */
router.post(
  '/accept/:assignmentId',
  authenticateToken,
  authorizeRole(['waiter']),
  acceptOrderAssignment
);

/**
 * POST /api/waiter-assignment/pass/:assignmentId
 * Waiter passes order to next nearest waiter
 */
router.post(
  '/pass/:assignmentId',
  authenticateToken,
  authorizeRole(['waiter']),
  passOrderAssignment
);

module.exports = router;