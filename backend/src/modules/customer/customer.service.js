// File: backend/src/modules/customer/customer.service.js
// ✅ PRODUCTION-READY: Complete customer service with real stats
// 🎯 FIXED: Favorites now return all items (not just available ones)

const Customer = require('./customer.model');
const Order = require('../order/order.model');
const mongoose = require('mongoose');

// Check if username exists
exports.checkUsernameExists = async (username) => {
  try {
    const customer = await Customer.findOne({ 
      username: username.toLowerCase().trim() 
    });
    return !!customer;
  } catch (error) {
    throw new Error(`Username check failed: ${error.message}`);
  }
};

// Start customer session
exports.startSession = async ({ username, tableId, location }) => {
  const dbSession = await mongoose.startSession();
  
  try {
    dbSession.startTransaction();

    // Find or create customer
    let customer = await Customer.findOne({ 
      username: username.toLowerCase().trim() 
    });

    if (!customer) {
      customer = await Customer.create([{
        username: username.toLowerCase().trim(),
        displayName: username.trim(),
        firstVisit: new Date(),
        lastVisit: new Date(),
        visitCount: 1
      }], { session: dbSession });
      customer = customer[0];
    } else {
      customer.lastVisit = new Date();
      customer.visitCount = (customer.visitCount || 0) + 1;
      await customer.save({ session: dbSession });
    }

    // Create session data
    const sessionData = {
      customerId: customer._id,
      customer: {
        id: customer._id,
        username: customer.username,
        displayName: customer.displayName
      },
      tableId: tableId || null,
      location: location || null,
      startTime: new Date(),
      isActive: true
    };

    await dbSession.commitTransaction();

    return sessionData;
  } catch (error) {
    await dbSession.abortTransaction();
    throw new Error(`Session start failed: ${error.message}`);
  } finally {
    await dbSession.endSession();
  }
};

// End customer session
exports.endSession = async (customerId, sessionId) => {
  try {
    await Customer.findByIdAndUpdate(customerId, {
      lastVisit: new Date()
    });

    return true;
  } catch (error) {
    throw new Error(`Session end failed: ${error.message}`);
  }
};

// Get customer by ID
exports.getCustomerById = async (customerId) => {
  try {
    const customer = await Customer.findById(customerId)
      .select('-__v')
      .lean();
    
    if (!customer) {
      throw new Error('Customer not found');
    }
    
    return customer;
  } catch (error) {
    throw new Error(`Get customer failed: ${error.message}`);
  }
};

// Get active session
exports.getActiveSession = async (customerId) => {
  try {
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      return null;
    }

    return {
      customerId: customer._id,
      customer: {
        id: customer._id,
        username: customer.username,
        displayName: customer.displayName
      },
      isActive: true,
      startTime: customer.lastVisit
    };
  } catch (error) {
    throw new Error(`Get session failed: ${error.message}`);
  }
};

// 🎯 FIXED: Get customer favorites with full menu item details
// ✅ Now returns ALL favorites, not just available ones
exports.getFavorites = async (customerId) => {
  try {
    console.log('🔍 Fetching favorites for customer:', customerId);
    
    const customer = await Customer.findById(customerId)
      .populate({
        path: 'favorites',
        select: 'name category description price image isAvailable createdAt',
        // ✅ REMOVED: match: { isAvailable: true } - now returns all items
      })
      .select('favorites')
      .lean();
    
    if (!customer) {
      console.log('⚠️ Customer not found');
      return [];
    }
    
    // Filter out null/deleted items but keep unavailable ones
    const favorites = (customer.favorites || []).filter(item => item !== null);
    
    console.log('✅ Favorites found:', favorites.length);
    console.log('📋 Favorite items:', favorites.map(f => ({
      id: f._id,
      name: f.name,
      available: f.isAvailable
    })));
    
    return favorites;
  } catch (error) {
    console.error('❌ Get favorites error:', error);
    return [];
  }
};

