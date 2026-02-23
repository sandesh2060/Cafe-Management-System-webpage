// File: backend/src/modules/loyalty/loyalty.routes.js
// Complete loyalty routes

const express = require('express');
const router = express.Router();
const loyaltyController = require('./loyalty.controller');

// Get customer loyalty data
router.get('/customer/:customerId', loyaltyController.getCustomerLoyalty);

// Add a visit
router.post('/add-visit', loyaltyController.addVisit);

// Claim reward
router.post('/claim-reward', loyaltyController.claimReward);

// Get available free items
router.get('/free-items', loyaltyController.getFreeItems);

// Get loyalty configuration
router.get('/config', loyaltyController.getLoyaltyConfig);

// Get loyalty transactions
router.get('/:customerId/transactions', loyaltyController.getTransactions);

// Check reward eligibility
router.get('/:customerId/eligibility', loyaltyController.checkEligibility);

module.exports = router;