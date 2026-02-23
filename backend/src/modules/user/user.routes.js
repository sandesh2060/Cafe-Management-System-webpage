const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  updateUserStatus,
  getAllWaiters,
  getAllManagers,
  assignTablesToWaiter,
  updateWaiterShift,
  getWaiterStats
} = require('./user.controller');
const { protect, authorize } = require('../../auth/auth.middleware');

// Protect all routes (require authentication)
router.use(protect);

// Get all waiters (specific route - must come before /:id)
router.get('/waiters', authorize('admin', 'manager'), getAllWaiters);

// Get all managers (admin only)
router.get('/managers', authorize('admin'), getAllManagers);

// Get all users
router.get('/', authorize('admin', 'manager'), getAllUsers);

// Get user by ID
router.get('/:id', authorize('admin', 'manager'), getUserById);

// Create new user (including waiters and managers)
router.post('/', authorize('admin', 'manager'), createUser);

// Update user
router.put('/:id', authorize('admin', 'manager'), updateUser);

// Delete user (admin only for managers/admins)
router.delete('/:id', authorize('admin'), deleteUser);

// Update user role (admin only)
router.patch('/:id/role', authorize('admin'), updateUserRole);

// Update user status
router.patch('/:id/status', authorize('admin', 'manager'), updateUserStatus);

// Waiter-specific routes
router.patch('/:id/assign-tables', authorize('admin', 'manager'), assignTablesToWaiter);
router.patch('/:id/shift', authorize('admin', 'manager'), updateWaiterShift);
router.get('/:id/stats', authorize('admin', 'manager', 'waiter'), getWaiterStats);

module.exports = router;