// ✅ PRODUCTION-READY: Get comprehensive customer statistics
exports.getCustomerStats = async (customerId) => {
  try {
    // Get customer data
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Get real order statistics from Order collection
    const orderStats = await Order.aggregate([
      {
        $match: {
          customerId: new mongoose.Types.ObjectId(customerId),
          status: { $ne: 'cancelled' } // Exclude cancelled orders
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          averageOrderValue: { $avg: '$total' },
          // Calculate average rating from completed orders that have ratings
          totalRatings: { $sum: { $cond: ['$rating', 1, 0] } },
          sumRatings: { $sum: { $ifNull: ['$rating', 0] } }
        }
      }
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      completedOrders: 0,
      averageOrderValue: 0,
      totalRatings: 0,
      sumRatings: 0
    };

    // Calculate average rating
    const avgRating = stats.totalRatings > 0 
      ? stats.sumRatings / stats.totalRatings 
      : 0;

    // Update customer model with calculated stats (for caching)
    customer.totalOrders = stats.totalOrders;
    customer.totalSpent = Number(stats.totalSpent.toFixed(2));
    customer.averageOrderValue = Number(stats.averageOrderValue.toFixed(2));
    
    // Save updated stats (fire and forget, don't wait)
    customer.save().catch(err => console.error('Failed to update customer stats:', err));

    // Return comprehensive stats
    return {
      // Order statistics
      totalOrders: stats.totalOrders,
      completedOrders: stats.completedOrders,
      totalSpent: Number(stats.totalSpent.toFixed(2)),
      averageOrderValue: Number(stats.averageOrderValue.toFixed(2)),
      
      // Rating statistics
      avgRating: Number(avgRating.toFixed(1)),
      totalRatings: stats.totalRatings,
      
      // Customer metrics
      visitCount: customer.visitCount || 0,
      loyaltyPoints: customer.loyaltyPoints || 0,
      loyaltyTier: customer.loyaltyTier || 'bronze',
      
      // Activity
      lastVisit: customer.lastVisit,
      memberSince: customer.createdAt,
      
      // Favorites
      favoriteCount: customer.favorites?.length || 0,
      
      // Cart
      cartItemCount: customer.cart?.length || 0,
    };
  } catch (error) {
    console.error('❌ Get customer stats error:', error);
    throw new Error(`Get stats failed: ${error.message}`);
  }
};

// Update customer stats (called when order is completed)
exports.updateStatsOnOrderComplete = async (customerId, orderAmount, rating = null) => {
  try {
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    customer.totalOrders = (customer.totalOrders || 0) + 1;
    customer.totalSpent = (customer.totalSpent || 0) + orderAmount;
    customer.averageOrderValue = customer.totalSpent / customer.totalOrders;
    
    await customer.save();
    
    return customer;
  } catch (error) {
    throw new Error(`Update stats failed: ${error.message}`);
  }
};

// Add favorite
exports.addFavorite = async (customerId, itemId) => {
  try {
    console.log('➕ Adding favorite:', { customerId, itemId });
    
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Initialize favorites array if needed
    if (!Array.isArray(customer.favorites)) {
      customer.favorites = [];
    }

    // Check if already favorited
    const alreadyFavorited = customer.favorites.some(
      fav => fav.toString() === itemId.toString()
    );

    if (alreadyFavorited) {
      console.log('ℹ️ Item already in favorites');
      return customer;
    }

    customer.favorites.push(itemId);
    await customer.save();
    
    console.log('✅ Favorite added successfully');
    return customer;
  } catch (error) {
    console.error('❌ Add favorite error:', error);
    throw new Error(`Add favorite failed: ${error.message}`);
  }
};

// Remove favorite
exports.removeFavorite = async (customerId, itemId) => {
  try {
    console.log('➖ Removing favorite:', { customerId, itemId });
    
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Initialize favorites array if needed
    if (!Array.isArray(customer.favorites)) {
      customer.favorites = [];
    }

    customer.favorites = customer.favorites.filter(
      id => id.toString() !== itemId.toString()
    );
    await customer.save();
    
    console.log('✅ Favorite removed successfully');
    return customer;
  } catch (error) {
    console.error('❌ Remove favorite error:', error);
    throw new Error(`Remove favorite failed: ${error.message}`);
  }
};

// ============================================
// ✅ Toggle favorite (add or remove)
// ============================================
exports.toggleFavorite = async (customerId, itemId) => {
  try {
    console.log('🔄 Toggling favorite:', { customerId, itemId });
    
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Initialize favorites array if needed
    if (!Array.isArray(customer.favorites)) {
      customer.favorites = [];
    }

    // Check if item is already favorited
    const isFavorited = customer.favorites.some(
      fav => fav.toString() === itemId.toString()
    );

    if (isFavorited) {
      // Remove from favorites
      customer.favorites = customer.favorites.filter(
        id => id.toString() !== itemId.toString()
      );
      await customer.save();
      
      console.log('✅ Removed from favorites');
      return {
        customer,
        action: 'removed',
        isFavorite: false,
        message: 'Removed from favorites'
      };
    } else {
      // Add to favorites
      customer.favorites.push(itemId);
      await customer.save();
      
      console.log('✅ Added to favorites');
      return {
        customer,
        action: 'added',
        isFavorite: true,
        message: 'Added to favorites'
      };
    }
  } catch (error) {
    console.error('❌ Toggle favorite error:', error);
    throw new Error(`Toggle favorite failed: ${error.message}`);
  }
};

// Get recent orders for customer
exports.getRecentOrders = async (customerId, limit = 5) => {
  try {
    const orders = await Order.find({
      customerId,
      status: { $ne: 'cancelled' }
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('orderNumber total items status createdAt')
      .populate('items.menuItemId', 'name image')
      .lean();

    return orders;
  } catch (error) {
    console.error('Get recent orders error:', error);
    return [];
  }
};