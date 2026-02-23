// ================================================================
// FILE: backend/src/modules/billing/billing.controller.js
// BILLING API CONTROLLER
// ================================================================

const billingService = require('./billing.service');
const { sendSuccess, sendError } = require('../../shared/utils/response');

class BillingController {
  /**
   * POST /api/billing/process
   * Process payment (single or split)
   */
  async processPayment(req, res) {
    try {
      const {
        orderId,
        paymentMethod,
        splitMode,
        splits,
        transactionDetails
      } = req.body;

      // Validation
      if (!orderId) {
        return sendError(res, 'Order ID is required', 400);
      }

      if (!paymentMethod) {
        return sendError(res, 'Payment method is required', 400);
      }

      if (!['single', 'group'].includes(splitMode)) {
        return sendError(res, 'Invalid split mode', 400);
      }

      if (!splits || splits.length === 0) {
        return sendError(res, 'Payment splits are required', 400);
      }

      // Process payment
      const result = await billingService.processPayment({
        orderId,
        paymentMethod,
        splitMode,
        splits,
        transactionDetails: transactionDetails || {}
      });

      if (!result.success) {
        return sendError(res, result.error, 400);
      }

      return sendSuccess(res, {
        order: result.order,
        transactions: result.transactions,
        message: result.message
      });
    } catch (error) {
      console.error('Process payment error:', error);
      return sendError(res, error.message, 500);
    }
  }

  /**
   * POST /api/billing/esewa
   * Process eSewa payment
   */
  async processEsewaPayment(req, res) {
    try {
      const { orderId, amount, productId } = req.body;

      const result = await billingService.processEsewa({
        orderId,
        amount,
        productId
      });

      if (!result.success) {
        return sendError(res, result.error, 400);
      }

      return sendSuccess(res, result);
    } catch (error) {
      console.error('eSewa payment error:', error);
      return sendError(res, error.message, 500);
    }
  }

  /**
   * POST /api/billing/khalti
   * Process Khalti payment
   */
  async processKhaltiPayment(req, res) {
    try {
      const { orderId, amount, productId } = req.body;

      const result = await billingService.processKhalti({
        orderId,
        amount,
        productId
      });

      if (!result.success) {
        return sendError(res, result.error, 400);
      }

      return sendSuccess(res, result);
    } catch (error) {
      console.error('Khalti payment error:', error);
      return sendError(res, error.message, 500);
    }
  }

  /**
   * POST /api/billing/mobile-banking
   * Process Mobile Banking payment
   */
  async processMobileBankingPayment(req, res) {
    try {
      const { orderId, amount, bankName, accountNumber } = req.body;

      const result = await billingService.processMobileBanking({
        orderId,
        amount,
        bankName,
        accountNumber
      });

      if (!result.success) {
        return sendError(res, result.error, 400);
      }

      return sendSuccess(res, result);
    } catch (error) {
      console.error('Mobile banking payment error:', error);
      return sendError(res, error.message, 500);
    }
  }

  /**
   * POST /api/billing/cash
   * Process Cash payment
   */
  async processCashPayment(req, res) {
    try {
      const { orderId, amount, receivedBy } = req.body;

      const result = await billingService.processCash({
        orderId,
        amount,
        receivedBy
      });

      if (!result.success) {
        return sendError(res, result.error, 400);
      }

      return sendSuccess(res, result);
    } catch (error) {
      console.error('Cash payment error:', error);
      return sendError(res, error.message, 500);
    }
  }

  /**
   * GET /api/billing/transactions/:customerId
   * Get transaction history
   */
  async getTransactionHistory(req, res) {
    try {
      const { customerId } = req.params;

      const result = await billingService.getTransactionHistory(customerId);

      if (!result.success) {
        return sendError(res, result.error, 400);
      }

      return sendSuccess(res, result.transactions);
    } catch (error) {
      console.error('Get transaction history error:', error);
      return sendError(res, error.message, 500);
    }
  }

  /**
   * POST /api/billing/calculate-split
   * Calculate split amounts
   */
  async calculateSplit(req, res) {
    try {
      const { total, splits, mode } = req.body;

      if (!total || !splits) {
        return sendError(res, 'Total and splits are required', 400);
      }

      const calculatedSplits = billingService.calculateSplits(
        total,
        splits,
        mode || 'equal'
      );

      return sendSuccess(res, { splits: calculatedSplits });
    } catch (error) {
      console.error('Calculate split error:', error);
      return sendError(res, error.message, 500);
    }
  }
}

module.exports = new BillingController();