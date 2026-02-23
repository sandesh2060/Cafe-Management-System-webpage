const User = require('./user.model');
const Table = require('../table/table.model');
const AppError = require('../../shared/utils/AppError');

class UserService {
  /**
   * Create a new waiter
   */
  async createWaiter(waiterData) {
    const {
      name,
      email,
      password,
      phoneNumber,
      employeeId,
      department = 'Service',
      salary,
      shiftTiming,
      assignedTables = []
    } = waiterData;

    // Validate required fields
    if (!name || !email || !password || !employeeId) {
      throw new AppError('Please provide name, email, password, and employee ID', 400);
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Check if employee ID already exists
    const existingEmployee = await User.findOne({ employeeId });
    if (existingEmployee) {
      throw new AppError('Employee ID already exists', 409);
    }

    // Validate assigned tables if provided
    if (assignedTables.length > 0) {
      const validTables = await Table.find({ _id: { $in: assignedTables } });
      if (validTables.length !== assignedTables.length) {
        throw new AppError('One or more invalid table IDs', 400);
      }
    }

    // Create waiter
    const waiter = await User.create({
      name,
      email,
      password,
      phoneNumber,
      role: 'waiter',
      employeeId,
      department,
      salary,
      shiftTiming,
      assignedTables,
      status: 'active'
    });

    // Update tables with assigned waiter
    if (assignedTables.length > 0) {
      await Table.updateMany(
        { _id: { $in: assignedTables } },
        { assignedWaiter: waiter._id }
      );
    }

    return waiter;
  }

  /**
   * Create a new manager
   */
  async createManager(managerData) {
    const {
      name,
      email,
      password,
      phoneNumber,
      employeeId,
      department = 'Management',
      salary,
      shiftTiming
    } = managerData;

    // Validate required fields
    if (!name || !email || !password || !employeeId) {
      throw new AppError('Please provide name, email, password, and employee ID', 400);
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Check if employee ID already exists
    const existingEmployee = await User.findOne({ employeeId });
    if (existingEmployee) {
      throw new AppError('Employee ID already exists', 409);
    }

    // Create manager
    const manager = await User.create({
      name,
      email,
      password,
      phoneNumber,
      role: 'manager',
      employeeId,
      department,
      salary,
      shiftTiming,
      status: 'active'
    });

    return manager;
  }

  /**
   * Get all waiters with optional filters
   */
  async getAllWaiters(filters = {}) {
    const { status, search, page = 1, limit = 10 } = filters;

    const query = { role: 'waiter' };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const waiters = await User.find(query)
      .select('-password')
      .populate('assignedTables', 'tableNumber capacity location status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    return {
      waiters,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalWaiters: total,
        hasMore: skip + waiters.length < total
      }
    };
  }

  /**
   * Get all managers with optional filters
   */
  async getAllManagers(filters = {}) {
    const { status, search, page = 1, limit = 10 } = filters;

    const query = { role: 'manager' };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const managers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    return {
      managers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalManagers: total,
        hasMore: skip + managers.length < total
      }
    };
  }

  /**
   * Get waiter by ID with populated data
   */
  async getWaiterById(waiterId) {
    const waiter = await User.findOne({ _id: waiterId, role: 'waiter' })
      .select('-password')
      .populate('assignedTables', 'tableNumber capacity location status');

    if (!waiter) {
      throw new AppError('Waiter not found', 404);
    }

    return waiter;
  }

  /**
   * Get manager by ID
   */
  async getManagerById(managerId) {
    const manager = await User.findOne({ _id: managerId, role: 'manager' })
      .select('-password');

    if (!manager) {
      throw new AppError('Manager not found', 404);
    }

    return manager;
  }

