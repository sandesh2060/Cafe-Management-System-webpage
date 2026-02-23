// ================================================================
// FILE: backend/src/modules/customer/customer.controller.js
// 👥 CUSTOMER MANAGEMENT CONTROLLER - COMPLETE
// ✅ Registration with multi-sample face recognition
// ✅ CRUD operations
// ✅ Statistics endpoint
// ✅ Session management
// ================================================================

const Customer = require('./customer.model');
const Table = require('../table/table.model');

/**
 * Register new customer with optional face data
 * POST /api/customers/register
 */
exports.register = async (req, res) => {
  console.log('=================================================');
  console.log('🔵 CUSTOMER REGISTRATION REQUEST');
  console.log('=================================================');
  
  try {
    const {
      username,
      displayName,
      email,
      phone,
      tableId,
      tableNumber,
      sessionId,
      descriptorSample, // Array of face descriptors (5+ for ultra-strict mode)
    } = req.body;

    console.log('📥 Registration Data:', {
      username,
      displayName,
      email,
      phone,
      tableId,
      tableNumber,
      sessionId,
      hasFaceData: !!descriptorSample,
      sampleCount: descriptorSample?.length,
    });

    // ============================================
    // VALIDATION
    // ============================================
    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    if (!tableId || !tableNumber) {
      return res.status(400).json({
        success: false,
        message: 'Table information is required'
      });
    }

    // Validate table exists
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    // ============================================
    // CHECK FOR EXISTING CUSTOMER
    // ============================================
    let customer = await Customer.findOne({ 
      username: username.toLowerCase().trim() 
    });

    if (customer) {
      console.log('📌 Existing customer found:', customer.username);
      
      // Update face data if provided
      if (descriptorSample && Array.isArray(descriptorSample) && descriptorSample.length > 0) {
        console.log('🔄 Updating face data for existing customer');
        
        // Store all samples (for ultra-strict mode) or just average (for normal mode)
        if (descriptorSample.length >= 5) {
          // Ultra-strict mode: store all samples
          console.log('🎯 Ultra-strict mode: storing all samples');
          await customer.registerFace(descriptorSample, {
            score: 1.0,
            variance: 0,
            consistency: 1.0
          });
        } else {
          // Normal mode: store average
          console.log('📊 Normal mode: storing average descriptor');
          const avgDescriptor = descriptorSample[0].map((_, i) => {
            const sum = descriptorSample.reduce((acc, desc) => acc + desc[i], 0);
            return sum / descriptorSample.length;
          });
          await customer.registerFace([avgDescriptor]);
        }
      }

      // Start session
      const newSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await customer.startSession(tableId, newSessionId);

      return res.json({
        success: true,
        isReturning: true,
        message: `Welcome back, ${customer.displayName || customer.username}!`,
        customer: {
          _id: customer._id,
          username: customer.username,
          displayName: customer.displayName,
          email: customer.email,
          phone: customer.phone,
          sessionId: newSessionId,
          tableId: tableId,
          tableNumber: tableNumber,
          loyaltyPoints: customer.loyaltyPoints || 0,
          visitCount: customer.visitCount || 0,
          hasFaceData: !!(customer.biometric?.face?.embeddings?.length > 0 || customer.biometric?.face?.embedding)
        }
      });
    }

    // ============================================
    // CREATE NEW CUSTOMER
    // ============================================
    console.log('🆕 Creating new customer');

    const customerData = {
      username: username.toLowerCase().trim(),
      displayName: displayName?.trim() || username.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      loyaltyPoints: 0,
      visitCount: 0,
      totalSpent: 0,
      isGuest: (!email || !email.trim()) && (!phone || !phone.trim()),
    };

    customer = await Customer.create(customerData);
    console.log('✅ Customer created:', customer._id);

    // ============================================
    // REGISTER FACE DATA IF PROVIDED
    // ============================================
    if (descriptorSample && Array.isArray(descriptorSample) && descriptorSample.length > 0) {
      console.log('🎯 Registering face data');
      
      // Validate descriptor length
      if (descriptorSample[0].length !== 128) {
        console.warn('⚠️ Invalid descriptor length, skipping face registration');
      } else {
        try {
          if (descriptorSample.length >= 5) {
            // Ultra-strict mode: store all samples
            console.log(`📸 Ultra-strict: storing ${descriptorSample.length} samples`);
            await customer.registerFace(descriptorSample, {
              score: 1.0,
              variance: 0,
              consistency: 1.0
            });
          } else {
            // Normal mode: store average
            console.log(`📊 Normal mode: storing average of ${descriptorSample.length} samples`);
            const avgDescriptor = descriptorSample[0].map((_, i) => {
              const sum = descriptorSample.reduce((acc, desc) => acc + desc[i], 0);
              return sum / descriptorSample.length;
            });
            await customer.registerFace([avgDescriptor]);
          }
          console.log('✅ Face registered successfully');
        } catch (faceError) {
          console.error('❌ Face registration failed:', faceError.message);
          // Continue with registration even if face registration fails
        }
      }
    }

    // ============================================
    // START SESSION
    // ============================================
    const newSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await customer.startSession(tableId, newSessionId);
    console.log('✅ Session started:', newSessionId);

    // ============================================
    // RESPONSE
    // ============================================
    res.status(201).json({
      success: true,
      isReturning: false,
      message: `Welcome, ${customer.displayName || customer.username}! Your profile has been created.`,
      customer: {
        _id: customer._id,
        username: customer.username,
        displayName: customer.displayName,
        email: customer.email,
        phone: customer.phone,
        sessionId: newSessionId,
        tableId: tableId,
        tableNumber: tableNumber,
        loyaltyPoints: customer.loyaltyPoints,
        visitCount: customer.visitCount,
        hasFaceData: !!(customer.biometric?.face?.embeddings?.length > 0 || customer.biometric?.face?.embedding)
      }
    });

  } catch (error) {
    console.error('💥 CUSTOMER REGISTRATION ERROR:', error);
    
    // Handle duplicate username
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists. Please choose a different username.',
        error: 'DUPLICATE_USERNAME'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Customer registration failed',
      error: error.message
    });
  }
};

