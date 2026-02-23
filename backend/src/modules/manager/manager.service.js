const Order = require('../order/order.model');
const User = require('../user/user.model');
const Transaction = require('../billing/transaction.model');
const { emitToRoom } = require('../../shared/websockets/managerSocket');

class ManagerService {
  async notifyLowStock(itemId, itemName, currentStock) {
    const notification = {
      type: 'low_stock',
      itemId,
      itemName,
      currentStock,
      timestamp: new Date()
    };

    emitToRoom('managers', 'inventory:low-stock', notification);
  }

  async notifyHighPriorityOrder(orderId) {
    const notification = {
      type: 'high_priority_order',
      orderId,
      timestamp: new Date()
    };

    emitToRoom('managers', 'order:high-priority', notification);
  }

  async generateDailyReport() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [sales, orders, staffActivity] = await Promise.all([
      Transaction.aggregate([
        { $match: { createdAt: { $gte: today }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: today } }),
      User.aggregate([
        { $match: { role: { $in: ['waiter', 'cook'] }, isActive: true } },
        { $project: { name: 1, role: 1, isOnline: 1 } }
      ])
    ]);

    return {
      date: today,
      sales: sales[0] || { total: 0, count: 0 },
      orders,
      staffActivity
    };
  }

  async getPerformanceMetrics(startDate, endDate) {
    const metrics = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          avgPreparationTime: { $avg: '$preparationTime' },
          avgDeliveryTime: { $avg: '$deliveryTime' },
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    return metrics[0] || {};
  }
}

module.exports = new ManagerService();