  /**
   * Update waiter information
   */
  async updateWaiter(waiterId, updateData) {
    const waiter = await User.findOne({ _id: waiterId, role: 'waiter' });

    if (!waiter) {
      throw new AppError('Waiter not found', 404);
    }

    // Update allowed fields
    const allowedFields = [
      'name',
      'email',
      'phoneNumber',
      'employeeId',
      'department',
      'salary',
      'shiftTiming',
      'status',
      'address',
      'profileImage'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        waiter[field] = updateData[field];
      }
    });

    await waiter.save();

    return waiter;
  }

  /**
   * Update manager information
   */
  async updateManager(managerId, updateData) {
    const manager = await User.findOne({ _id: managerId, role: 'manager' });

    if (!manager) {
      throw new AppError('Manager not found', 404);
    }

    // Update allowed fields
    const allowedFields = [
      'name',
      'email',
      'phoneNumber',
      'employeeId',
      'department',
      'salary',
      'shiftTiming',
      'status',
      'address',
      'profileImage'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        manager[field] = updateData[field];
      }
    });

    await manager.save();

    return manager;
  }

  /**
   * Assign tables to waiter
   */
  async assignTables(waiterId, tableIds) {
    if (!Array.isArray(tableIds)) {
      throw new AppError('Table IDs must be an array', 400);
    }

    const waiter = await User.findOne({ _id: waiterId, role: 'waiter' });

    if (!waiter) {
      throw new AppError('Waiter not found', 404);
    }

    // Validate all table IDs
    const validTables = await Table.find({ _id: { $in: tableIds } });
    if (validTables.length !== tableIds.length) {
      throw new AppError('One or more invalid table IDs', 400);
    }

    // Remove waiter from previously assigned tables
    if (waiter.assignedTables.length > 0) {
      await Table.updateMany(
        { _id: { $in: waiter.assignedTables } },
        { $unset: { assignedWaiter: 1 } }
      );
    }

    // Assign new tables
    waiter.assignedTables = tableIds;
    await waiter.save();

    // Update tables with new assigned waiter
    await Table.updateMany(
      { _id: { $in: tableIds } },
      { assignedWaiter: waiter._id }
    );

    return waiter;
  }

  /**
   * Remove table assignment from waiter
   */
  async unassignTable(waiterId, tableId) {
    const waiter = await User.findOne({ _id: waiterId, role: 'waiter' });

    if (!waiter) {
      throw new AppError('Waiter not found', 404);
    }

    // Remove table from waiter's assigned tables
    waiter.assignedTables = waiter.assignedTables.filter(
      id => id.toString() !== tableId.toString()
    );

    await waiter.save();

    // Remove waiter from table
    await Table.findByIdAndUpdate(tableId, {
      $unset: { assignedWaiter: 1 }
    });

    return waiter;
  }

  /**
   * Update waiter shift timing
   */
  async updateShift(waiterId, shiftTiming) {
    if (!shiftTiming) {
      throw new AppError('Please provide shift timing', 400);
    }

    const waiter = await User.findOne({ _id: waiterId, role: 'waiter' });

    if (!waiter) {
      throw new AppError('Waiter not found', 404);
    }

    waiter.shiftTiming = shiftTiming;
    await waiter.save();

    return waiter;
  }

  /**
   * Get waiter statistics and performance
   */
  async getWaiterStats(waiterId) {
    const waiter = await User.findOne({ _id: waiterId, role: 'waiter' })
      .populate('assignedTables', 'tableNumber capacity');

    if (!waiter) {
      throw new AppError('Waiter not found', 404);
    }

    // You can expand this with actual order data
    const stats = {
      waiterInfo: {
        name: waiter.name,
        employeeId: waiter.employeeId,
        department: waiter.department,
        shiftTiming: waiter.shiftTiming,
        joinDate: waiter.joinDate,
        status: waiter.status
      },
      tableAssignments: {
        totalTables: waiter.assignedTables.length,
        tables: waiter.assignedTables
      }
      // Add more stats as needed:
      // ordersServed: await Order.countDocuments({ waiterId }),
      // totalRevenue: calculated from orders
      // averageOrderValue: calculated
      // customerSatisfaction: from ratings
    };

    return stats;
  }

  /**
   * Get available waiters (active and not on leave)
   */
  async getAvailableWaiters() {
    const waiters = await User.find({
      role: 'waiter',
      status: 'active'
    })
      .select('name employeeId assignedTables shiftTiming')
      .populate('assignedTables', 'tableNumber');

    return waiters;
  }

  /**
   * Get all staff members (waiters, managers, cashiers, cooks)
   */
  async getAllStaff(filters = {}) {
    const { role, status, search, page = 1, limit = 10 } = filters;

    const query = { 
      role: { $in: ['admin', 'manager', 'cashier', 'cook', 'waiter'] }
    };

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const staff = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    return {
      staff,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalStaff: total,
        hasMore: skip + staff.length < total
      }
    };
  }

  /**
   * Change user status (works for all roles)
   */
  async updateStatus(userId, status) {
    const validStatuses = ['active', 'inactive', 'suspended'];
    
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.status = status;
    await user.save();

    // If setting waiter to inactive/suspended, unassign tables
    if (user.role === 'waiter' && status !== 'active' && user.assignedTables.length > 0) {
      await Table.updateMany(
        { _id: { $in: user.assignedTables } },
        { $unset: { assignedWaiter: 1 } }
      );
    }

    return user;
  }

  /**
   * Delete waiter
   */
  async deleteWaiter(waiterId) {
    const waiter = await User.findOne({ _id: waiterId, role: 'waiter' });

    if (!waiter) {
      throw new AppError('Waiter not found', 404);
    }

    // Unassign all tables
    if (waiter.assignedTables.length > 0) {
      await Table.updateMany(
        { _id: { $in: waiter.assignedTables } },
        { $unset: { assignedWaiter: 1 } }
      );
    }

    await waiter.deleteOne();

    return { message: 'Waiter deleted successfully' };
  }

  /**
   * Delete manager
   */
  async deleteManager(managerId) {
    const manager = await User.findOne({ _id: managerId, role: 'manager' });

    if (!manager) {
      throw new AppError('Manager not found', 404);
    }

    await manager.deleteOne();

    return { message: 'Manager deleted successfully' };
  }

  /**
   * Bulk assign tables to multiple waiters
   */
  async bulkAssignTables(assignments) {
    // assignments = [{ waiterId, tableIds }, ...]
    const results = [];

    for (const assignment of assignments) {
      try {
        const waiter = await this.assignTables(assignment.waiterId, assignment.tableIds);
        results.push({
          waiterId: assignment.waiterId,
          success: true,
          waiter
        });
      } catch (error) {
        results.push({
          waiterId: assignment.waiterId,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = new UserService();