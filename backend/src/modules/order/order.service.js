// File: backend/src/modules/order/order.service.js
// 🎯 ORDER SERVICE - FIXED RESPONSE FORMAT
// ✅ Returns 'data' instead of 'orders' to match frontend expectations

const Order = require('./order.model');
const OrderCounter = require('./orderCounter.model');
const { AppError } = require('../../shared/utils/response');

class OrderService {
  /**
   * Get customer orders with flexible status filtering
   * ✅ FIXED: Returns { data: [] } instead of { orders: [] }
   */
  async getCustomerOrders(customerId, filters = {}) {
    try {
      console.log('📡 Fetching orders for customer:', customerId, filters);
      
      // Build query
      const query = { customerId: customerId };
      
      // ✅ FIX: Handle status as comma-separated string or array
      if (filters.status) {
        if (typeof filters.status === 'string' && filters.status.includes(',')) {
          // Convert comma-separated string to array for $in query
          query.status = { $in: filters.status.split(',').map(s => s.trim()) };
        } else if (Array.isArray(filters.status)) {
          // Already an array
          query.status = { $in: filters.status };
        } else {
          // Single status value
          query.status = filters.status;
        }
      }
      
      if (filters.tableNumber) query.tableNumber = filters.tableNumber;

      // Pagination
      const limit = parseInt(filters.limit) || 20;
      const skip = parseInt(filters.skip) || 0;

      // Execute query
      const orders = await Order.find(query)
        .populate('items.menuItemId', 'name price category image')
        .populate('tableId', 'number')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await Order.countDocuments(query);

      console.log(`✅ Found ${orders.length} orders for customer ${customerId}`);

      // ✅ FIXED: Return 'data' instead of 'orders'
      return {
        success: true,
        data: orders,  // ← Changed from 'orders' to 'data'
        count: orders.length,
        total,
        hasMore: skip + orders.length < total,
        page: Math.floor(skip / limit) + 1,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('❌ Get customer orders error:', error);
      throw new AppError('Failed to fetch customer orders', 500);
    }
  }

  /**
   * Create a new order
   * ✅ Uses atomic order number generation
   */
  async createOrder(orderData) {
    try {
      console.log('📦 Creating order:', { customerId: orderData.customerId, itemCount: orderData.items?.length });
      
      // ✅ Generate order number in service layer
      const orderNumber = await this.generateOrderNumber();
      
      // Create order with generated order number
      const order = new Order({
        ...orderData,
        orderNumber,
      });
      
      await order.save();
      
      // Populate items for response
      await order.populate('items.menuItemId', 'name price category image');
      
      console.log('✅ Order created successfully:', order.orderNumber);
      
      return {
        success: true,
        order: order.toObject(),
      };
    } catch (error) {
      console.error('❌ Create order error:', error);
      
      // Handle duplicate key error
      if (error.code === 11000 && error.keyPattern?.orderNumber) {
        console.error('🔄 Duplicate order number detected, retrying...');
        try {
          const retryOrderNumber = await this.generateOrderNumber(1);
          const retryOrder = new Order({
            ...orderData,
            orderNumber: retryOrderNumber,
          });
          await retryOrder.save();
          await retryOrder.populate('items.menuItemId', 'name price category image');
          
          console.log('✅ Order created on retry:', retryOrder.orderNumber);
          return {
            success: true,
            order: retryOrder.toObject(),
          };
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError);
          throw new AppError('Failed to create order after retry', 500);
        }
      }
      
      throw new AppError('Failed to create order', 500);
    }
  }

