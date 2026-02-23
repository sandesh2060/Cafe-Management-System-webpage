// ================================================================
// FILE: backend/src/modules/customer/cart.controller.js
// 🛒 CART MANAGEMENT CONTROLLER
// ================================================================

const Customer = require('./customer.model');
const MenuItem = require('../menu/menu.model');

/**
 * Get customer's cart
 */
exports.getCart = async (req, res) => {
  try {
    const { customerId } = req.params;

    console.log('📥 Get cart request:', customerId);

    if (!customerId || !customerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const customer = await Customer.findById(customerId)
      .populate({
        path: 'cart.menuItemId',
        select: 'name category description price image available badges dietary allergens'
      })
      .select('cart')
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Handle customers created before cart field was added
    const cartArray = customer.cart || [];
    
    // Filter out items where menuItemId is null (deleted items)
    const validCart = cartArray.filter(item => item.menuItemId);

    console.log('✅ Cart retrieved:', validCart.length, 'items');

    res.json({
      success: true,
      cart: validCart,
      message: 'Cart retrieved'
    });
  } catch (error) {
    console.error('❌ Get cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Add item to cart
 */
exports.addItem = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { menuItemId, quantity = 1, customizations = {} } = req.body;

    console.log('➕ Add to cart:', { customerId, menuItemId, quantity });

    // Validate customer ID
    if (!customerId || !customerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    // Validate menu item ID
    if (!menuItemId || !menuItemId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Menu item ID is required'
      });
    }

    // Validate quantity
    if (quantity < 1 || quantity > 99) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 1 and 99'
      });
    }

    // Check if menu item exists and is available
    const menuItem = await MenuItem.findById(menuItemId);
    
    if (!menuItem) {
      console.log('❌ Menu item not found:', menuItemId);
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check availability (use 'available' or 'isAvailable' depending on your schema)
    const isAvailable = menuItem.available !== undefined ? menuItem.available : menuItem.isAvailable;
    
    if (!isAvailable) {
      console.log('❌ Menu item not available:', menuItem.name);
      return res.status(400).json({
        success: false,
        message: 'Menu item is not available'
      });
    }

    // Check status if it exists
    if (menuItem.status && menuItem.status !== 'active') {
      console.log('❌ Menu item not active:', menuItem.name, 'Status:', menuItem.status);
      return res.status(400).json({
        success: false,
        message: 'Menu item is not available'
      });
    }

    console.log('✅ Menu item found and available:', menuItem.name);

    // Get customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Initialize cart array if undefined (for old customers)
    if (!customer.cart) {
      customer.cart = [];
    }

    // Check if item already exists in cart (same item + same customizations)
    const existingItemIndex = customer.cart.findIndex(item =>
      item.menuItemId.toString() === menuItemId &&
      JSON.stringify(item.customizations) === JSON.stringify(customizations)
    );

    if (existingItemIndex > -1) {
      // Update quantity of existing item
      customer.cart[existingItemIndex].quantity += quantity;
      
      // Ensure quantity doesn't exceed 99
      if (customer.cart[existingItemIndex].quantity > 99) {
        customer.cart[existingItemIndex].quantity = 99;
      }
      
      console.log('✅ Updated existing cart item quantity to:', customer.cart[existingItemIndex].quantity);
    } else {
      // Add new item to cart
      customer.cart.push({
        menuItemId,
        quantity,
        customizations,
        addedAt: new Date()
      });
      
      console.log('✅ Added new item to cart');
    }

    await customer.save();

    // Populate and return updated cart
    await customer.populate({
      path: 'cart.menuItemId',
      select: 'name category description price image available badges dietary allergens'
    });

    const validCart = customer.cart.filter(item => item.menuItemId);

    console.log('✅ Cart updated - now has:', validCart.length, 'items');

    res.json({
      success: true,
      cart: validCart,
      message: 'Item added to cart'
    });
  } catch (error) {
    console.error('❌ Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update cart item quantity
 */
exports.updateItem = async (req, res) => {
  try {
    const { customerId, itemId } = req.params;
    const { quantity } = req.body;

    console.log('🔄 Update cart item:', { customerId, itemId, quantity });

    if (!customerId || !customerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    if (!itemId || !itemId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
    }

    if (quantity < 1 || quantity > 99) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 1 and 99'
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const cartItem = customer.cart.id(itemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    cartItem.quantity = quantity;
    await customer.save();

    await customer.populate({
      path: 'cart.menuItemId',
      select: 'name category description price image available badges dietary allergens'
    });

    const validCart = customer.cart.filter(item => item.menuItemId);

    console.log('✅ Cart item updated');

    res.json({
      success: true,
      cart: validCart,
      message: 'Cart item updated'
    });
  } catch (error) {
    console.error('❌ Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Remove item from cart
 */
exports.removeItem = async (req, res) => {
  try {
    const { customerId, itemId } = req.params;

    console.log('➖ Remove from cart:', { customerId, itemId });

    if (!customerId || !customerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    if (!itemId || !itemId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer.cart = customer.cart.filter(item => item._id.toString() !== itemId);
    await customer.save();

    await customer.populate({
      path: 'cart.menuItemId',
      select: 'name category description price image available badges dietary allergens'
    });

    const validCart = customer.cart.filter(item => item.menuItemId);

    console.log('✅ Item removed - cart now has:', validCart.length, 'items');

    res.json({
      success: true,
      cart: validCart,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('❌ Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Clear entire cart
 */
exports.clearCart = async (req, res) => {
  try {
    const { customerId } = req.params;

    console.log('🗑️ Clear cart:', customerId);

    if (!customerId || !customerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer.cart = [];
    await customer.save();

    console.log('✅ Cart cleared');

    res.json({
      success: true,
      cart: [],
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('❌ Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Sync cart (bulk update)
 */
exports.syncCart = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { items } = req.body;

    console.log('🔄 Sync cart:', customerId, items?.length, 'items');

    if (!customerId || !customerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array'
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Validate all menu items exist and are available
    const menuItemIds = items.map(item => item.menuItemId);
    const menuItems = await MenuItem.find({
      _id: { $in: menuItemIds }
    });

    // Check availability
    const availableItems = menuItems.filter(item => {
      const isAvailable = item.available !== undefined ? item.available : item.isAvailable;
      const isActive = !item.status || item.status === 'active';
      return isAvailable && isActive;
    });

    if (availableItems.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: 'Some menu items are not available'
      });
    }

    // Replace cart with new items
    customer.cart = items.map(item => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      customizations: item.customizations || {},
      addedAt: new Date()
    }));

    await customer.save();

    await customer.populate({
      path: 'cart.menuItemId',
      select: 'name category description price image available badges dietary allergens'
    });

    const validCart = customer.cart.filter(item => item.menuItemId);

    console.log('✅ Cart synced');

    res.json({
      success: true,
      cart: validCart,
      message: 'Cart synced'
    });
  } catch (error) {
    console.error('❌ Sync cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Validate cart and calculate totals
 */
exports.validateCart = async (req, res) => {
  try {
    const { customerId } = req.params;

    console.log('✅ Validate cart:', customerId);

    if (!customerId || !customerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      });
    }

    const customer = await Customer.findById(customerId)
      .populate({
        path: 'cart.menuItemId',
        select: 'name category price image available status'
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const invalidItems = [];
    const validCart = [];

    // Validate each item
    for (const item of customer.cart) {
      const isAvailable = item.menuItemId?.available !== undefined ? 
        item.menuItemId.available : item.menuItemId?.isAvailable;
      const isActive = !item.menuItemId?.status || item.menuItemId.status === 'active';
      
      if (!item.menuItemId || !isAvailable || !isActive) {
        invalidItems.push({
          name: item.menuItemId?.name || 'Unknown',
          reason: !item.menuItemId ? 'Deleted' : 'Not available'
        });
      } else {
        validCart.push(item);
      }
    }

    // Update cart if items were removed
    if (invalidItems.length > 0) {
      customer.cart = validCart;
      await customer.save();
    }

    // Calculate totals
    const subtotal = validCart.reduce((sum, item) => {
      return sum + (item.menuItemId.price * item.quantity);
    }, 0);

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    console.log('✅ Cart validated:', {
      validItems: validCart.length,
      invalidItems: invalidItems.length,
      total
    });

    res.json({
      success: true,
      cart: validCart,
      invalidItems,
      isValid: invalidItems.length === 0,
      totals: {
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
        itemCount: validCart.length
      },
      message: 'Cart validated'
    });
  } catch (error) {
    console.error('❌ Validate cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};