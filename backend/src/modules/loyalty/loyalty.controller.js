// File: backend/src/modules/loyalty/loyalty.controller.js
// Production-ready loyalty controller

const loyaltyService = require('./loyalty.service');
const { successResponse, errorResponse } = require('../../shared/utils/response');

class LoyaltyController {
  // Get customer loyalty data
  async getCustomerLoyalty(req, res) {
    try {
      const { customerId } = req.params;

      if (!customerId) {
        return errorResponse(res, 'Customer ID is required', 400);
      }

      const loyalty = await loyaltyService.getCustomerLoyalty(customerId);

      return successResponse(res, { loyalty }, 'Loyalty data retrieved');
    } catch (error) {
      console.error('Get loyalty error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  // Add a visit (reward visit)
  async addVisit(req, res) {
    try {
      const { customerId } = req.body;

      if (!customerId) {
        return errorResponse(res, 'Customer ID is required', 400);
      }

      const result = await loyaltyService.addVisit(customerId);

      return successResponse(res, result, 'Visit added successfully');
    } catch (error) {
      console.error('Add visit error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  // Claim reward
  async claimReward(req, res) {
    try {
      const { customerId, itemId } = req.body;

      if (!customerId || !itemId) {
        return errorResponse(res, 'Customer ID and Item ID are required', 400);
      }

      const reward = await loyaltyService.claimReward(customerId, itemId);

      return successResponse(res, { reward }, 'Reward claimed successfully');
    } catch (error) {
      console.error('Claim reward error:', error);
      return errorResponse(res, error.message, 400);
    }
  }

  // Get available free items
  async getFreeItems(req, res) {
    try {
      const items = await loyaltyService.getAvailableFreeItems();

      return successResponse(res, { items }, 'Free items retrieved');
    } catch (error) {
      console.error('Get free items error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  // Get loyalty configuration
  async getLoyaltyConfig(req, res) {
    try {
      const config = await loyaltyService.getLoyaltyConfig();

      return successResponse(res, { config }, 'Loyalty config retrieved');
    } catch (error) {
      console.error('Get loyalty config error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  // Get loyalty transactions
  async getTransactions(req, res) {
    try {
      const { customerId } = req.params;
      const { limit, skip } = req.query;

      const result = await loyaltyService.getTransactions(customerId, { limit, skip });

      return successResponse(res, result, 'Transactions retrieved');
    } catch (error) {
      console.error('Get transactions error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  // Check reward eligibility
  async checkEligibility(req, res) {
    try {
      const { customerId } = req.params;

      const eligibility = await loyaltyService.checkEligibility(customerId);

      return successResponse(res, eligibility, 'Eligibility checked');
    } catch (error) {
      console.error('Check eligibility error:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new LoyaltyController();