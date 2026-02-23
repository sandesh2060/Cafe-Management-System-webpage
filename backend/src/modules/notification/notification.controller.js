// File: backend/src/modules/notification/notification.controller.js

// Load Notification model with error handling
let Notification;
try {
  Notification = require('./notification.model');
  console.log('✅ Notification model loaded in controller');
} catch (err) {
  console.error('❌ Failed to load Notification model:', err.message);
  // Create a mock model for testing
  Notification = {
    find: () => ({ sort: () => ({ skip: () => ({ limit: () => ({ lean: () => [] }) }) }) }),
    countDocuments: () => 0,
    create: () => ({}),
    findOneAndUpdate: () => null,
    updateMany: () => ({ modifiedCount: 0 }),
    findOneAndDelete: () => null,
    deleteMany: () => ({ deletedCount: 0 })
  };
}

/**
 * Get user's notifications (paginated)
 * GET /api/notifications?page=1&limit=20
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get notifications
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Notification.countDocuments({ recipient: userId });

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

/**
 * Create notification
 * POST /api/notifications
 */
exports.createNotification = async (req, res) => {
  try {
    const {
      recipient,
      title,
      message,
      type,
      priority,
      actionUrl,
      data,
      sound,
      vibration
    } = req.body;

    // Create notification
    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      priority: priority || 'normal',
      actionUrl,
      data,
      sound: sound || { enabled: true, file: 'notification.mp3' },
      vibration: vibration || { enabled: true, pattern: [200, 100, 200] }
    });

    // Emit via Socket.IO (if socket service is available)
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${recipient}`).emit('notification:new', {
        notification: notification.toObject ? notification.toObject() : notification
      });
      console.log(`📤 Notification sent to user-${recipient}`);
    }

    res.status(201).json({
      success: true,
      message: 'Notification created',
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

/**
 * Broadcast notification to multiple users
 * POST /api/notifications/broadcast
 */
exports.broadcastNotification = async (req, res) => {
  try {
    const {
      recipients,
      title,
      message,
      type,
      priority,
      actionUrl,
      data,
      sound,
      vibration
    } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipients array is required'
      });
    }

    // Create notifications for all recipients
    const notificationPromises = recipients.map(recipientId =>
      Notification.create({
        recipient: recipientId,
        title,
        message,
        type,
        priority: priority || 'normal',
        actionUrl,
        data,
        sound: sound || { enabled: true, file: 'notification.mp3' },
        vibration: vibration || { enabled: true, pattern: [200, 100, 200] }
      })
    );

    const notifications = await Promise.all(notificationPromises);

    // Emit via Socket.IO
    const io = req.app.get('io');
    if (io) {
      notifications.forEach((notification, index) => {
        const recipientId = recipients[index];
        io.to(`user-${recipientId}`).emit('notification:new', {
          notification: notification.toObject ? notification.toObject() : notification
        });
      });
      console.log(`📤 Broadcast sent to ${recipients.length} users`);
    }

    res.status(201).json({
      success: true,
      message: `Notification broadcast to ${recipients.length} users`,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error broadcasting notification',
      error: error.message
    });
  }
};

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

/**
 * Mark all notifications as read
 * PATCH /api/notifications/mark-all-read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all as read',
      error: error.message
    });
  }
};

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

/**
 * Clear all notifications
 * DELETE /api/notifications/clear-all
 */
exports.clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const result = await Notification.deleteMany({ recipient: userId });

    res.json({
      success: true,
      message: 'All notifications cleared',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing notifications',
      error: error.message
    });
  }
};

// Log that controller exports are ready
console.log('✅ Notification controller exports ready');