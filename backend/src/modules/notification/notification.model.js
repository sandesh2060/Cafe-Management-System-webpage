// File: backend/src/modules/notification/notification.model.js

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: [
        'order_new',
        'order_ready',
        'order_served',
        'order_cancelled',
        'order_payment',
        'table_request',
        'table_assigned',
        'report_generated',
        'alert',
        'message',
        'announcement',
        'reminder',
        'update',
        'success',
        'warning',
        'error'
      ],
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
      index: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    },
    actionUrl: {
      type: String,
      trim: true,
      default: null
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    sound: {
      enabled: {
        type: Boolean,
        default: true
      },
      file: {
        type: String,
        default: 'notification.mp3'
      }
    },
    vibration: {
      enabled: {
        type: Boolean,
        default: true
      },
      pattern: {
        type: [Number],
        default: [200, 100, 200]
      }
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for formatted time
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
});

// Static method to create and emit notification
notificationSchema.statics.createAndEmit = async function(io, notificationData) {
  const notification = await this.create(notificationData);
  
  if (io) {
    io.to(`user-${notificationData.recipient}`).emit('notification:new', {
      notification: notification.toObject()
    });
  }
  
  return notification;
};

// Static method to broadcast to multiple users
notificationSchema.statics.broadcastToUsers = async function(io, recipients, notificationData) {
  const notifications = await Promise.all(
    recipients.map(recipientId =>
      this.create({
        ...notificationData,
        recipient: recipientId
      })
    )
  );
  
  if (io) {
    notifications.forEach((notification, index) => {
      io.to(`user-${recipients[index]}`).emit('notification:new', {
        notification: notification.toObject()
      });
    });
  }
  
  return notifications;
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;