// File: backend/src/modules/report/report.controller.js

const Report = require('./report.model');
const User = require('../user/user.model');
const Order = require('../order/order.model');
const Transaction = require('../billing/transaction.model');
const { successResponse, errorResponse, AppError } = require('../../shared/utils/response');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// ============================================
// WAITER REPORTS
// ============================================

/**
 * @desc    Generate waiter performance report
 * @route   POST /api/reports/waiter/performance
 * @access  Private (Admin/Manager/Self)
 */
exports.generateWaiterReport = async (req, res, next) => {
  try {
    const { waiterId, startDate, endDate } = req.body;
    const requesterId = req.user._id;
    const requesterRole = req.user.role;
    
    // Validation
    if (!waiterId || !startDate || !endDate) {
      throw new AppError('Please provide waiterId, startDate, and endDate', 400);
    }
    
    // Permission check
    const isSelf = waiterId === requesterId.toString();
    const canViewOthers = ['admin', 'manager'].includes(requesterRole);
    
    if (!isSelf && !canViewOthers) {
      throw new AppError('You can only view your own reports', 403);
    }
    
    // Get waiter
    const waiter = await User.findById(waiterId);
    if (!waiter || waiter.role !== 'waiter') {
      throw new AppError('Waiter not found', 404);
    }
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    // Fetch orders handled by waiter
    const orders = await Order.find({
      assignedWaiter: waiterId,
      createdAt: { $gte: start, $lte: end }
    }).populate('tableId', 'number').populate('customerId', 'name');
    
    // Calculate metrics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'served' || o.status === 'completed').length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders * 100) : 0;
    
    // Calculate average service time
    const serviceTimes = orders
      .filter(o => o.servedAt && o.createdAt)
      .map(o => (new Date(o.servedAt) - new Date(o.createdAt)) / 60000); // minutes
    
    const avgServiceTime = serviceTimes.length > 0
      ? serviceTimes.reduce((a, b) => a + b, 0) / serviceTimes.length
      : 0;
    
    // Tables served
    const uniqueTables = new Set(orders.map(o => o.tableId?._id?.toString()).filter(Boolean));
    const tablesServed = uniqueTables.size;
    
    // Customer satisfaction (if you have ratings)
    const ordersWithRating = orders.filter(o => o.rating);
    const avgRating = ordersWithRating.length > 0
      ? ordersWithRating.reduce((sum, o) => sum + o.rating, 0) / ordersWithRating.length
      : 0;
    
    // Daily breakdown
    const dailyStats = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { orders: 0, revenue: 0, completed: 0 };
      }
      dailyStats[date].orders += 1;
      dailyStats[date].revenue += order.total || 0;
      if (order.status === 'served' || order.status === 'completed') {
        dailyStats[date].completed += 1;
      }
    });
    
    const dailyBreakdown = Object.keys(dailyStats)
      .sort()
      .map(date => ({
        date,
        ...dailyStats[date],
        completionRate: dailyStats[date].orders > 0
          ? (dailyStats[date].completed / dailyStats[date].orders * 100).toFixed(2)
          : 0
      }));
    
    // Create report data
    const reportData = {
      waiter: {
        id: waiter._id,
        name: waiter.name,
        email: waiter.email,
        employeeId: waiter.employeeId
      },
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        days: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      },
      metrics: {
        totalOrders,
        completedOrders,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        avgOrderValue: Number(avgOrderValue.toFixed(2)),
        completionRate: Number(completionRate.toFixed(2)),
        avgServiceTime: Number(avgServiceTime.toFixed(2)),
        tablesServed,
        avgRating: Number(avgRating.toFixed(2)),
        ordersPerDay: Number((totalOrders / ((end - start) / (1000 * 60 * 60 * 24))).toFixed(2))
      },
      dailyBreakdown,
      topTables: getTopTables(orders),
      peakHours: getPeakHours(orders),
      recentOrders: orders.slice(0, 10).map(o => ({
        orderId: o._id,
        orderNumber: o.orderNumber,
        table: o.tableId?.number,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt
      }))
    };
    
    // Save report
    const report = await Report.create({
      type: 'waiter_performance',
      scope: 'individual',
      subjectUser: waiterId,
      generatedBy: requesterId,
      period: {
        startDate: start,
        endDate: end
      },
      data: reportData,
      summary: {
        totalOrders,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        avgOrderValue: Number(avgOrderValue.toFixed(2)),
        completionRate: Number(completionRate.toFixed(2)),
        avgWaitTime: Number(avgServiceTime.toFixed(2))
      }
    });
    
    successResponse(res, { report, data: reportData }, 'Waiter report generated successfully', 201);
    
  } catch (error) {
    next(error);
  }
};

