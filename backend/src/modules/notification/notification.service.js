// File: backend/src/modules/notification/notification.service.js
// 🔔 NOTIFICATION SERVICE - Helper functions for creating notifications

const Notification = require('./notification.model');

/**
 * Send notification to single user
 */
exports.sendToUser = async (io, userId, notificationData) => {
  try {
    const notification = await Notification.create({
      recipient: userId,
      ...notificationData
    });

    // Emit via Socket.IO if available
    if (io) {
      io.to(`user-${userId}`).emit('notification:new', {
        notification: notification.toObject()
      });
      console.log(`📤 Notification sent to user-${userId}`);
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Broadcast notification to multiple users
 */
exports.broadcastToUsers = async (io, userIds, notificationData) => {
  try {
    const notifications = await Notification.broadcastToUsers(io, userIds, notificationData);
    console.log(`📤 Broadcast sent to ${userIds.length} users`);
    return notifications;
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    throw error;
  }
};

/**
 * Send order notification
 */
exports.sendOrderNotification = async (io, userId, orderData, type) => {
  const notificationMap = {
    order_new: {
      title: '🆕 New Order',
      message: `Order #${orderData.orderNumber} has been placed`,
      sound: { enabled: true, file: 'new-order.mp3' },
      priority: 'high'
    },
    order_ready: {
      title: '✅ Order Ready',
      message: `Order #${orderData.orderNumber} is ready to serve`,
      sound: { enabled: true, file: 'order-ready.mp3' },
      priority: 'high'
    },
    order_served: {
      title: '🍽️ Order Served',
      message: `Order #${orderData.orderNumber} has been served`,
      sound: { enabled: true, file: 'success.mp3' },
      priority: 'normal'
    },
    order_cancelled: {
      title: '❌ Order Cancelled',
      message: `Order #${orderData.orderNumber} has been cancelled`,
      sound: { enabled: true, file: 'alert.mp3' },
      priority: 'high'
    }
  };

  const config = notificationMap[type];
  if (!config) {
    throw new Error(`Unknown order notification type: ${type}`);
  }

  return await this.sendToUser(io, userId, {
    ...config,
    type,
    actionUrl: `/orders/${orderData._id}`,
    data: {
      orderId: orderData._id,
      orderNumber: orderData.orderNumber,
      tableNumber: orderData.tableNumber
    },
    vibration: { enabled: true, pattern: [200, 100, 200] }
  });
};

/**
 * Send table request notification
 */
exports.sendTableRequestNotification = async (io, userId, requestData) => {
  return await this.sendToUser(io, userId, {
    title: '🙋 Table Request',
    message: `Table ${requestData.tableNumber} needs assistance: ${requestData.requestType}`,
    type: 'table_request',
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
};

/**
 * Send announcement to all staff
 */
exports.sendAnnouncementToStaff = async (io, staffIds, announcementData) => {
  return await this.broadcastToUsers(io, staffIds, {
    title: announcementData.title,
    message: announcementData.message,
    type: 'announcement',
    priority: announcementData.priority || 'normal',
    sound: { enabled: true, file: 'notification.mp3' },
    vibration: { enabled: true, pattern: [200, 100, 200] }
  });
};

/**
 * Send report generated notification
 */
exports.sendReportNotification = async (io, userId, reportData) => {
  return await this.sendToUser(io, userId, {
    title: '📊 Report Generated',
    message: `${reportData.reportType} report is ready`,
    type: 'report_generated',
    priority: 'normal',
    actionUrl: reportData.downloadUrl || '/reports',
    data: {
      reportId: reportData._id,
      reportType: reportData.reportType
    },
    sound: { enabled: true, file: 'success.mp3' },
    vibration: { enabled: false }
  });
};

/**
 * Send alert notification
 */
exports.sendAlert = async (io, userId, alertData) => {
  return await this.sendToUser(io, userId, {
    title: alertData.title || '⚠️ Alert',
    message: alertData.message,
    type: 'alert',
    priority: 'urgent',
    data: alertData.data || {},
    sound: { enabled: true, file: 'alert.mp3' },
    vibration: { enabled: true, pattern: [300, 200, 300, 200, 300] }
  });
};