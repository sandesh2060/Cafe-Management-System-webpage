// File: backend/src/modules/zone/zone.routes.js
// 🌍 ZONE MANAGEMENT ROUTES

const express = require('express');
const router = express.Router();
const zoneController = require('./zone.controller');

// ============================================
// SPECIAL ROUTES (before :id routes)
// ============================================

/**
 * @route   POST /api/zones/validate-location
 * @desc    Validate if customer location is in valid zone
 * @access  Public
 * @body    { latitude, longitude }
 */
router.post('/validate-location', zoneController.validateLocation);

/**
 * @route   POST /api/zones/check-customer
 * @desc    Check if customer is still in zone
 * @access  Public
 * @body    { customerId, zoneId, location: { latitude, longitude } }
 */
router.post('/check-customer', zoneController.checkCustomerInZone);

/**
 * @route   POST /api/zones/nearest
 * @desc    Find nearest zone to location
 * @access  Public
 * @body    { latitude, longitude }
 */
router.post('/nearest', zoneController.findNearestZone);

/**
 * @route   GET /api/zones/type/:type
 * @desc    Get zones by type
 * @access  Public
 * @param   type - Zone type (cafe, dining_area, terrace, parking, custom)
 */
router.get('/type/:type', zoneController.getZonesByType);

// ============================================
// CRUD ROUTES
// ============================================

/**
 * @route   GET /api/zones
 * @desc    Get all zones
 * @access  Public (Waiter/Admin)
 * @query   status, type
 */
router.get('/', zoneController.getAllZones);

/**
 * @route   POST /api/zones
 * @desc    Create new zone
 * @access  Admin/Waiter
 * @body    { name, description, type, location, settings }
 */
router.post('/', zoneController.createZone);

/**
 * @route   GET /api/zones/:id
 * @desc    Get zone by ID
 * @access  Public
 */
router.get('/:id', zoneController.getZoneById);

/**
 * @route   PUT /api/zones/:id
 * @desc    Update zone
 * @access  Admin/Waiter
 * @body    { name?, description?, location?, settings?, status? }
 */
router.put('/:id', zoneController.updateZone);

/**
 * @route   DELETE /api/zones/:id
 * @desc    Delete zone
 * @access  Admin
 */
router.delete('/:id', zoneController.deleteZone);

/**
 * @route   GET /api/zones/:id/statistics
 * @desc    Get zone statistics
 * @access  Admin/Waiter
 */
router.get('/:id/statistics', zoneController.getZoneStatistics);

/**
 * @route   POST /api/zones/:id/tables
 * @desc    Assign tables to zone
 * @access  Admin/Waiter
 * @body    { tableIds: [] }
 */
router.post('/:id/tables', zoneController.assignTables);

/**
 * @route   PATCH /api/zones/:id/settings
 * @desc    Update zone settings
 * @access  Admin/Waiter
 * @body    { allowLogin?, autoLogout?, logoutGracePeriod?, requireLocation?, wifiSSID?, maxConcurrentSessions? }
 */
router.patch('/:id/settings', zoneController.updateSettings);

module.exports = router;