// ================================================================
// FILE: backend/src/modules/order/orderSession.service.js
// ORDER SESSION MANAGEMENT - Single Order Per Login Session
// ================================================================

const Order = require('./order.model');
const OrderItem = require('./orderItem.model');

class OrderSessionService {
  /**
   * Get or create active order session for customer
   */
  async getActiveSession(customerId, tableNumber) {
    try {
      // Find any active order for this customer/table
      let activeOrder = await Order.findOne({
        customerId,
        tableNumber,
        status: { $in: ['pending', 'preparing', 'ready'] },
        paymentStatus: 'pending'
      }).populate('items');

      // If no active order, create new session
      if (!activeOrder) {
        activeOrder = await Order.create({
          customerId,
          tableNumber,
          items: [],
          subtotal: 0,
          tax: 0,
          total: 0,
          status: 'pending',
          paymentStatus: 'pending',
          sessionStartTime: new Date()
        });
      }

      return {
        success: true,
        session: {
          orderId: activeOrder._id,
          tableNumber: activeOrder.tableNumber,
          items: activeOrder.items || [],
          totals: {
            subtotal: activeOrder.subtotal || 0,
            tax: activeOrder.tax || 0,
            total: activeOrder.total || 0
          },
          status: activeOrder.status,
          canAddItems: ['pending', 'preparing'].includes(activeOrder.status),
          allItemsServed: this.checkAllItemsServed(activeOrder.items)
        }
      };
    } catch (error) {
      console.error('Get active session error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Add items to existing active order
   */
  async addItemsToSession(orderId, newItems) {
    try {
      const order = await Order.findById(orderId).populate('items');

      if (!order) {
        throw new Error('Order session not found');
      }

      if (!['pending', 'preparing'].includes(order.status)) {
        throw new Error('Cannot add items - order is being served');
      }

      // Create new order items
      const createdItems = await OrderItem.insertMany(
        newItems.map(item => ({
          orderId: order._id,
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
          status: 'pending',
          specialInstructions: item.notes || ''
        }))
      );

      // Add to order
      order.items.push(...createdItems.map(i => i._id));

      // Recalculate totals
      const subtotal = [...order.items, ...createdItems].reduce(
        (sum, item) => sum + item.subtotal,
        0
      );
      const tax = subtotal * 0.13; // 13% tax
      const total = subtotal + tax;

      order.subtotal = subtotal;
      order.tax = tax;
      order.total = total;
      order.lastUpdated = new Date();

      await order.save();

      return {
        success: true,
        order: await Order.findById(order._id).populate('items'),
        addedItems: createdItems
      };
    } catch (error) {
      console.error('Add items error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update item status (preparing/ready/served)
   */
  async updateItemStatus(itemId, status) {
    try {
      const item = await OrderItem.findByIdAndUpdate(
        itemId,
        { 
          status,
          [`${status}Time`]: new Date()
        },
        { new: true }
      );

      if (!item) {
        throw new Error('Order item not found');
      }

      // Check if all items in order are served
      const order = await Order.findById(item.orderId).populate('items');
      const allServed = this.checkAllItemsServed(order.items);

      if (allServed && order.status !== 'ready') {
        order.status = 'ready';
        order.readyTime = new Date();
        await order.save();
      }

      return {
        success: true,
        item,
        allItemsServed: allServed
      };
    } catch (error) {
      console.error('Update item status error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if all items are served
   */
  checkAllItemsServed(items) {
    if (!items || items.length === 0) return false;
    return items.every(item => item.status === 'served');
  }

  /**
   * Get session statistics
   */
  async getSessionStats(orderId) {
    try {
      const order = await Order.findById(orderId).populate('items');

      if (!order) {
        throw new Error('Order not found');
      }

      const stats = {
        totalItems: order.items.length,
        pending: order.items.filter(i => i.status === 'pending').length,
        preparing: order.items.filter(i => i.status === 'preparing').length,
        ready: order.items.filter(i => i.status === 'ready').length,
        served: order.items.filter(i => i.status === 'served').length,
        percentComplete: order.items.length > 0 
          ? (order.items.filter(i => i.status === 'served').length / order.items.length * 100).toFixed(1)
          : 0
      };

      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Get session stats error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Close session (after payment)
   */
  async closeSession(orderId) {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          status: 'completed',
          paymentStatus: 'paid',
          completedTime: new Date()
        },
        { new: true }
      );

      if (!order) {
        throw new Error('Order not found');
      }

      return {
        success: true,
        order
      };
    } catch (error) {
      console.error('Close session error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new OrderSessionService();