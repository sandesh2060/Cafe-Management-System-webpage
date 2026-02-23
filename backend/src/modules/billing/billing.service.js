// ================================================================
// FILE: backend/src/modules/billing/billing.service.js
// PAYMENT PROCESSING SERVICE - Multiple Payment Methods
// ================================================================

const Order = require('../order/order.model');
const Transaction = require('./transaction.model');
const orderSessionService = require('../order/orderSession.service');

class BillingService {
  /**
   * Process payment with split support
   */
  async processPayment(paymentData) {
    try {
      const {
        orderId,
        paymentMethod,
        splitMode, // 'single' or 'group'
        splits, // Array of { name, amount, method }
        transactionDetails
      } = paymentData;

      // Validate order
      const order = await Order.findById(orderId).populate('items');
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.paymentStatus === 'paid') {
        throw new Error('Order already paid');
      }

      // Validate all items are served
      const allServed = orderSessionService.checkAllItemsServed(order.items);
      if (!allServed) {
        throw new Error('Cannot process payment - items not served yet');
      }

      // Process based on split mode
      let transactions = [];

      if (splitMode === 'single') {
        // Single payment
        const transaction = await this.createTransaction({
          orderId: order._id,
          customerId: order.customerId,
          amount: order.total,
          paymentMethod,
          paidBy: splits[0]?.name || 'Customer',
          transactionDetails,
          splitDetails: null
        });
        transactions.push(transaction);
      } else {
        // Group split payment
        const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0);
        
        if (Math.abs(totalSplit - order.total) > 0.01) {
          throw new Error('Split amounts do not match order total');
        }

        // Create transaction for each split
        for (const split of splits) {
          const transaction = await this.createTransaction({
            orderId: order._id,
            customerId: order.customerId,
            amount: split.amount,
            paymentMethod: split.method || paymentMethod,
            paidBy: split.name,
            transactionDetails: {
              ...transactionDetails,
              splitPercentage: (split.amount / order.total * 100).toFixed(2)
            },
            splitDetails: {
              mode: 'group',
              totalSplits: splits.length,
              splitAmount: split.amount,
              splitPercentage: (split.amount / order.total * 100).toFixed(2)
            }
          });
          transactions.push(transaction);
        }
      }

      // Update order payment status
      order.paymentStatus = 'paid';
      order.paymentMethod = splitMode === 'single' ? paymentMethod : 'split';
      order.paidAmount = order.total;
      order.paidAt = new Date();
      
      if (splitMode === 'group') {
        order.splitDetails = {
          mode: 'group',
          splits: splits.map(s => ({
            name: s.name,
            amount: s.amount,
            method: s.method || paymentMethod,
            percentage: (s.amount / order.total * 100).toFixed(2)
          }))
        };
      }

      await order.save();

      // Close order session
      await orderSessionService.closeSession(order._id);

      return {
        success: true,
        order,
        transactions,
        message: `Payment processed successfully via ${splitMode === 'single' ? paymentMethod : 'group split'}`
      };
    } catch (error) {
      console.error('Process payment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create transaction record
   */
  async createTransaction(data) {
    try {
      const transaction = await Transaction.create({
        orderId: data.orderId,
        customerId: data.customerId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paidBy: data.paidBy,
        status: 'completed',
        transactionDate: new Date(),
        transactionDetails: data.transactionDetails || {},
        splitDetails: data.splitDetails || null
      });

      return transaction;
    } catch (error) {
      console.error('Create transaction error:', error);
      throw error;
    }
  }

  /**
   * Process eSewa payment
   */
  async processEsewa(paymentData) {
    try {
      // eSewa integration logic
      // In production, integrate with eSewa API
      const { amount, orderId, productId } = paymentData;

      // Simulate eSewa processing
      const esewaResponse = {
        success: true,
        transactionId: `ESEWA-${Date.now()}`,
        status: 'SUCCESS',
        amount,
        timestamp: new Date()
      };

      return {
        success: true,
        method: 'esewa',
        transactionDetails: esewaResponse
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process Khalti payment
   */
  async processKhalti(paymentData) {
    try {
      // Khalti integration logic
      // In production, integrate with Khalti API
      const { amount, orderId, productId } = paymentData;

      // Simulate Khalti processing
      const khaltiResponse = {
        success: true,
        transactionId: `KHALTI-${Date.now()}`,
        idx: `khalti_${Date.now()}`,
        amount,
        timestamp: new Date()
      };

      return {
        success: true,
        method: 'khalti',
        transactionDetails: khaltiResponse
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process Mobile Banking
   */
  async processMobileBanking(paymentData) {
    try {
      const { amount, orderId, bankName, accountNumber } = paymentData;

      // Simulate mobile banking processing
      const bankingResponse = {
        success: true,
        transactionId: `BANK-${Date.now()}`,
        bankName,
        amount,
        timestamp: new Date()
      };

      return {
        success: true,
        method: 'mobile_banking',
        transactionDetails: bankingResponse
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process Cash payment
   */
  async processCash(paymentData) {
    try {
      const { amount, orderId, receivedBy } = paymentData;

      const cashResponse = {
        success: true,
        transactionId: `CASH-${Date.now()}`,
        amount,
        receivedBy: receivedBy || 'Cashier',
        timestamp: new Date()
      };

      return {
        success: true,
        method: 'cash',
        transactionDetails: cashResponse
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(customerId) {
    try {
      const transactions = await Transaction.find({ customerId })
        .populate('orderId')
        .sort({ transactionDate: -1 })
        .limit(50);

      return {
        success: true,
        transactions
      };
    } catch (error) {
      console.error('Get transaction history error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate split amounts (equal or custom)
   */
  calculateSplits(total, splits, mode = 'equal') {
    if (mode === 'equal') {
      const perPerson = total / splits.length;
      return splits.map(split => ({
        ...split,
        amount: parseFloat(perPerson.toFixed(2))
      }));
    } else {
      // Custom splits - validate they sum to total
      const totalSplit = splits.reduce((sum, s) => sum + (s.amount || 0), 0);
      if (Math.abs(totalSplit - total) > 0.01) {
        throw new Error('Split amounts must equal total');
      }
      return splits;
    }
  }
}

module.exports = new BillingService();