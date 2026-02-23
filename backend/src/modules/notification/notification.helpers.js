// File: backend/src/modules/notification/notification.helpers.js

const Notification = require('./notification.model');

/**
 * Emit notification via Socket.IO (if available)
 */
function emitNotification(io, userId, notification) {
  if (io) {
    io.to(`user-${userId}`).emit('notification:new', {
      notification: notification.toObject ? notification.toObject() : notification
    });
  }
}

/**
 * Notify all users of a specific role
 */
async function notifyRole(io, role, notificationData) {
  try {
    const User = require('../user/user.model');
    const users = await User.find({ role, status: 'active' });

    const notifications = await Promise.all(
      users.map(user => 
        Notification.create({
          recipient: user._id,
          ...notificationData
        })
      )
    );

    // Send via Socket.IO
    users.forEach((user, index) => {
      emitNotification(io, user._id.toString(), notifications[index]);
    });

    console.log(`✅ Notified ${users.length} ${role}(s)`);
    return notifications;

  } catch (error) {
    console.error(`❌ Error notifying ${role}(s):`, error);
    throw error;
  }
}

/**
 * Notify managers/admins
 */
async function notifyManagers(io, notificationData) {
  try {
    const User = require('../user/user.model');
    const managers = await User.find({ 
      role: { $in: ['manager', 'admin'] }, 
      status: 'active' 
    });

    const notifications = await Promise.all(
      managers.map(manager => 
        Notification.create({
          recipient: manager._id,
          ...notificationData
        })
      )
    );

    managers.forEach((manager, index) => {
      emitNotification(io, manager._id.toString(), notifications[index]);
    });

    console.log(`✅ Notified ${managers.length} manager(s)`);
    return notifications;

  } catch (error) {
    console.error('❌ Error notifying managers:', error);
    throw error;
  }
}

/**
 * Notify specific waiter
 */
async function notifyWaiter(io, waiterId, notificationData) {
  try {
    const notification = await Notification.create({
      recipient: waiterId,
      ...notificationData
    });

    emitNotification(io, waiterId.toString(), notification);

    console.log(`✅ Notified waiter: ${waiterId}`);
    return notification;

  } catch (error) {
    console.error('❌ Error notifying waiter:', error);
    throw error;
  }
}

/**
 * Send system announcement to all active users
 */
async function sendAnnouncement(io, title, message, priority = 'normal') {
  try {
    const User = require('../user/user.model');
    const users = await User.find({ status: 'active' });

    const notifications = await Promise.all(
      users.map(user => 
        Notification.create({
          recipient: user._id,
          type: 'announcement',
          priority,
          title,
          message,
          sound: { enabled: true, file: 'notification.mp3' },
          vibration: { enabled: priority === 'urgent', pattern: [200, 100, 200] }
        })
      )
    );

    // Emit to each user individually (more reliable than broadcast)
    users.forEach((user, index) => {
      emitNotification(io, user._id.toString(), notifications[index]);
    });

    console.log(`✅ Announcement sent to ${users.length} user(s)`);
    return notifications;

  } catch (error) {
    console.error('❌ Error sending announcement:', error);
    throw error;
  }
}

/**
 * Send order notification (wrapper for common use case)
 */
async function notifyOrderCreated(io, waiterId, orderData) {
  return await notifyWaiter(io, waiterId, {
    type: 'order_new',
    title: '🆕 New Order',
    message: `Order #${orderData.orderNumber || orderData._id} has been placed`,
    priority: 'high',
    actionUrl: `/orders/${orderData._id}`,
    data: {
      orderId: orderData._id,
      orderNumber: orderData.orderNumber,
      tableNumber: orderData.tableNumber
    },
    sound: { enabled: true, file: 'new-order.mp3' },
    vibration: { enabled: true, pattern: [200, 100, 200] }
  });
}

/**
 * Send table request notification
 */
async function notifyTableRequest(io, waiterId, requestData) {
  return await notifyWaiter(io, waiterId, {
    type: 'table_request',
    title: '🙋 Table Request',
    message: `Table ${requestData.tableNumber} needs assistance: ${requestData.requestType}`,
    priority: 'high',
    actionUrl: `/requests/${requestData._id}`,
    data: {
      requestId: requestData._id,
      tableNumber: requestData.tableNumber,
      requestType: requestData.requestType
    },
    sound: { enabled: true, file: 'request.mp3' },
    vibration: { enabled: true, pattern: [200, 100, 200, 100, 200] }
  });
}

module.exports = {
  notifyRole,
  notifyManagers,
  notifyWaiter,
  sendAnnouncement,
  notifyOrderCreated,
  notifyTableRequest,
  emitNotification
};