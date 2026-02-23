// File: backend/src/modules/waiter/waiter-assignment.controller.js
// 🎯 WAITER ASSIGNMENT SYSTEM - Auto-assign to nearest waiter
// ✅ Accept/Pass mechanism with 10-second timeout

const Order = require('../order/order.model');
const User = require('../user/user.model');
const Table = require('../table/table.model');
const { successResponse, errorResponse } = require('../../shared/utils/response');
const { emitToRoom, emitToUser } = require('../../services/socketService');

// Store pending assignments with timeout
const pendingAssignments = new Map();

/**
 * Calculate distance between two points (simplified)
 * In production, use actual coordinates or floor plan positions
 */
const calculateDistance = (waiter, table) => {
  // For now, use simple heuristic based on table ranges
  // In production: Use actual coordinates
  
  if (!waiter.assignedTables || waiter.assignedTables.length === 0) {
    return Infinity; // Not assigned to any tables
  }

  // Check if waiter is assigned to this table or nearby tables
  if (waiter.assignedTables.includes(table._id)) {
    return 0; // Same table
  }

  // Check nearby tables (simple proximity based on table numbers)
  const tableNumber = table.number;
  const waiterTableNumbers = waiter.assignedTables.map(t => t.number || 0);
  
  const distances = waiterTableNumbers.map(wNum => Math.abs(wNum - tableNumber));
  return Math.min(...distances);
};

/**
 * Find nearest available waiter
 */
const findNearestWaiter = async (tableId) => {
  try {
    // Get table details
    const table = await Table.findById(tableId);
    if (!table) {
      throw new Error('Table not found');
    }

    // Get all active waiters
    const waiters = await User.find({
      role: 'waiter',
      isActive: true,
      isOnline: true, // Assuming you have online status
    }).populate('assignedTables');

    if (waiters.length === 0) {
      throw new Error('No active waiters available');
    }

    // Calculate distances and sort by nearest
    const waitersWithDistance = waiters.map(waiter => ({
      waiter,
      distance: calculateDistance(waiter, table),
      load: waiter.currentOrders?.length || 0, // Current order load
    }));

    // Sort by: 1) Distance (nearest first), 2) Load (less busy first)
    waitersWithDistance.sort((a, b) => {
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      return a.load - b.load;
    });

    // Return sorted list (for cascading assignment)
    return waitersWithDistance.map(w => w.waiter);
  } catch (error) {
    console.error('❌ Find nearest waiter error:', error);
    throw error;
  }
};

/**
 * Assign order to waiter with accept/pass mechanism
 */
const assignOrderToWaiter = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order
    const order = await Order.findById(orderId).populate('tableId');
    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    if (order.assignedWaiter) {
      return errorResponse(res, 'Order already assigned to a waiter', 400);
    }

    // Find nearest waiters (ordered list)
    const nearestWaiters = await findNearestWaiter(order.tableId._id);
    
    if (nearestWaiters.length === 0) {
      return errorResponse(res, 'No available waiters', 404);
    }

    // Start assignment cascade
    await initiateWaiterAssignment(order, nearestWaiters);

    return successResponse(res, {
      message: 'Order assignment initiated',
      assignedTo: nearestWaiters[0]._id,
      waitingForResponse: true,
    });
  } catch (error) {
    console.error('❌ Assign order error:', error);
    return errorResponse(res, error.message || 'Failed to assign order', 500);
  }
};

/**
 * Initiate waiter assignment with timeout
 */
const initiateWaiterAssignment = async (order, waitersList, currentIndex = 0) => {
  if (currentIndex >= waitersList.length) {
    console.error('❌ No waiter accepted order:', order._id);
    
    // Notify kitchen/manager - no waiter available
    emitToRoom('kitchen', 'order:no-waiter', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableId?.number,
      message: 'No waiter accepted this order',
    });
    
    return;
  }

  const waiter = waitersList[currentIndex];
  const assignmentId = `${order._id}-${Date.now()}`;

  console.log(`🔔 Assigning order ${order.orderNumber} to waiter ${waiter.name} (${currentIndex + 1}/${waitersList.length})`);

  // Store pending assignment
  pendingAssignments.set(assignmentId, {
    orderId: order._id,
    waiterId: waiter._id,
    waitersList,
    currentIndex,
    timestamp: Date.now(),
  });

  // Emit notification to waiter
  emitToUser(waiter._id.toString(), 'order:assignment-request', {
    assignmentId,
    order: {
      id: order._id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableId?.number,
      items: order.items?.length || 0,
      total: order.total,
      createdAt: order.createdAt,
      priority: order.priority || 'normal',
    },
    timeout: 10000, // 10 seconds
    position: currentIndex + 1,
    totalWaiters: waitersList.length,
  });

  // Set 10-second timeout for auto-pass
  setTimeout(async () => {
    const assignment = pendingAssignments.get(assignmentId);
    
    if (assignment) {
      console.log(`⏰ Assignment timeout for waiter ${waiter.name} - auto-passing`);
      
      // Remove from pending
      pendingAssignments.delete(assignmentId);
      
      // Notify waiter that they missed it
      emitToUser(waiter._id.toString(), 'order:assignment-timeout', {
        assignmentId,
        orderNumber: order.orderNumber,
      });
      
      // Try next waiter
      await initiateWaiterAssignment(order, waitersList, currentIndex + 1);
    }
  }, 10000);
};

