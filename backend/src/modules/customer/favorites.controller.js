// ================================================================
// FILE: backend/src/modules/customer/favorites.controller.js
// ⭐ FAVORITES MANAGEMENT CONTROLLER
// ================================================================

const Customer = require('./customer.model');
const MenuItem = require('../menu/menu.model');

/**
 * Get customer's favorites
 */
exports.getFavorites = async (req, res) => {
  try {
    const { customerId } = req.params;

    console.log('⭐ Get favorites request:', customerId);

    if (!customerId || !customerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const customer = await Customer.findById(customerId)
      .populate({
        path: 'favorites',
        select: 'name category description price image available badges dietary allergens rating'
      })
      .select('favorites')
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Handle customers created before favorites field was added
    const favoritesArray = customer.favorites || [];
    
    // Filter out deleted items
    const validFavorites = favoritesArray.filter(item => item && item._id);

    console.log('✅ Favorites retrieved:', validFavorites.length, 'items');

    res.json({
      success: true,
      favorites: validFavorites,
      count: validFavorites.length,
      message: 'Favorites retrieved'
    });
  } catch (error) {
    console.error('❌ Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Add item to favorites
 */
exports.addFavorite = async (req, res) => {
  try {
    const { customerId, menuItemId } = req.params;

    console.log('➕ Add favorite:', { customerId, menuItemId });

    if (!customerId || !customerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    if (!menuItemId || !menuItemId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID'
      });
    }

    // Verify menu item exists
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Initialize favorites array if undefined (for old customers)
    if (!customer.favorites) {
      customer.favorites = [];
    }

    // Check if already in favorites
    if (customer.favorites.includes(menuItemId)) {
      return res.status(400).json({
        success: false,
        message: 'Item already in favorites'
      });
    }

    // Add to favorites
    customer.favorites.push(menuItemId);
    await customer.save();

    await customer.populate({
      path: 'favorites',
      select: 'name category description price image available badges dietary allergens rating'
    });

    const validFavorites = customer.favorites.filter(item => item && item._id);

    console.log('✅ Favorite added - now has:', validFavorites.length, 'favorites');

    res.json({
      success: true,
      favorites: validFavorites,
      count: validFavorites.length,
      message: 'Added to favorites'
    });
  } catch (error) {
    console.error('❌ Add favorite error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Remove item from favorites
 */
exports.removeFavorite = async (req, res) => {
  try {
    const { customerId, menuItemId } = req.params;

    console.log('➖ Remove favorite:', { customerId, menuItemId });

    if (!customerId || !customerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    if (!menuItemId || !menuItemId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID'
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Initialize favorites array if undefined (for old customers)
    if (!customer.favorites) {
      customer.favorites = [];
    }

    // Remove from favorites
    customer.favorites = customer.favorites.filter(
      id => id.toString() !== menuItemId
    );
    await customer.save();

    await customer.populate({
      path: 'favorites',
      select: 'name category description price image available badges dietary allergens rating'
    });

    const validFavorites = customer.favorites.filter(item => item && item._id);

    console.log('✅ Favorite removed - now has:', validFavorites.length, 'favorites');

    res.json({
      success: true,
      favorites: validFavorites,
      count: validFavorites.length,
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('❌ Remove favorite error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Toggle favorite status
 */
exports.toggleFavorite = async (req, res) => {
  try {
    const { customerId, menuItemId } = req.params;

    console.log('🔄 Toggle favorite:', { customerId, menuItemId });

    if (!customerId || !customerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    if (!menuItemId || !menuItemId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID'
      });
    }

    // Verify menu item exists
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Initialize favorites array if undefined (for old customers)
    if (!customer.favorites) {
      customer.favorites = [];
    }

    // Toggle
    const isFavorite = customer.favorites.includes(menuItemId);
    
    if (isFavorite) {
      // Remove
      customer.favorites = customer.favorites.filter(
        id => id.toString() !== menuItemId
      );
    } else {
      // Add
      customer.favorites.push(menuItemId);
    }

    await customer.save();

    await customer.populate({
      path: 'favorites',
      select: 'name category description price image available badges dietary allergens rating'
    });

    const validFavorites = customer.favorites.filter(item => item && item._id);

    console.log('✅ Favorite toggled - now has:', validFavorites.length, 'favorites');

    res.json({
      success: true,
      favorites: validFavorites,
      count: validFavorites.length,
      isFavorite: !isFavorite,
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites'
    });
  } catch (error) {
    console.error('❌ Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};