// File: backend/src/modules/manager/manager.controller.js
// ✅ UPDATED: Added dashboard-stats, inventory, and reports endpoints

const User = require('../user/user.model');
const Table = require('../table/table.model');
const Order = require('../order/order.model');
const MenuItem = require('../menu/menu.model');
const Restaurant = require('../restaurant/restaurant.model'); // ✅ ADD THIS
const { successResponse, errorResponse, AppError } = require('../../shared/utils/response');
const { generateTableQR } = require('../../shared/utils/qrGenerator');
const crypto = require('crypto');

// ============================================
// DASHBOARD STATISTICS
// ============================================

// @desc    Get dashboard statistics
// @route   GET /api/manager/dashboard-stats
// @access  Private/Manager/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's sales
    const todayOrders = await Order.find({
      createdAt: { $gte: today },
      status: { $in: ["completed", "served"] },
      paymentStatus: "paid",
    });

    const todaySales = todayOrders.reduce(
      (sum, order) => sum + (order.total || 0),
      0,
    );

    // Active orders
    const activeOrders = await Order.countDocuments({
      status: { $in: ["pending", "confirmed", "preparing", "ready"] },
    });

    // Staff statistics
    const totalStaff = await User.countDocuments({
      role: { $in: ["waiter", "cook", "cashier", "manager"] },
    });

    const onlineStaff = await User.countDocuments({
      role: { $in: ["waiter", "cook", "cashier", "manager"] },
      status: "active",
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
    });

    // Table statistics
    const totalTables = await Table.countDocuments();
    const activeTables = await Table.countDocuments({ status: "occupied" });

    // Low inventory items (if you have inventory model)
    let lowInventoryItems = 0;
    try {
      const Inventory = require("../inventory/inventory.model");
      lowInventoryItems = await Inventory.countDocuments({
        $expr: { $lt: ["$stock", "$reorderLevel"] },
      });
    } catch (error) {
      // Inventory model might not exist yet
      lowInventoryItems = 0;
    }

    // Recent activity (last 5 orders)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("tableId", "number")
      .select("tableId total status createdAt");

    const recentActivity = recentOrders.map((order) => ({
      description: `Order for Table ${order.tableId?.number || "N/A"} - $${order.total?.toFixed(2) || "0.00"}`,
      time: getTimeAgo(order.createdAt),
    }));

    // Performance metrics
    const completedToday = todayOrders.length;
    const avgWaitTime = 15; // You can calculate this from order timestamps
    const completionRate = 95; // You can calculate this from order statuses
    const tableTurnover = Math.round(completedToday / (totalTables || 1));

    const stats = {
      todaySales: Number(todaySales.toFixed(2)),
      activeOrders,
      onlineStaff,
      totalStaff,
      activeTables,
      totalTables,
      lowInventoryItems,
      completedToday,
      avgWaitTime,
      completionRate,
      tableTurnover,
      recentActivity,
    };

    successResponse(res, stats, "Dashboard statistics retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// Helper function to get time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

// ============================================
// INVENTORY MANAGEMENT
// ============================================

// @desc    Get inventory items
// @route   GET /api/manager/inventory
// @access  Private/Manager/Admin
exports.getInventory = async (req, res, next) => {
  try {
    let inventory = [];
    let stats = {
      total: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
    };

    try {
      const Inventory = require("../inventory/inventory.model");

      inventory = await Inventory.find().sort({ name: 1 });

      stats.total = inventory.length;
      stats.lowStockCount = inventory.filter(
        (item) => item.stock > 0 && item.stock < item.reorderLevel,
      ).length;
      stats.outOfStockCount = inventory.filter(
        (item) => item.stock === 0,
      ).length;
    } catch (error) {
      // Inventory model doesn't exist, return mock data for now
      console.log("Inventory model not found, returning empty data");
    }

    successResponse(
      res,
      { inventory, stats },
      "Inventory retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

// ============================================
// REPORTS
// ============================================

// @desc    Get revenue report
// @route   GET /api/manager/reports/revenue
// @access  Private/Manager/Admin
exports.getRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new AppError("Please provide start date and end date", 400);
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Get orders in date range
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $in: ["completed", "served"] },
      paymentStatus: "paid",
    }).populate("items.menuItemId", "name category price");

    // Calculate summary
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.total || 0),
      0,
    );
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const cashPayments = orders
      .filter((order) => order.paymentMethod === "cash")
      .reduce((sum, order) => sum + (order.total || 0), 0);

    const cardPayments = orders
      .filter((order) => order.paymentMethod === "card")
      .reduce((sum, order) => sum + (order.total || 0), 0);

    // Category breakdown
    const categoryRevenue = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const category = item.menuItemId?.category || "Other";
        if (!categoryRevenue[category]) {
          categoryRevenue[category] = { revenue: 0, count: 0 };
        }
        categoryRevenue[category].revenue += item.price * item.quantity;
        categoryRevenue[category].count += item.quantity;
      });
    });

    const categoryData = Object.keys(categoryRevenue).map((category) => ({
      _id: category,
      revenue: categoryRevenue[category].revenue,
      count: categoryRevenue[category].count,
    }));

    // Daily breakdown
    const dailyRevenue = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = { revenue: 0, orders: 0 };
      }
      dailyRevenue[date].revenue += order.total;
      dailyRevenue[date].orders += 1;
    });

    const salesData = Object.keys(dailyRevenue)
      .sort()
      .map((date) => ({
        _id: date,
        revenue: dailyRevenue[date].revenue,
        orders: dailyRevenue[date].orders,
      }));

    const report = {
      summary: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders,
        avgOrderValue: Number(avgOrderValue.toFixed(2)),
        cashPayments: Number(cashPayments.toFixed(2)),
        cardPayments: Number(cardPayments.toFixed(2)),
      },
      categoryData,
      salesData,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    };

    successResponse(res, report, "Revenue report generated successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Download revenue report
// @route   GET /api/manager/reports/revenue/download
// @access  Private/Manager/Admin
exports.downloadRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new AppError("Please provide start date and end date", 400);
    }

    // Generate CSV data
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $in: ["completed", "served"] },
      paymentStatus: "paid",
    })
      .populate("tableId", "number")
      .populate("customerId", "name");

    // Create CSV
    let csv = "Date,Order ID,Table,Customer,Amount,Payment Method,Status\n";
    orders.forEach((order) => {
      csv += `${order.createdAt.toISOString()},${order._id},${order.tableId?.number || "N/A"},${order.customerId?.name || "Guest"},${order.total},${order.paymentMethod || "N/A"},${order.status}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=revenue-report-${startDate}-to-${endDate}.csv`,
    );
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales analytics
// @route   GET /api/manager/analytics/sales
// @access  Private/Manager/Admin
exports.getSalesAnalytics = async (req, res, next) => {
  try {
    const { period = "week" } = req.query;

    let startDate = new Date();

    switch (period) {
      case "day":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const orders = await Order.find({
      createdAt: { $gte: startDate },
      status: { $in: ["completed", "served"] },
      paymentStatus: "paid",
    }).populate("items.menuItemId", "name category");

    // Daily revenue
    const dailyRevenue = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = 0;
      }
      dailyRevenue[date] += order.total;
    });

    const salesData = Object.keys(dailyRevenue)
      .sort()
      .map((date) => ({
        _id: date,
        revenue: dailyRevenue[date],
      }));

    // Category performance
    const categoryRevenue = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const category = item.menuItemId?.category || "Other";
        if (!categoryRevenue[category]) {
          categoryRevenue[category] = { revenue: 0, count: 0 };
        }
        categoryRevenue[category].revenue += item.price * item.quantity;
        categoryRevenue[category].count += item.quantity;
      });
    });

    const categoryData = Object.keys(categoryRevenue).map((category) => ({
      _id: category,
      revenue: categoryRevenue[category].revenue,
      count: categoryRevenue[category].count,
    }));

    successResponse(
      res,
      { salesData, categoryData },
      "Sales analytics retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

// ============================================
// STAFF MANAGEMENT
// ============================================

// Generate random password
const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Generate employee ID
const generateEmployeeId = async (role) => {
  const prefix =
    {
      waiter: "WTR",
      cook: "COK",
      cashier: "CSH",
      manager: "MGR",
    }[role] || "EMP";

  const randomNum = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${randomNum}`;
};

// @desc    Create staff member (waiter/cook/cashier)
// @route   POST /api/manager/staff
// @access  Private/Manager/Admin
exports.createStaffMember = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      role,
      department,
      salary,
      shiftTiming,
      assignedTables,
    } = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      throw new AppError("Please provide name, email, and role", 400);
    }

    // Validate role
    const allowedRoles = ["waiter", "cook", "cashier"];
    if (!allowedRoles.includes(role)) {
      throw new AppError(
        "Invalid role. Can only create waiter, cook, or cashier",
        400,
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("User with this email already exists", 409);
    }

    // Generate employee ID and password
    const employeeId = await generateEmployeeId(role);
    const generatedPassword = generatePassword();

    // Create user data
    const userData = {
      name,
      email,
      password: generatedPassword,
      phoneNumber,
      role,
      employeeId,
      department:
        department ||
        (role === "cook"
          ? "Kitchen"
          : role === "waiter"
            ? "Service"
            : "Finance"),
      salary,
      shiftTiming,
      status: "active",
    };

    // Add waiter-specific fields
    if (role === "waiter" && assignedTables) {
      userData.assignedTables = assignedTables;
    }

    const user = await User.create(userData);

    // Populate assigned tables for response
    if (role === "waiter") {
      await user.populate("assignedTables", "number capacity location status");
    }

    // Remove password from user object
    const userResponse = user.toObject();
    delete userResponse.password;

    successResponse(
      res,
      {
        user: userResponse,
        credentials: {
          email,
          password: generatedPassword, // Only shown once during creation
          employeeId,
        },
      },
      `${role} created successfully. Save these credentials - password won't be shown again!`,
      201,
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all staff members
// @route   GET /api/manager/staff
// @access  Private/Manager/Admin
exports.getAllStaff = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    // Build filter - only staff roles
    const filter = { role: { $in: ["waiter", "cook", "cashier", "manager"] } };

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const staff = await User.find(filter)
      .select("-password")
      .populate("assignedTables", "number capacity location status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    successResponse(
      res,
      {
        staff,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          total,
          hasMore: skip + staff.length < total,
        },
      },
      "Staff retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get staff statistics
// @route   GET /api/manager/staff/stats
// @access  Private/Manager/Admin
exports.getStaffStats = async (req, res, next) => {
  try {
    const totalStaff = await User.countDocuments({
      role: { $in: ["waiter", "cook", "cashier", "manager"] },
    });

    const activeStaff = await User.countDocuments({
      role: { $in: ["waiter", "cook", "cashier", "manager"] },
      status: "active",
    });

    const waiters = await User.countDocuments({ role: "waiter" });
    const cooks = await User.countDocuments({ role: "cook" });
    const cashiers = await User.countDocuments({ role: "cashier" });
    const managers = await User.countDocuments({ role: "manager" });

    const stats = {
      total: totalStaff,
      active: activeStaff,
      inactive: totalStaff - activeStaff,
      byRole: {
        waiters,
        cooks,
        cashiers,
        managers,
      },
    };

    successResponse(res, { stats }, "Staff statistics retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Get single staff member
// @route   GET /api/manager/staff/:id
// @access  Private/Manager/Admin
exports.getStaffMember = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("assignedTables", "number capacity location status");

    if (!user) {
      throw new AppError("Staff member not found", 404);
    }

    if (!["waiter", "cook", "cashier", "manager"].includes(user.role)) {
      throw new AppError("User is not a staff member", 400);
    }

    successResponse(res, { user }, "Staff member retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff member
// @route   PUT /api/manager/staff/:id
// @access  Private/Manager/Admin
exports.updateStaffMember = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      department,
      salary,
      shiftTiming,
      assignedTables,
      status,
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError("Staff member not found", 404);
    }

    // Only allow updating staff roles
    if (!["waiter", "cook", "cashier", "manager"].includes(user.role)) {
      throw new AppError("Can only update staff members", 400);
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (department) user.department = department;
    if (salary !== undefined) user.salary = salary;
    if (shiftTiming) user.shiftTiming = shiftTiming;
    if (status) user.status = status;

    // Update waiter-specific fields
    if (user.role === "waiter" && assignedTables !== undefined) {
      user.assignedTables = assignedTables;
    }

    await user.save();

    // Populate assigned tables
    if (user.role === "waiter") {
      await user.populate("assignedTables", "number capacity location status");
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    successResponse(
      res,
      { user: userResponse },
      "Staff member updated successfully",
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/deactivate staff member
// @route   DELETE /api/manager/staff/:id
// @access  Private/Manager/Admin
exports.deleteStaffMember = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError("Staff member not found", 404);
    }

    // Only allow deleting staff roles
    if (!["waiter", "cook", "cashier"].includes(user.role)) {
      throw new AppError(
        "Can only delete waiter, cook, or cashier accounts",
        400,
      );
    }

    // Soft delete - just deactivate
    user.status = "inactive";
    await user.save();

    successResponse(res, null, "Staff member deactivated successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Reset staff password
// @route   POST /api/manager/staff/:id/reset-password
// @access  Private/Manager/Admin
exports.resetStaffPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError("Staff member not found", 404);
    }

    if (!["waiter", "cook", "cashier", "manager"].includes(user.role)) {
      throw new AppError("Can only reset password for staff members", 400);
    }

    // Generate new password
    const newPassword = generatePassword();
    user.password = newPassword;
    await user.save();

    successResponse(
      res,
      {
        email: user.email,
        newPassword, // Only shown once
        employeeId: user.employeeId,
      },
      "Password reset successfully. Save this password - it won't be shown again!",
    );
  } catch (error) {
    next(error);
  }
};

// ============================================
// TABLE MANAGEMENT
// ============================================

// @desc    Create new table with QR code
// @route   POST /api/manager/tables
// @access  Private/Manager/Admin
exports.createTable = async (req, res, next) => {
  try {
    const { number, capacity, location, restaurant } = req.body;

    // Validate required fields
    if (!number || !capacity || !location) {
      throw new AppError(
        "Please provide table number, capacity, and location",
        400,
      );
    }

    // Check if table number already exists
    const existingTable = await Table.findOne({ number });
    if (existingTable) {
      throw new AppError("Table number already exists", 409);
    }

    // Validate location coordinates
    if (!location.coordinates || location.coordinates.length !== 2) {
      throw new AppError(
        "Invalid location coordinates. Provide [longitude, latitude]",
        400,
      );
    }

    // Create table data
    const tableData = {
      number,
      capacity,
      location: {
        type: "Point",
        coordinates: location.coordinates, // [longitude, latitude]
      },
      status: "available",
    };

    // Add restaurant if provided
    if (restaurant) {
      tableData.restaurant = restaurant;
    }

    const table = await Table.create(tableData);

    // Generate QR code
    const qrCodeData = await generateTableQR(table._id, table.number);
    table.qrCode = qrCodeData;
    await table.save();

    successResponse(
      res,
      {
        table,
        qrCodeImage: qrCodeData, // Base64 QR code image
      },
      "Table created successfully with QR code",
      201,
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tables
// @route   GET /api/manager/tables
// @access  Private/Manager/Admin
exports.getAllTables = async (req, res, next) => {
  try {
    const { status, restaurant, page = 1, limit = 50 } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (restaurant) filter.restaurant = restaurant;

    const skip = (page - 1) * limit;

    const tables = await Table.find(filter)
      .populate("currentCustomer", "name phoneNumber")
      .sort({ number: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Table.countDocuments(filter);

    successResponse(
      res,
      {
        tables,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          total,
          hasMore: skip + tables.length < total,
        },
      },
      "Tables retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get table statistics
// @route   GET /api/manager/tables/stats
// @access  Private/Manager/Admin
exports.getTableStats = async (req, res, next) => {
  try {
    const { restaurant } = req.query;

    const filter = restaurant ? { restaurant } : {};

    const totalTables = await Table.countDocuments(filter);
    const availableTables = await Table.countDocuments({
      ...filter,
      status: "available",
    });
    const occupiedTables = await Table.countDocuments({
      ...filter,
      status: "occupied",
    });
    const reservedTables = await Table.countDocuments({
      ...filter,
      status: "reserved",
    });

    const stats = {
      total: totalTables,
      available: availableTables,
      occupied: occupiedTables,
      reserved: reservedTables,
      occupancyRate:
        totalTables > 0 ? ((occupiedTables / totalTables) * 100).toFixed(2) : 0,
    };

    successResponse(res, { stats }, "Table statistics retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Get single table
// @route   GET /api/manager/tables/:id
// @access  Private/Manager/Admin
exports.getTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id)
      .populate("restaurant", "name")
      .populate("currentCustomer", "name phoneNumber");

    if (!table) {
      throw new AppError("Table not found", 404);
    }

    successResponse(res, { table }, "Table retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Update table
// @route   PUT /api/manager/tables/:id
// @access  Private/Manager/Admin
exports.updateTable = async (req, res, next) => {
  try {
    const { number, capacity, location, status, restaurant } = req.body;

    const table = await Table.findById(req.params.id);

    if (!table) {
      throw new AppError("Table not found", 404);
    }

    // Check if new table number already exists
    if (number && number !== table.number) {
      const existingTable = await Table.findOne({ number });
      if (existingTable) {
        throw new AppError("Table number already exists", 409);
      }
    }

    // Store old number for QR regeneration check
    const oldNumber = table.number;

    // Update fields
    if (number) table.number = number;
    if (capacity) table.capacity = capacity;
    if (location) {
      table.location = {
        type: "Point",
        coordinates: location.coordinates,
      };
    }
    if (status) table.status = status;
    if (restaurant) table.restaurant = restaurant;

    // Regenerate QR if table number changed
    if (number && number !== oldNumber) {
      const qrCodeData = await generateTableQR(table._id, table.number);
      table.qrCode = qrCodeData;
    }

    await table.save();

    await table.populate("restaurant", "name");
    await table.populate("currentCustomer", "name phoneNumber");

    successResponse(res, { table }, "Table updated successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Delete table
// @route   DELETE /api/manager/tables/:id
// @access  Private/Manager/Admin
exports.deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      throw new AppError("Table not found", 404);
    }

    // Check if table is currently occupied
    if (table.status === "occupied") {
      throw new AppError("Cannot delete an occupied table", 400);
    }

    await table.deleteOne();

    successResponse(res, null, "Table deleted successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Regenerate QR code for table
// @route   POST /api/manager/tables/:id/regenerate-qr
// @access  Private/Manager/Admin
exports.regenerateTableQR = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      throw new AppError("Table not found", 404);
    }

    // Generate new QR code
    const qrCodeData = await generateTableQR(table._id, table.number);
    table.qrCode = qrCodeData;
    await table.save();

    successResponse(
      res,
      {
        table,
        qrCodeImage: qrCodeData,
      },
      "QR code regenerated successfully",
    );
  } catch (error) {
    next(error);
  }
};
