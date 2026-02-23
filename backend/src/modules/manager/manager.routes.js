// File: backend/src/modules/manager/manager.routes.js
// ✅ UPDATED: Added dashboard-stats, inventory, and reports routes

const express = require('express');
const router = express.Router();
const managerController = require('./manager.controller');
const { authenticate } = require('../../auth/auth.middleware');
const { authorize } = require('../../shared/middleware/roleCheck');

// Apply authentication middleware to all routes
router.use(authenticate);

// Apply authorization - only manager and admin
router.use(authorize('manager', 'admin'));

// ============================================
// DASHBOARD & ANALYTICS ROUTES
// ============================================

// Dashboard statistics
router.get('/dashboard-stats', managerController.getDashboardStats);

// Sales analytics
router.get('/analytics/sales', managerController.getSalesAnalytics);

// ============================================
// INVENTORY ROUTES
// ============================================

// Get inventory
router.get('/inventory', managerController.getInventory);

// ============================================
// REPORTS ROUTES
// ============================================

// Revenue reports
router.get('/reports/revenue', managerController.getRevenueReport);
router.get('/reports/revenue/download', managerController.downloadRevenueReport);

// ============================================
// STAFF MANAGEMENT ROUTES
// ============================================

// Staff CRUD
router.post('/staff', managerController.createStaffMember);
router.get('/staff', managerController.getAllStaff);
router.get('/staff/stats', managerController.getStaffStats);
router.get('/staff/:id', managerController.getStaffMember);
router.put('/staff/:id', managerController.updateStaffMember);
router.delete('/staff/:id', managerController.deleteStaffMember);

// Staff operations
router.post('/staff/:id/reset-password', managerController.resetStaffPassword);

// ============================================
// TABLE MANAGEMENT ROUTES
// ============================================

// Table CRUD
router.post('/tables', managerController.createTable);
router.get('/tables', managerController.getAllTables);
router.get('/tables/stats', managerController.getTableStats);
router.get('/tables/:id', managerController.getTable);
router.put('/tables/:id', managerController.updateTable);
router.delete('/tables/:id', managerController.deleteTable);

// Table operations
router.post('/tables/:id/regenerate-qr', managerController.regenerateTableQR);

module.exports = router;