// Helper functions
function getTopTables(orders) {
  const tableCounts = {};
  orders.forEach(order => {
    const tableNum = order.tableId?.number;
    if (tableNum) {
      tableCounts[tableNum] = (tableCounts[tableNum] || 0) + 1;
    }
  });
  
  return Object.entries(tableCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([table, count]) => ({ table, orders: count }));
}

function getPeakHours(orders) {
  const hourCounts = {};
  orders.forEach(order => {
    const hour = new Date(order.createdAt).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  return Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour, count]) => ({
      hour: `${hour.padStart(2, '0')}:00`,
      orders: count
    }));
}

// ============================================
// COOK REPORTS
// ============================================

/**
 * @desc    Generate cook performance report
 * @route   POST /api/reports/cook/performance
 * @access  Private (Admin/Manager/Self)
 */
exports.generateCookReport = async (req, res, next) => {
  try {
    const { cookId, startDate, endDate } = req.body;
    const requesterId = req.user._id;
    const requesterRole = req.user.role;
    
    if (!cookId || !startDate || !endDate) {
      throw new AppError('Please provide cookId, startDate, and endDate', 400);
    }
    
    const isSelf = cookId === requesterId.toString();
    const canViewOthers = ['admin', 'manager'].includes(requesterRole);
    
    if (!isSelf && !canViewOthers) {
      throw new AppError('You can only view your own reports', 403);
    }
    
    const cook = await User.findById(cookId);
    if (!cook || cook.role !== 'cook') {
      throw new AppError('Cook not found', 404);
    }
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    // Fetch orders prepared by cook
    const orders = await Order.find({
      preparedBy: cookId,
      createdAt: { $gte: start, $lte: end }
    });
    
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'ready' || o.status === 'served' || o.status === 'completed').length;
    
    // Calculate prep times
    const prepTimes = orders
      .filter(o => o.preparedAt && o.confirmedAt)
      .map(o => (new Date(o.preparedAt) - new Date(o.confirmedAt)) / 60000);
    
    const avgPrepTime = prepTimes.length > 0
      ? prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length
      : 0;
    
    // Daily breakdown
    const dailyStats = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { orders: 0, completed: 0 };
      }
      dailyStats[date].orders += 1;
      if (['ready', 'served', 'completed'].includes(order.status)) {
        dailyStats[date].completed += 1;
      }
    });
    
    const dailyBreakdown = Object.keys(dailyStats)
      .sort()
      .map(date => ({
        date,
        ...dailyStats[date],
        efficiency: dailyStats[date].orders > 0
          ? (dailyStats[date].completed / dailyStats[date].orders * 100).toFixed(2)
          : 0
      }));
    
    const reportData = {
      cook: {
        id: cook._id,
        name: cook.name,
        email: cook.email,
        employeeId: cook.employeeId
      },
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      metrics: {
        totalOrders,
        completedOrders,
        avgPrepTime: Number(avgPrepTime.toFixed(2)),
        efficiency: Number((completedOrders / totalOrders * 100).toFixed(2)),
        ordersPerDay: Number((totalOrders / ((end - start) / (1000 * 60 * 60 * 24))).toFixed(2))
      },
      dailyBreakdown
    };
    
    const report = await Report.create({
      type: 'cook_performance',
      scope: 'individual',
      subjectUser: cookId,
      generatedBy: requesterId,
      period: { startDate: start, endDate: end },
      data: reportData,
      summary: {
        totalOrders,
        avgWaitTime: Number(avgPrepTime.toFixed(2)),
        completionRate: Number((completedOrders / totalOrders * 100).toFixed(2))
      }
    });
    
    successResponse(res, { report, data: reportData }, 'Cook report generated successfully', 201);
    
  } catch (error) {
    next(error);
  }
};

