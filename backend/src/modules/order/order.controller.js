// ================================================================
// FILE: backend/src/modules/order/order.controller.js
// 🎯 ORDER CONTROLLER - Complete implementation
// ✅ Handles all query parameters properly
// ✅ Smart order consolidation - adds items to active orders
// ================================================================

const Order = require('./order.model');
const Customer = require('../customer/customer.model');
const Table = require('../table/table.model');

// ============================================
// GET CUSTOMER ORDERS
// ============================================

/**
 * GET /api/orders/customer/:customerId
 * Query params: status, limit, skip
 */
exports.getCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status, limit = 50, skip = 0 } = req.query;

    console.log('📥 Get customer orders request:', {
      customerId,
      status,
      limit,
      skip
    });

    // Build query
    const query = { customerId };

    // Handle status filter (can be comma-separated string)
    if (status) {
      const statusArray = status.split(',').map(s => s.trim());
      query.status = { $in: statusArray };
    }

    // Fetch orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('tableId', 'number zone')
      .populate('items.menuItemId', 'name image category price')
      .lean();

    console.log(`✅ Found ${orders.length} orders for customer ${customerId}`);

    res.json({
      success: true,
      orders,
      total: orders.length,
      customerId,
      filters: { status, limit, skip }
    });

  } catch (error) {
    console.error('❌ Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer orders',
      error: error.message
    });
  }
};

// ============================================
// GET TABLE ORDERS
// ============================================

/**
 * GET /api/orders/table/:tableId
 * Get all orders for a specific table
 */
exports.getTableOrders = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { activeOnly = 'true' } = req.query;

    console.log('📥 Get table orders request:', tableId);

    const orders = await Order.findByTable(
      tableId,
      activeOnly === 'true'
    );

    console.log(`✅ Found ${orders.length} orders for table ${tableId}`);

    res.json({
      success: true,
      orders,
      total: orders.length,
      tableId
    });

  } catch (error) {
    console.error('❌ Error fetching table orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching table orders',
      error: error.message
    });
  }
};

// ============================================
// CREATE ORDER (OR ADD TO ACTIVE ORDER)
// ============================================

/**
 * POST /api/orders
 * Create a new order OR add items to active order
 * 
 * Logic:
 * 1. Check if customer has an active order at the same table
 * 2. If yes -> Add items to existing order
 * 3. If no -> Create new order
 */
exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    console.log('📥 Create/Update order request:', {
      customerId: orderData.customerId,
      tableId: orderData.tableId,
      items: orderData.items?.length
    });

    // Validate customer exists
    const customer = await Customer.findById(orderData.customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Validate table exists
    const table = await Table.findById(orderData.tableId);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    // ============================================
    // 🔍 CHECK FOR ACTIVE ORDER
    // ============================================
    const activeOrder = await Order.findOne({
      customerId: orderData.customerId,
      tableId: orderData.tableId,
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready', 'served'] }
    }).sort({ createdAt: -1 });

    // ============================================
    // ➕ ADD ITEMS TO ACTIVE ORDER
    // ============================================
    if (activeOrder) {
      console.log('🔄 Active order found, adding items to existing order:', activeOrder.orderNumber);

      // Calculate item subtotals for new items
      const newItems = orderData.items.map(item => ({
        ...item,
        subtotal: item.price * item.quantity,
        status: 'pending' // New items start as pending
      }));

      // Add new items to existing order
      activeOrder.items.push(...newItems);

      // Recalculate totals
      activeOrder.calculateTotals();

      // Add timeline entry
      activeOrder.timeline.push({
        status: activeOrder.status,
        timestamp: new Date(),
        notes: `Added ${newItems.length} new item(s) to order`
      });

      // If order was 'ready' or 'served', move it back to 'preparing'
      // since we have new items to prepare
      if (['ready', 'served'].includes(activeOrder.status)) {
        activeOrder.status = 'preparing';
        activeOrder.timeline.push({
          status: 'preparing',
          timestamp: new Date(),
          notes: 'Order status changed to preparing due to new items'
        });
      }

      // Save updated order
      await activeOrder.save();

      // Populate for response
      await activeOrder.populate([
        { path: 'customerId', select: 'name phone' },
        { path: 'tableId', select: 'number zone' },
        { path: 'items.menuItemId', select: 'name image category price' }
      ]);

      console.log('✅ Items added to order:', activeOrder.orderNumber);

      // Emit socket event for real-time updates
      const io = req.app.get('io');
      if (io) {
        io.emit('order:items_added', {
          orderId: activeOrder._id,
          orderNumber: activeOrder.orderNumber,
          tableId: activeOrder.tableId,
          status: activeOrder.status,
          newItemsCount: newItems.length
        });
      }

      return res.status(200).json({
        success: true,
        message: `Added ${newItems.length} item(s) to existing order`,
        order: activeOrder,
        isNewOrder: false
      });
    }

    // ============================================
    // 🆕 CREATE NEW ORDER
    // ============================================
    console.log('🆕 No active order found, creating new order');

    // Generate order number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const OrderCounter = require('./orderCounter.model');
    const sequence = await OrderCounter.getNextSequence(dateStr);
    const orderNumber = `ORD-${dateStr}-${String(sequence).padStart(4, '0')}`;

    // Calculate item subtotals
    const items = orderData.items.map(item => ({
      ...item,
      subtotal: item.price * item.quantity
    }));

    // Create order
    const order = new Order({
      ...orderData,
      orderNumber,
      items,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Calculate totals
    order.calculateTotals();

    // Save order
    await order.save();

    // Populate for response
    await order.populate([
      { path: 'customerId', select: 'name phone' },
      { path: 'tableId', select: 'number zone' },
      { path: 'items.menuItemId', select: 'name image category price' }
    ]);

    console.log('✅ Order created:', order.orderNumber);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('order:created', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        tableId: order.tableId,
        status: order.status
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
      isNewOrder: true
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// ============================================
// GET ALL ORDERS
// ============================================

/**
 * GET /api/orders
 * Get all orders with filters
 */
exports.getAllOrders = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      startDate,
      endDate,
      limit = 50,
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log('📥 Get all orders request');

    // Build query
    const query = {};

    if (status) {
      const statusArray = status.split(',').map(s => s.trim());
      query.status = { $in: statusArray };
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Fetch orders
    const orders = await Order.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('customerId', 'name phone')
      .populate('tableId', 'number zone')
      .populate('items.menuItemId', 'name image category')
      .lean();

    const total = await Order.countDocuments(query);

    console.log(`✅ Found ${orders.length} orders (total: ${total})`);

    res.json({
      success: true,
      orders,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// ============================================
// GET ORDER BY ID
// ============================================

/**
 * GET /api/orders/:orderId
 * Get single order details
 */
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log('📥 Get order by ID:', orderId);

    const order = await Order.findById(orderId)
      .populate('customerId', 'name phone email')
      .populate('tableId', 'number zone capacity')
      .populate('items.menuItemId', 'name image category price description')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('✅ Order found:', order.orderNumber);

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('❌ Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// ============================================
// UPDATE ORDER STATUS
// ============================================

/**
 * PATCH /api/orders/:orderId/status
 * Update order status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes, updatedBy } = req.body;

    console.log('📥 Update order status:', { orderId, status });

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Use the model's updateStatus method for validation
    await order.updateStatus(status, updatedBy, notes);

    // Populate for response
    await order.populate([
      { path: 'customerId', select: 'name phone' },
      { path: 'tableId', select: 'number zone' }
    ]);

    console.log('✅ Order status updated:', order.orderNumber);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('order:status_updated', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        tableId: order.tableId
      });
    }

    res.json({
      success: true,
      message: 'Order status updated',
      order
    });

  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating order status'
    });
  }
};

// ============================================
// CANCEL ORDER
// ============================================

/**
 * PATCH /api/orders/:orderId/cancel
 * Cancel an order
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, cancelledBy } = req.body;

    console.log('📥 Cancel order:', { orderId, reason });

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Use the model's cancel method
    await order.cancel(reason, cancelledBy);

    console.log('✅ Order cancelled:', order.orderNumber);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('order:cancelled', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        tableId: order.tableId
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled',
      order
    });

  } catch (error) {
    console.error('❌ Error cancelling order:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error cancelling order'
    });
  }
};

// ============================================
// GET ACTIVE ORDERS
// ============================================

/**
 * GET /api/orders/active
 * Get all active orders
 */
exports.getActiveOrders = async (req, res) => {
  try {
    console.log('📥 Get active orders request');

    const orders = await Order.findActive()
      .populate('customerId', 'name phone')
      .populate('tableId', 'number zone')
      .populate('items.menuItemId', 'name image')
      .lean();

    console.log(`✅ Found ${orders.length} active orders`);

    res.json({
      success: true,
      orders,
      total: orders.length
    });

  } catch (error) {
    console.error('❌ Error fetching active orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active orders',
      error: error.message
    });
  }
};

// ============================================
// GET KITCHEN QUEUE
// ============================================

/**
 * GET /api/orders/kitchen/queue
 * Get orders in kitchen queue
 */
exports.getKitchenQueue = async (req, res) => {
  try {
    console.log('📥 Get kitchen queue request');

    const orders = await Order.find({
      status: { $in: ['confirmed', 'preparing'] }
    })
      .sort({ createdAt: 1 }) // Oldest first
      .populate('tableId', 'number zone')
      .populate('items.menuItemId', 'name category preparationTime')
      .lean();

    console.log(`✅ Found ${orders.length} orders in kitchen queue`);

    res.json({
      success: true,
      orders,
      total: orders.length
    });

  } catch (error) {
    console.error('❌ Error fetching kitchen queue:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching kitchen queue',
      error: error.message
    });
  }
};

// ============================================
// GET ORDER STATISTICS
// ============================================

/**
 * GET /api/orders/stats
 * Get order statistics
 */
exports.getOrderStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    console.log('📥 Get order statistics request');

    const stats = await Order.getStatistics({
      startDate,
      endDate
    });

    console.log('✅ Statistics calculated');

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// ============================================
// TRACK ORDER
// ============================================

/**
 * GET /api/orders/:orderId/track
 * Track order status with timeline
 */
exports.trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    console.log('📥 Track order:', orderId);

    const order = await Order.findById(orderId)
      .select('orderNumber status timeline estimatedPrepTime createdAt')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('✅ Order tracking info retrieved');

    res.json({
      success: true,
      tracking: {
        orderNumber: order.orderNumber,
        status: order.status,
        timeline: order.timeline,
        estimatedPrepTime: order.estimatedPrepTime,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error tracking order:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking order',
      error: error.message
    });
  }
};

// ============================================
// ADD ITEMS TO EXISTING ORDER
// ============================================

/**
 * POST /api/orders/:orderId/items
 * Add items to an existing order
 * Body: { items: [{ menuItemId, name, quantity, price, customizations }] }
 */
exports.addItemsToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items } = req.body;

    console.log('📥 Add items to order:', { orderId, itemCount: items?.length });

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required and must not be empty'
      });
    }

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be modified
    if (!order.canBeModified() && !['preparing', 'ready'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot add items to order with status: ${order.status}`,
        allowedStatuses: ['pending', 'confirmed', 'preparing', 'ready']
      });
    }

    // Calculate subtotals for new items
    const newItems = items.map(item => ({
      ...item,
      subtotal: item.price * item.quantity,
      status: 'pending' // New items start as pending
    }));

    // Add new items to order
    order.items.push(...newItems);

    // Recalculate totals
    order.calculateTotals();

    // Add timeline entry
    order.timeline.push({
      status: order.status,
      timestamp: new Date(),
      notes: `Added ${newItems.length} new item(s) to order`
    });

    // If order was 'ready' or 'served', move it back to 'preparing'
    if (['ready', 'served'].includes(order.status)) {
      const oldStatus = order.status;
      order.status = 'preparing';
      order.timeline.push({
        status: 'preparing',
        timestamp: new Date(),
        notes: `Status changed from ${oldStatus} to preparing due to new items`
      });
    }

    // Save updated order
    await order.save();

    // Populate for response
    await order.populate([
      { path: 'customerId', select: 'name phone' },
      { path: 'tableId', select: 'number zone' },
      { path: 'items.menuItemId', select: 'name image category price' }
    ]);

    console.log('✅ Items added to order:', order.orderNumber);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('order:items_added', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        tableId: order.tableId,
        status: order.status,
        newItemsCount: newItems.length,
        totalItems: order.items.length
      });

      // Notify kitchen if there are new items to prepare
      io.emit('kitchen:new_items', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        newItems: newItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          customizations: item.customizations
        }))
      });
    }

    res.json({
      success: true,
      message: `Added ${newItems.length} item(s) to order`,
      order,
      addedItems: newItems.length,
      totalItems: order.items.length
    });

  } catch (error) {
    console.error('❌ Error adding items to order:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding items to order',
      error: error.message
    });
  }
};

// ============================================
// REMOVE ITEM FROM ORDER
// ============================================

/**
 * DELETE /api/orders/:orderId/items/:itemId
 * Remove an item from an order (only if order is pending/confirmed)
 */
exports.removeItemFromOrder = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;

    console.log('📥 Remove item from order:', { orderId, itemId });

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow removing items from pending/confirmed orders
    if (!order.canBeModified()) {
      return res.status(400).json({
        success: false,
        message: `Cannot remove items from order with status: ${order.status}`,
        allowedStatuses: ['pending', 'confirmed']
      });
    }

    // Find item index
    const itemIndex = order.items.findIndex(
      item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in order'
      });
    }

    // Get item details before removing
    const removedItem = order.items[itemIndex];

    // Remove item
    order.items.splice(itemIndex, 1);

    // Check if order still has items
    if (order.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove last item from order. Cancel the order instead.'
      });
    }

    // Recalculate totals
    order.calculateTotals();

    // Add timeline entry
    order.timeline.push({
      status: order.status,
      timestamp: new Date(),
      notes: `Removed item: ${removedItem.name} (qty: ${removedItem.quantity})`
    });

    // Save order
    await order.save();

    console.log('✅ Item removed from order');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('order:item_removed', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        removedItem: {
          name: removedItem.name,
          quantity: removedItem.quantity
        }
      });
    }

    res.json({
      success: true,
      message: 'Item removed from order',
      order,
      removedItem: {
        name: removedItem.name,
        quantity: removedItem.quantity
      }
    });

  } catch (error) {
    console.error('❌ Error removing item from order:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing item from order',
      error: error.message
    });
  }
};