/**
 * Get customer by ID
 * GET /api/customers/:customerId
 */
exports.getCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId)
      .select('-biometric.face.embedding -biometric.face.embeddings') // Don't send biometric data
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      customer: {
        _id: customer._id,
        username: customer.username,
        displayName: customer.displayName,
        email: customer.email,
        phone: customer.phone,
        loyaltyPoints: customer.loyaltyPoints,
        visitCount: customer.visitCount,
        totalSpent: customer.totalSpent,
        hasFaceData: !!(customer.biometric?.face?.embeddings?.length > 0 || customer.biometric?.face?.embedding),
        isGuest: customer.isGuest,
        createdAt: customer.createdAt,
        lastLogin: customer.lastLogin
      }
    });

  } catch (error) {
    console.error('❌ Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer',
      error: error.message
    });
  }
};

/**
 * Update customer profile
 * PUT /api/customers/:customerId
 */
exports.updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { displayName, email, phone } = req.body;

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Update fields
    if (displayName !== undefined) customer.displayName = displayName.trim();
    if (email !== undefined) customer.email = email ? email.trim() : null;
    if (phone !== undefined) customer.phone = phone ? phone.trim() : null;

    // Update guest status based on contact info
    customer.isGuest = !customer.email && !customer.phone;

    await customer.save();

    console.log('✅ Customer updated:', customer.username);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      customer: {
        _id: customer._id,
        username: customer.username,
        displayName: customer.displayName,
        email: customer.email,
        phone: customer.phone,
        isGuest: customer.isGuest
      }
    });

  } catch (error) {
    console.error('❌ Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: error.message
    });
  }
};

