const User = require('./user.model');
const { successResponse, errorResponse } = require('../../shared/utils/response');
const AppError = require('../../shared/utils/AppError');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin/Manager
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    successResponse(res, {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasMore: skip + users.length < total
      }
    }, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin/Manager
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    successResponse(res, { user }, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user (including waiters and managers)
// @route   POST /api/users
// @access  Private/Admin/Manager
exports.createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phoneNumber,
      role,
      employeeId,
      department,
      salary,
      shiftTiming,
      assignedTables
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      throw new AppError('Please provide name, email, password, and role', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existingUser) {
      throw new AppError('User with this email or employee ID already exists', 409);
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'cashier', 'cook', 'waiter', 'customer'];
    if (!validRoles.includes(role)) {
      throw new AppError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
    }

    // Only admins can create other admins or managers
    if ((role === 'admin' || role === 'manager') && req.user.role !== 'admin') {
      throw new AppError('Only administrators can create admin or manager accounts', 403);
    }

    // Create user object
    const userData = {
      name,
      email,
      password,
      phoneNumber,
      role,
      status: 'active'
    };

    // Add waiter-specific fields
    if (role === 'waiter') {
      if (!employeeId) {
        throw new AppError('Employee ID is required for waiters', 400);
      }
      
      userData.employeeId = employeeId;
      userData.department = department || 'Service';
      userData.salary = salary;
      userData.shiftTiming = shiftTiming;
      userData.assignedTables = assignedTables || [];
    }

    // Add employee fields for staff roles (including manager)
    if (['manager', 'cashier', 'cook'].includes(role)) {
      if (employeeId) userData.employeeId = employeeId;
      if (department) userData.department = department;
      if (salary) userData.salary = salary;
      if (shiftTiming) userData.shiftTiming = shiftTiming;
    }

    const user = await User.create(userData);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    successResponse(res, { user: userResponse }, `${role} created successfully`, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin/Manager
exports.updateUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      role,
      status,
      employeeId,
      department,
      salary,
      shiftTiming,
      assignedTables
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Only admins can update admin or manager roles
    if ((user.role === 'admin' || user.role === 'manager' || role === 'admin' || role === 'manager') 
        && req.user.role !== 'admin') {
      throw new AppError('Only administrators can modify admin or manager accounts', 403);
    }

    // Update basic fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (status) user.status = status;

    // Update role if provided
    if (role) {
      const validRoles = ['admin', 'manager', 'cashier', 'cook', 'waiter', 'customer'];
      if (!validRoles.includes(role)) {
        throw new AppError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
      }
      user.role = role;
    }

    // Update waiter-specific fields
    if (user.role === 'waiter') {
      if (employeeId) user.employeeId = employeeId;
      if (department) user.department = department;
      if (salary !== undefined) user.salary = salary;
      if (shiftTiming) user.shiftTiming = shiftTiming;
      if (assignedTables) user.assignedTables = assignedTables;
    }

    // Update employee fields for staff roles (including manager)
    if (['manager', 'cashier', 'cook'].includes(user.role)) {
      if (employeeId) user.employeeId = employeeId;
      if (department) user.department = department;
      if (salary !== undefined) user.salary = salary;
      if (shiftTiming) user.shiftTiming = shiftTiming;
    }

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    successResponse(res, { user: userResponse }, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Only admins can delete managers or other admins
    if ((user.role === 'admin' || user.role === 'manager') && req.user.role !== 'admin') {
      throw new AppError('Only administrators can delete admin or manager accounts', 403);
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      throw new AppError('You cannot delete your own account', 400);
    }

    await user.deleteOne();

    successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role) {
      throw new AppError('Please provide a role', 400);
    }

    const validRoles = ['admin', 'manager', 'cashier', 'cook', 'waiter', 'customer'];
    if (!validRoles.includes(role)) {
      throw new AppError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
    }

    // Only admins can assign admin or manager roles
    if ((role === 'admin' || role === 'manager') && req.user.role !== 'admin') {
      throw new AppError('Only administrators can assign admin or manager roles', 403);
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.role = role;
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    successResponse(res, { user: userResponse }, 'User role updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status
// @route   PATCH /api/users/:id/status
// @access  Private/Admin/Manager
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      throw new AppError('Please provide a status', 400);
    }

    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Only admins can change status of managers or admins
    if ((user.role === 'admin' || user.role === 'manager') && req.user.role !== 'admin') {
      throw new AppError('Only administrators can change status of admin or manager accounts', 403);
    }

    user.status = status;
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    successResponse(res, { user: userResponse }, 'User status updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all waiters
// @route   GET /api/users/waiters
// @access  Private/Admin/Manager
exports.getAllWaiters = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = { role: 'waiter' };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    const waiters = await User.find(filter)
      .select('-password')
      .populate('assignedTables', 'tableNumber capacity location status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    successResponse(res, {
      waiters,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalWaiters: total,
        hasMore: skip + waiters.length < total
      }
    }, 'Waiters retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all managers
// @route   GET /api/users/managers
// @access  Private/Admin
exports.getAllManagers = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = { role: 'manager' };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    const managers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    successResponse(res, {
      managers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalManagers: total,
        hasMore: skip + managers.length < total
      }
    }, 'Managers retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Assign tables to waiter
// @route   PATCH /api/users/:id/assign-tables
// @access  Private/Admin/Manager
exports.assignTablesToWaiter = async (req, res, next) => {
  try {
    const { tableIds } = req.body;

    if (!tableIds || !Array.isArray(tableIds)) {
      throw new AppError('Please provide an array of table IDs', 400);
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'waiter') {
      throw new AppError('This user is not a waiter', 400);
    }

    user.assignedTables = tableIds;
    await user.save();

    // Populate assigned tables for response
    await user.populate('assignedTables', 'tableNumber capacity location status');

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    successResponse(res, { user: userResponse }, 'Tables assigned successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update waiter shift
// @route   PATCH /api/users/:id/shift
// @access  Private/Admin/Manager
exports.updateWaiterShift = async (req, res, next) => {
  try {
    const { shiftTiming } = req.body;

    if (!shiftTiming) {
      throw new AppError('Please provide shift timing', 400);
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'waiter') {
      throw new AppError('This user is not a waiter', 400);
    }

    user.shiftTiming = shiftTiming;
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    successResponse(res, { user: userResponse }, 'Shift timing updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get waiter statistics
// @route   GET /api/users/:id/stats
// @access  Private/Admin/Manager/Waiter
exports.getWaiterStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'waiter') {
      throw new AppError('This user is not a waiter', 400);
    }

    // Get waiter stats (you can expand this based on your Order model)
    const Order = require('../order/order.model');
    
    const stats = {
      totalTablesAssigned: user.assignedTables.length,
      // Add more stats as needed
      // totalOrders: await Order.countDocuments({ waiterId: user._id }),
      // totalRevenue: await Order.aggregate([...]),
    };

    successResponse(res, { stats }, 'Waiter statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};