/**
 * Waiter accepts order assignment
 */
const acceptOrderAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const waiterId = req.user.id; // From auth middleware

    const assignment = pendingAssignments.get(assignmentId);
    
    if (!assignment) {
      return errorResponse(res, 'Assignment expired or not found', 404);
    }

    // Verify this waiter is the one assigned
    if (assignment.waiterId.toString() !== waiterId) {
      return errorResponse(res, 'This assignment is not for you', 403);
    }

    // Assign order to waiter
    const order = await Order.findByIdAndUpdate(
      assignment.orderId,
      {
        assignedWaiter: waiterId,
        assignedAt: new Date(),
        status: 'confirmed', // Auto-confirm when waiter accepts
        $push: {
          timeline: {
            status: 'confirmed',
            timestamp: new Date(),
            note: `Accepted by waiter ${req.user.name}`,
          }
        }
      },
      { new: true }
    ).populate('tableId assignedWaiter');

    // Update waiter's current orders
    await User.findByIdAndUpdate(waiterId, {
      $addToSet: { currentOrders: order._id }
    });

    // Remove from pending
    pendingAssignments.delete(assignmentId);

    console.log(`✅ Waiter ${req.user.name} accepted order ${order.orderNumber}`);

    // Notify customer
    emitToUser(order.customerId?.toString(), 'order:waiter-assigned', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      waiter: {
        id: order.assignedWaiter._id,
        name: order.assignedWaiter.name,
        phone: order.assignedWaiter.phone,
      },
      message: `${order.assignedWaiter.name} is taking care of your order`,
    });

    // Notify kitchen
    emitToRoom('kitchen', 'order:waiter-assigned', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      waiterId: waiterId,
      waiterName: req.user.name,
    });

    return successResponse(res, {
      message: 'Order accepted successfully',
      order,
    });
  } catch (error) {
    console.error('❌ Accept assignment error:', error);
    return errorResponse(res, error.message || 'Failed to accept assignment', 500);
  }
};

/**
 * Waiter passes order to next waiter
 */
const passOrderAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { reason } = req.body;
    const waiterId = req.user.id;

    const assignment = pendingAssignments.get(assignmentId);
    
    if (!assignment) {
      return errorResponse(res, 'Assignment expired or not found', 404);
    }

    // Verify this waiter is the one assigned
    if (assignment.waiterId.toString() !== waiterId) {
      return errorResponse(res, 'This assignment is not for you', 403);
    }

    console.log(`👋 Waiter ${req.user.name} passed order - Reason: ${reason || 'Not specified'}`);

    // Remove from pending
    pendingAssignments.delete(assignmentId);

    // Get order
    const order = await Order.findById(assignment.orderId);

    // Try next waiter
    await initiateWaiterAssignment(
      order, 
      assignment.waitersList, 
      assignment.currentIndex + 1
    );

    return successResponse(res, {
      message: 'Order passed to next waiter',
      nextWaiter: assignment.currentIndex + 1 < assignment.waitersList.length,
    });
  } catch (error) {
    console.error('❌ Pass assignment error:', error);
    return errorResponse(res, error.message || 'Failed to pass assignment', 500);
  }
};

/**
 * Get pending assignments for a waiter
 */
const getMyPendingAssignments = async (req, res) => {
  try {
    const waiterId = req.user.id;

    const myAssignments = [];
    
    for (const [assignmentId, assignment] of pendingAssignments.entries()) {
      if (assignment.waiterId.toString() === waiterId) {
        const order = await Order.findById(assignment.orderId)
          .populate('tableId')
          .lean();
        
        if (order) {
          myAssignments.push({
            assignmentId,
            order: {
              id: order._id,
              orderNumber: order.orderNumber,
              tableNumber: order.tableId?.number,
              items: order.items?.length || 0,
              total: order.total,
              createdAt: order.createdAt,
            },
            remainingTime: Math.max(0, 10000 - (Date.now() - assignment.timestamp)),
            position: assignment.currentIndex + 1,
            totalWaiters: assignment.waitersList.length,
          });
        }
      }
    }

    return successResponse(res, {
      assignments: myAssignments,
      count: myAssignments.length,
    });
  } catch (error) {
    console.error('❌ Get pending assignments error:', error);
    return errorResponse(res, error.message || 'Failed to fetch assignments', 500);
  }
};

/**
 * Cleanup expired assignments (run periodically)
 */
const cleanupExpiredAssignments = () => {
  const now = Date.now();
  const expiredThreshold = 15000; // 15 seconds (10s timeout + 5s buffer)

  for (const [assignmentId, assignment] of pendingAssignments.entries()) {
    if (now - assignment.timestamp > expiredThreshold) {
      console.log(`🧹 Cleaning up expired assignment: ${assignmentId}`);
      pendingAssignments.delete(assignmentId);
    }
  }
};

// Run cleanup every minute
setInterval(cleanupExpiredAssignments, 60000);

module.exports = {
  assignOrderToWaiter,
  acceptOrderAssignment,
  passOrderAssignment,
  getMyPendingAssignments,
  findNearestWaiter,
};