  /**
   * Generate unique order number using atomic counter
   */
  async generateOrderNumber(retryCount = 0) {
    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
      
      const sequence = await OrderCounter.getNextSequence(dateStr);
      const sequenceStr = String(sequence).padStart(4, '0');
      const orderNumber = `ORD-${dateStr.substring(2)}-${sequenceStr}`;
      
      console.log(`📝 Generated order number: ${orderNumber}`);
      return orderNumber;
      
    } catch (error) {
      console.error('❌ Generate order number error:', error);
      const timestamp = Date.now();
      const fallbackNumber = `ORD-${timestamp}`;
      console.warn(`⚠️  Using timestamp fallback: ${fallbackNumber}`);
      return fallbackNumber;
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId) {
    try {
      const order = await Order.findById(orderId)
        .populate('items.menuItemId', 'name price category image')
        .lean();

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      return {
        success: true,
        order,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('❌ Get order error:', error);
      throw new AppError('Failed to fetch order', 500);
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status, updatedBy) {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { 
          status,
          updatedBy,
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      )
        .populate('items.menuItemId', 'name price category image')
        .lean();

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      return {
        success: true,
        order,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('❌ Update order status error:', error);
      throw new AppError('Failed to update order status', 500);
    }
  }

  /**
   * Get all orders (admin/kitchen view)
   * ✅ FIXED: Returns { data: [] }
   */
  async getAllOrders(filters = {}) {
    try {
      const query = {};
      
      if (filters.status) {
        if (typeof filters.status === 'string' && filters.status.includes(',')) {
          query.status = { $in: filters.status.split(',').map(s => s.trim()) };
        } else if (Array.isArray(filters.status)) {
          query.status = { $in: filters.status };
        } else {
          query.status = filters.status;
        }
      }

      if (filters.tableNumber) query.tableNumber = filters.tableNumber;
      if (filters.orderType) query.orderType = filters.orderType;

      const limit = parseInt(filters.limit) || 50;
      const skip = parseInt(filters.skip) || 0;

      const orders = await Order.find(query)
        .populate('items.menuItemId', 'name price category image')
        .populate('customerId', 'name phone tableNumber')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await Order.countDocuments(query);

      // ✅ FIXED: Return 'data' instead of 'orders'
      return {
        success: true,
        data: orders,
        count: orders.length,
        total,
        hasMore: skip + orders.length < total,
        page: Math.floor(skip / limit) + 1,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('❌ Get all orders error:', error);
      throw new AppError('Failed to fetch orders', 500);
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId, reason, cancelledBy) {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      if (!['pending', 'confirmed'].includes(order.status)) {
        throw new AppError('Order cannot be cancelled at this stage', 400);
      }

      order.status = 'cancelled';
      order.cancelReason = reason;
      order.updatedBy = cancelledBy;
      order.updatedAt = new Date();

      await order.save();
      await order.populate('items.menuItemId', 'name price category image');

      console.log(`❌ Order ${order.orderNumber} cancelled: ${reason}`);

      return {
        success: true,
        order: order.toObject(),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('❌ Cancel order error:', error);
      throw new AppError('Failed to cancel order', 500);
    }
  }

  /**
   * Get table orders
   * ✅ FIXED: Returns { data: [] }
   */
  async getTableOrders(tableId, filters = {}) {
    try {
      const query = { tableId };
      
      if (filters.status) {
        if (typeof filters.status === 'string' && filters.status.includes(',')) {
          query.status = { $in: filters.status.split(',').map(s => s.trim()) };
        } else if (Array.isArray(filters.status)) {
          query.status = { $in: filters.status };
        } else {
          query.status = filters.status;
        }
      }

      const limit = parseInt(filters.limit) || 20;
      const skip = parseInt(filters.skip) || 0;

      const orders = await Order.find(query)
        .populate('items.menuItemId', 'name price category image')
        .populate('customerId', 'name phone')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await Order.countDocuments(query);

      // ✅ FIXED: Return 'data' instead of 'orders'
      return {
        success: true,
        data: orders,
        count: orders.length,
        total,
        hasMore: skip + orders.length < total,
        page: Math.floor(skip / limit) + 1,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('❌ Get table orders error:', error);
      throw new AppError('Failed to fetch table orders', 500);
    }
  }

  /**
   * Track order
   */
  async trackOrder(orderId) {
    try {
      const order = await Order.findById(orderId)
        .populate('items.menuItemId', 'name price category image preparationTime')
        .lean();

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      const statusTimes = {
        'pending': 15,
        'confirmed': 12,
        'preparing': 8,
        'ready': 2,
        'served': 0,
      };

      const orderAge = Math.floor(
        (Date.now() - new Date(order.createdAt).getTime()) / 60000
      );

      const estimatedTotal = order.estimatedPrepTime || statusTimes[order.status] || 15;
      const estimatedRemaining = Math.max(0, estimatedTotal - orderAge);

      const progressMap = {
        'pending': 15,
        'confirmed': 35,
        'preparing': 65,
        'ready': 90,
        'served': 100,
        'completed': 100,
      };

      return {
        success: true,
        order,
        tracking: {
          status: order.status,
          progress: progressMap[order.status] || 0,
          estimatedRemaining,
          orderAge,
          updatedAt: order.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('❌ Track order error:', error);
      throw new AppError('Failed to track order', 500);
    }
  }

  /**
   * Get kitchen queue
   * ✅ FIXED: Returns { data: [] }
   */
  async getKitchenQueue() {
    try {
      const orders = await Order.find({
        status: { $in: ['pending', 'confirmed', 'preparing'] }
      })
        .populate('items.menuItemId', 'name price category image preparationTime')
        .populate('customerId', 'name')
        .sort({ createdAt: 1 })
        .lean();

      // ✅ FIXED: Return 'data' instead of 'orders'
      return {
        success: true,
        data: orders,
        total: orders.length,
      };
    } catch (error) {
      console.error('❌ Get kitchen queue error:', error);
      throw new AppError('Failed to fetch kitchen queue', 500);
    }
  }

  /**
   * Get active orders
   * ✅ FIXED: Returns { data: [] }
   */
  async getActiveOrders() {
    try {
      const orders = await Order.find({
        status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
      })
        .populate('items.menuItemId', 'name price category image')
        .populate('customerId', 'name phone tableNumber')
        .sort({ createdAt: -1 })
        .lean();

      // ✅ FIXED: Return 'data' instead of 'orders'
      return {
        success: true,
        data: orders,
        total: orders.length,
      };
    } catch (error) {
      console.error('❌ Get active orders error:', error);
      throw new AppError('Failed to fetch active orders', 500);
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics(filters = {}) {
    try {
      const dateFilter = {};
      if (filters.startDate) {
        dateFilter.createdAt = { $gte: new Date(filters.startDate) };
      }
      if (filters.endDate) {
        dateFilter.createdAt = { ...dateFilter.createdAt, $lte: new Date(filters.endDate) };
      }

      const totalOrders = await Order.countDocuments(dateFilter);
      const completedOrders = await Order.countDocuments({ ...dateFilter, status: 'completed' });
      const cancelledOrders = await Order.countDocuments({ ...dateFilter, status: 'cancelled' });
      const activeOrders = await Order.countDocuments({ 
        ...dateFilter, 
        status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
      });

      const revenueData = await Order.aggregate([
        { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            avgOrderValue: { $avg: '$total' },
          }
        }
      ]);

      return {
        success: true,
        stats: {
          totalOrders,
          completedOrders,
          cancelledOrders,
          activeOrders,
          revenue: revenueData[0] || { totalRevenue: 0, avgOrderValue: 0 },
        },
      };
    } catch (error) {
      console.error('❌ Get order statistics error:', error);
      throw new AppError('Failed to fetch order statistics', 500);
    }
  }
}

module.exports = new OrderService();