// ================================================================
// FILE: backend/src/modules/billing/billing.routes.js
// BILLING API ROUTES
// ================================================================

const express = require('express');
const router = express.Router();
const billingController = require('./billing.controller');
const authMiddleware = require('../../auth/auth.middleware');

// Process payment (main endpoint)
router.post(
  '/process',
  authMiddleware.authenticate,
  billingController.processPayment
);

// eSewa payment
router.post(
  '/esewa',
  authMiddleware.authenticate,
  billingController.processEsewaPayment
);

// Khalti payment
router.post(
  '/khalti',
  authMiddleware.authenticate,
  billingController.processKhaltiPayment
);

// Mobile Banking payment
router.post(
  '/mobile-banking',
  authMiddleware.authenticate,
  billingController.processMobileBankingPayment
);

// Cash payment
router.post(
  '/cash',
  authMiddleware.authenticate,
  billingController.processCashPayment
);

// Get transaction history
router.get(
  '/transactions/:customerId',
  authMiddleware.authenticate,
  billingController.getTransactionHistory
);

// Calculate split
router.post(
  '/calculate-split',
  authMiddleware.authenticate,
  billingController.calculateSplit
);

module.exports = router;