/**
 * Get all customers (admin/staff only)
 * GET /api/customers
 */
exports.getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;

    const query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { displayName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }

    const customers = await Customer.find(query)
      .select('-biometric.face.embedding -biometric.face.embeddings') // Exclude biometric data
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Customer.countDocuments(query);

    console.log(`📊 Retrieved ${customers.length} customers (page ${page}/${Math.ceil(count / limit)})`);

    res.json({
      success: true,
      customers: customers.map(c => ({
        _id: c._id,
        username: c.username,
        displayName: c.displayName,
        email: c.email,
        phone: c.phone,
        loyaltyPoints: c.loyaltyPoints,
        visitCount: c.visitCount,
        totalSpent: c.totalSpent,
        hasFaceData: !!(c.biometric?.face?.embeddings?.length > 0 || c.biometric?.face?.embedding),
        isGuest: c.isGuest,
        createdAt: c.createdAt,
        lastLogin: c.lastLogin
      })),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('❌ Get all customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customers',
      error: error.message
    });
  }
};

/**
 * Delete customer
 * DELETE /api/customers/:customerId
 */
exports.deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findByIdAndDelete(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    console.log('✅ Customer deleted:', customer.username);

    res.json({
      success: true,
      message: 'Customer deleted successfully',
      deletedCustomer: {
        _id: customer._id,
        username: customer.username
      }
    });

  } catch (error) {
    console.error('❌ Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message
    });
  }
};

/**
 * Get customer statistics
 * GET /api/customers/:customerId/stats
 */
exports.getCustomerStats = async (req, res) => {
  try {
    const { customerId } = req.params;

    console.log('📊 Fetching stats for customer:', customerId);

    // Get customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Import Order model
    const Order = require('../order/order.model');

    // Fetch all customer orders
    const orders = await Order.find({ customerId }).lean();

    // Calculate statistics
    const stats = {
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      activeOrders: orders.filter(o => 
        ['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(o.status)
      ).length,
      
      // Financial stats
      totalSpent: orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, order) => sum + (order.total || order.totals?.total || 0), 0),
      
      averageOrderValue: 0,
      
      // Rating stats
      avgRating: 0,
      totalReviews: orders.filter(o => o.rating).length,
      
      // Visit stats
      visitCount: customer.visitCount || 0,
      
      // Loyalty
      loyaltyPoints: customer.loyaltyPoints || 0
    };

    // Calculate average order value
    const completedOrders = orders.filter(o => o.status === 'completed');
    if (completedOrders.length > 0) {
      stats.averageOrderValue = completedOrders.reduce(
        (sum, o) => sum + (o.total || o.totals?.total || 0), 
        0
      ) / completedOrders.length;
    }

    // Calculate average rating
    const ratedOrders = orders.filter(o => o.rating);
    if (ratedOrders.length > 0) {
      stats.avgRating = ratedOrders.reduce((sum, o) => sum + o.rating, 0) / ratedOrders.length;
    }

    // Try to get loyalty data if loyalty system exists
    try {
      const Loyalty = require('../loyalty/loyalty.model');
      const loyaltyData = await Loyalty.findOne({ customerId }).lean();
      
      if (loyaltyData) {
        stats.loyaltyPoints = loyaltyData.points || 0;
        stats.visitCount = loyaltyData.visits || loyaltyData.totalVisits || stats.visitCount;
      }
    } catch (loyaltyErr) {
      console.log('ℹ️ Loyalty system not available:', loyaltyErr.message);
    }

    console.log('✅ Customer stats calculated:', {
      customerId,
      totalOrders: stats.totalOrders,
      totalSpent: stats.totalSpent.toFixed(2),
      visitCount: stats.visitCount
    });

    res.json({
      success: true,
      stats,
      customerId
    });

  } catch (error) {
    console.error('❌ Error fetching customer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer statistics',
      error: error.message
    });
  }
};