// ============================================
// CASHIER REPORTS
// ============================================

/**
 * @desc    Generate cashier performance report
 * @route   POST /api/reports/cashier/performance
 * @access  Private (Admin/Manager/Self)
 */
exports.generateCashierReport = async (req, res, next) => {
  try {
    const { cashierId, startDate, endDate } = req.body;
    const requesterId = req.user._id;
    const requesterRole = req.user.role;
    
    if (!cashierId || !startDate || !endDate) {
      throw new AppError('Please provide cashierId, startDate, and endDate', 400);
    }
    
    const isSelf = cashierId === requesterId.toString();
    const canViewOthers = ['admin', 'manager'].includes(requesterRole);
    
    if (!isSelf && !canViewOthers) {
      throw new AppError('You can only view your own reports', 403);
    }
    
    const cashier = await User.findById(cashierId);
    if (!cashier || cashier.role !== 'cashier') {
      throw new AppError('Cashier not found', 404);
    }
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    // Fetch transactions processed by cashier
    const transactions = await Transaction.find({
      processedBy: cashierId,
      createdAt: { $gte: start, $lte: end }
    });
    
    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    // Payment method breakdown
    const paymentMethods = {};
    transactions.forEach(t => {
      const method = t.paymentMethod || 'unknown';
      if (!paymentMethods[method]) {
        paymentMethods[method] = { count: 0, amount: 0 };
      }
      paymentMethods[method].count += 1;
      paymentMethods[method].amount += t.amount || 0;
    });
    
    const paymentBreakdown = Object.entries(paymentMethods).map(([method, data]) => ({
      method,
      count: data.count,
      amount: Number(data.amount.toFixed(2)),
      percentage: Number((data.count / totalTransactions * 100).toFixed(2))
    }));
    
    // Daily breakdown
    const dailyStats = {};
    transactions.forEach(t => {
      const date = t.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { transactions: 0, revenue: 0 };
      }
      dailyStats[date].transactions += 1;
      dailyStats[date].revenue += t.amount || 0;
    });
    
    const dailyBreakdown = Object.keys(dailyStats)
      .sort()
      .map(date => ({
        date,
        transactions: dailyStats[date].transactions,
        revenue: Number(dailyStats[date].revenue.toFixed(2))
      }));
    
    const reportData = {
      cashier: {
        id: cashier._id,
        name: cashier.name,
        email: cashier.email,
        employeeId: cashier.employeeId
      },
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      metrics: {
        totalTransactions,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        avgTransactionValue: Number(avgTransactionValue.toFixed(2)),
        transactionsPerDay: Number((totalTransactions / ((end - start) / (1000 * 60 * 60 * 24))).toFixed(2))
      },
      paymentBreakdown,
      dailyBreakdown
    };
    
    const report = await Report.create({
      type: 'cashier_performance',
      scope: 'individual',
      subjectUser: cashierId,
      generatedBy: requesterId,
      period: { startDate: start, endDate: end },
      data: reportData,
      summary: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        avgOrderValue: Number(avgTransactionValue.toFixed(2))
      }
    });
    
    successResponse(res, { report, data: reportData }, 'Cashier report generated successfully', 201);
    
  } catch (error) {
    next(error);
  }
};

// ============================================
// COMPARISON REPORTS
// ============================================

/**
 * @desc    Generate staff comparison report
 * @route   POST /api/reports/comparison/staff
 * @access  Private (Admin/Manager only)
 */
