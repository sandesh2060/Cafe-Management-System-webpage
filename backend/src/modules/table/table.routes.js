// File: backend/src/modules/table/table.routes.js

const express = require('express');
const router = express.Router();
const tableController = require('./table.controller');

let authenticate;
try {
  authenticate = require('../../auth/auth.middleware').authenticate;
} catch (err) {
  console.log('⚠️  Auth middleware not found - using dummy middleware');
  authenticate = (req, res, next) => next();
}

// ============================================
// PUBLIC ROUTES
// ============================================
router.post('/match-location', tableController.matchLocation);
router.post('/detect', tableController.detectTable); // ⭐ NEW
router.get('/nearby', tableController.getTablesNearby); // ⭐ NEW
router.post('/verify-qr', tableController.verifyQRCode);
router.get('/number/:tableNumber', tableController.getByNumber);

// ============================================
// PROTECTED ROUTES
// ============================================
router.get('/', authenticate, tableController.getAll);
router.post('/', authenticate, tableController.create);
router.put('/:tableId', authenticate, tableController.update);
router.delete('/:tableId', authenticate, tableController.delete);
router.get('/:tableId/status', authenticate, tableController.getStatus);
router.patch('/:tableId/status', authenticate, tableController.updateStatus);
router.get('/:tableId/qrcode', authenticate, tableController.getQRCode);
router.get('/:tableId/session', authenticate, tableController.getActiveSession);

router.get('/:tableId', tableController.getById);

module.exports = router;