exports.generateStaffComparisonReport = async (req, res, next) => {
  try {
    const { role, userIds, startDate, endDate } = req.body;
    const requesterId = req.user._id;
    
    // Only admin/manager can compare staff
    if (!['admin', 'manager'].includes(req.user.role)) {
      throw new AppError('Access denied', 403);
    }
    
    if (!role || !userIds || !Array.isArray(userIds) || !startDate || !endDate) {
      throw new AppError('Please provide role, userIds array, startDate, and endDate', 400);
    }
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    // Get users
    const users = await User.find({
      _id: { $in: userIds },
      role
    });
    
    if (users.length === 0) {
      throw new AppError('No valid users found', 404);
    }
    
    const comparisonData = [];
    
    // Generate report for each user
    for (const user of users) {
      let userData = {};
      
      if (role === 'waiter') {
        const orders = await Order.find({
          assignedWaiter: user._id,
          createdAt: { $gte: start, $lte: end }
        });
        
        const totalOrders = orders.length;
        const completedOrders = orders.filter(o => o.status === 'served' || o.status === 'completed').length;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        
        userData = {
          userId: user._id,
          name: user.name,
          totalOrders,
          completedOrders,
          totalRevenue: Number(totalRevenue.toFixed(2)),
          avgOrderValue: totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0,
          completionRate: totalOrders > 0 ? Number((completedOrders / totalOrders * 100).toFixed(2)) : 0
        };
      }
      else if (role === 'cook') {
        const orders = await Order.find({
          preparedBy: user._id,
          createdAt: { $gte: start, $lte: end }
        });
        
        const totalOrders = orders.length;
        const completedOrders = orders.filter(o => ['ready', 'served', 'completed'].includes(o.status)).length;
        
        userData = {
          userId: user._id,
          name: user.name,
          totalOrders,
          completedOrders,
          efficiency: totalOrders > 0 ? Number((completedOrders / totalOrders * 100).toFixed(2)) : 0
        };
      }
      else if (role === 'cashier') {
        const transactions = await Transaction.find({
          processedBy: user._id,
          createdAt: { $gte: start, $lte: end }
        });
        
        const totalTransactions = transactions.length;
        const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        
        userData = {
          userId: user._id,
          name: user.name,
          totalTransactions,
          totalRevenue: Number(totalRevenue.toFixed(2)),
          avgTransactionValue: totalTransactions > 0 ? Number((totalRevenue / totalTransactions).toFixed(2)) : 0
        };
      }
      
      comparisonData.push(userData);
    }
    
    // Rank by primary metric
    comparisonData.sort((a, b) => {
      if (role === 'waiter') return b.totalRevenue - a.totalRevenue;
      if (role === 'cook') return b.efficiency - a.efficiency;
      if (role === 'cashier') return b.totalRevenue - a.totalRevenue;
      return 0;
    });
    
    const reportData = {
      role,
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      comparison: comparisonData,
      topPerformer: comparisonData[0],
      averages: calculateAverages(comparisonData, role)
    };
    
    const report = await Report.create({
      type: 'staff_comparison',
      scope: 'team',
      generatedBy: requesterId,
      period: { startDate: start, endDate: end },
      data: reportData
    });
    
    successResponse(res, { report, data: reportData }, 'Staff comparison report generated successfully', 201);
    
  } catch (error) {
    next(error);
  }
};

function calculateAverages(data, role) {
  if (data.length === 0) return {};
  
  const averages = {};
  const keys = Object.keys(data[0]).filter(k => k !== 'userId' && k !== 'name');
  
  keys.forEach(key => {
    const sum = data.reduce((acc, item) => acc + (item[key] || 0), 0);
    averages[key] = Number((sum / data.length).toFixed(2));
  });
  
  return averages;
}

// ============================================
// GET REPORTS
// ============================================

/**
 * @desc    Get all reports (with filters)
 * @route   GET /api/reports
 * @access  Private
 */
exports.getAllReports = async (req, res, next) => {
  try {
    const { type, scope, subjectUser, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const filter = {};
    
    // Non-admin/manager can only see their own reports or reports about them
    if (!['admin', 'manager'].includes(userRole)) {
      filter.$or = [
        { generatedBy: userId },
        { subjectUser: userId }
      ];
    }
    
    if (type) filter.type = type;
    if (scope) filter.scope = scope;
    if (subjectUser) filter.subjectUser = subjectUser;
    
    const skip = (page - 1) * limit;
    
    const reports = await Report.find(filter)
      .populate('generatedBy', 'name email role')
      .populate('subjectUser', 'name email role employeeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Report.countDocuments(filter);
    
    successResponse(res, {
      reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasMore: skip + reports.length < total
      }
    }, 'Reports retrieved successfully');
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single report by ID
 * @route   GET /api/reports/:id
 * @access  Private
 */
exports.getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const report = await Report.findById(id)
      .populate('generatedBy', 'name email role')
      .populate('subjectUser', 'name email role employeeId');
    
    if (!report) {
      throw new AppError('Report not found', 404);
    }
    
    // Permission check
    const canView = ['admin', 'manager'].includes(userRole) ||
                    report.generatedBy._id.toString() === userId.toString() ||
                    report.subjectUser?._id.toString() === userId.toString();
    
    if (!canView) {
      throw new AppError('You do not have permission to view this report', 403);
    }
    
    successResponse(res, { report }, 'Report retrieved successfully');
    
  } catch (error) {
    next(error);
  }
};

// ============================================
// EXPORT REPORTS
// ============================================

/**
 * @desc    Export report as PDF
 * @route   GET /api/reports/:id/export/pdf
 * @access  Private
 */
exports.exportReportPDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id)
      .populate('generatedBy', 'name')
      .populate('subjectUser', 'name employeeId');
    
    if (!report) {
      throw new AppError('Report not found', 404);
    }
    
    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${report.reportId}.pdf`);
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(20).text('Performance Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Report ID: ${report.reportId}`);
    doc.text(`Type: ${report.type.replace(/_/g, ' ').toUpperCase()}`);
    doc.text(`Generated: ${new Date(report.createdAt).toLocaleString()}`);
    doc.text(`Generated By: ${report.generatedBy.name}`);
    
    if (report.subjectUser) {
      doc.text(`Subject: ${report.subjectUser.name} (${report.subjectUser.employeeId})`);
    }
    
    doc.moveDown();
    
    // Period
    doc.text(`Period: ${new Date(report.period.startDate).toLocaleDateString()} - ${new Date(report.period.endDate).toLocaleDateString()}`);
    doc.moveDown();
    
    // Summary metrics
    if (report.summary) {
      doc.fontSize(16).text('Summary', { underline: true });
      doc.fontSize(12).moveDown(0.5);
      
      Object.entries(report.summary).forEach(([key, value]) => {
        doc.text(`${key.replace(/([A-Z])/g, ' $1').trim()}: ${value}`);
      });
      
      doc.moveDown();
    }
    
    // Detailed data (simplified)
    if (report.data) {
      doc.fontSize(16).text('Details', { underline: true });
      doc.fontSize(10).moveDown(0.5);
      doc.text(JSON.stringify(report.data, null, 2), { width: 500 });
    }
    
    doc.end();
    
    // Update report
    report.exportedAt = new Date();
    report.exportFormat = 'pdf';
    report.status = 'downloaded';
    await report.save();
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export report as CSV
 * @route   GET /api/reports/:id/export/csv
 * @access  Private (Admin/Manager only)
 */
exports.exportReportCSV = async (req, res, next) => {
  try {
    if (!['admin', 'manager'].includes(req.user.role)) {
      throw new AppError('Only admins and managers can export to CSV', 403);
    }
    
    const { id } = req.params;
    const report = await Report.findById(id);
    
    if (!report) {
      throw new AppError('Report not found', 404);
    }
    
    let csv = '';
    
    // Generate CSV based on report type
    if (report.type.includes('waiter')) {
      csv = 'Date,Orders,Revenue,Completion Rate\n';
      report.data.dailyBreakdown?.forEach(day => {
        csv += `${day.date},${day.orders},${day.revenue},${day.completionRate}\n`;
      });
    }
    else if (report.type.includes('cook')) {
      csv = 'Date,Orders,Completed,Efficiency\n';
      report.data.dailyBreakdown?.forEach(day => {
        csv += `${day.date},${day.orders},${day.completed},${day.efficiency}\n`;
      });
    }
    else if (report.type.includes('cashier')) {
      csv = 'Date,Transactions,Revenue\n';
      report.data.dailyBreakdown?.forEach(day => {
        csv += `${day.date},${day.transactions},${day.revenue}\n`;
      });
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report-${report.reportId}.csv`);
    res.send(csv);
    
    report.exportedAt = new Date();
    report.exportFormat = 'csv';
    await report.save();
    
  } catch (error) {
    next(error);
  }
};

module.exports = exports;