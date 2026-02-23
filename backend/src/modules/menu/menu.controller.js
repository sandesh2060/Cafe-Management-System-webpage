// File: backend/src/modules/menu/menu.controller.js
// ✅ FIXED: Correct response format matching frontend expectations

const menuService = require('./menu.service');
const { successResponse, errorResponse } = require('../../shared/utils/response');

class MenuController {
  /**
   * Get all menu items (with filtering and pagination)
   * @route GET /api/menu
   */
  async getAllMenuItems(req, res) {
    try {
      const { category, available, search, page = 1, limit = 50 } = req.query;

      console.log('📥 Get menu items request:', { category, available, search, page, limit });

      const filters = {};
      if (category) filters.category = category;
      if (available !== undefined) filters.available = available === 'true';
      if (search) filters.search = search;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await menuService.getAllMenuItems(filters, options);

      console.log('✅ Menu items retrieved:', result.items?.length || 0);

      // ✅ FIX: Return items directly at top level for frontend
      return res.status(200).json({
        success: true,
        items: result.items || result.menuItems || [],
        total: result.total || 0,
        page: result.page || 1,
        totalPages: result.totalPages || 1,
        message: 'Menu items retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Get menu items error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get menu item by ID
   * @route GET /api/menu/:id
   */
  async getMenuItemById(req, res) {
    try {
      const { id } = req.params;

      console.log('📥 Get menu item by ID:', id);

      const menuItem = await menuService.getMenuItemById(id);

      if (!menuItem) {
        return errorResponse(res, 'Menu item not found', 404);
      }

      console.log('✅ Menu item retrieved:', menuItem.name);

      return successResponse(res, { menuItem }, 'Menu item retrieved successfully');
    } catch (error) {
      console.error('❌ Get menu item error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get menu categories
   * @route GET /api/menu/categories
   */
  async getMenuByCategory(req, res) {
    try {
      console.log('📥 Get menu categories request');

      const categories = await menuService.getMenuByCategory();

      console.log('✅ Categories retrieved:', categories ? Object.keys(categories).length : 0);

      // ✅ FIX: Return categories directly at top level
      return res.status(200).json({
        success: true,
        categories: categories || {},
        message: 'Menu categories retrieved successfully'
      });
    } catch (error) {
      console.error('❌ Get menu by category error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Create new menu item (Admin only)
   * @route POST /api/menu
   */
  async createMenuItem(req, res) {
    try {
      const menuItemData = req.body;

      console.log('📝 Create menu item:', menuItemData.name);

      const menuItem = await menuService.createMenuItem(menuItemData);

      console.log('✅ Menu item created:', menuItem.name);

      return successResponse(res, { menuItem }, 'Menu item created successfully', 201);
    } catch (error) {
      console.error('❌ Create menu item error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Update menu item (Admin only)
   * @route PUT /api/menu/:id
   */
  async updateMenuItem(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      console.log('✏️ Update menu item:', id);

      const menuItem = await menuService.updateMenuItem(id, updateData);

      if (!menuItem) {
        return errorResponse(res, 'Menu item not found', 404);
      }

      console.log('✅ Menu item updated:', menuItem.name);

      return successResponse(res, { menuItem }, 'Menu item updated successfully');
    } catch (error) {
      console.error('❌ Update menu item error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Delete menu item (Admin only)
   * @route DELETE /api/menu/:id
   */
  async deleteMenuItem(req, res) {
    try {
      const { id } = req.params;

      console.log('🗑️ Delete menu item:', id);

      const deleted = await menuService.deleteMenuItem(id);

      if (!deleted) {
        return errorResponse(res, 'Menu item not found', 404);
      }

      console.log('✅ Menu item deleted');

      return successResponse(res, null, 'Menu item deleted successfully');
    } catch (error) {
      console.error('❌ Delete menu item error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Toggle menu item availability (Admin only)
   * @route PATCH /api/menu/:id/availability
   */
  async toggleAvailability(req, res) {
    try {
      const { id } = req.params;
      const { available } = req.body;

      console.log('🔄 Toggle availability:', id, available);

      const menuItem = await menuService.toggleAvailability(id, available);

      if (!menuItem) {
        return errorResponse(res, 'Menu item not found', 404);
      }

      console.log('✅ Availability updated:', menuItem.available);

      return successResponse(res, { menuItem }, 'Menu item availability updated');
    } catch (error) {
      console.error('❌ Toggle availability error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get popular items
   * @route GET /api/menu/popular
   */
  async getPopularItems(req, res) {
    try {
      const { limit = 10 } = req.query;

      console.log('📥 Get popular items, limit:', limit);

      const items = await menuService.getPopularItems(parseInt(limit));

      console.log('✅ Popular items retrieved:', items.length);

      return successResponse(res, { items }, 'Popular items retrieved successfully');
    } catch (error) {
      console.error('❌ Get popular items error:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Search menu items
   * @route GET /api/menu/search
   */
  async searchMenuItems(req, res) {
    try {
      const { query, category, available = true } = req.query;

      console.log('🔍 Search menu items:', { query, category, available });

      if (!query || query.trim().length < 2) {
        return errorResponse(res, 'Search query must be at least 2 characters', 400);
      }

      const filters = {
        search: query.trim(),
        available: available === 'true'
      };

      if (category) filters.category = category;

      const result = await menuService.getAllMenuItems(filters, { page: 1, limit: 50 });

      console.log('✅ Search results:', result.items?.length || 0);

      return res.status(200).json({
        success: true,
        items: result.items || [],
        total: result.total || 0,
        message: 'Search completed successfully'
      });
    } catch (error) {
      console.error('❌ Search menu items error:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new MenuController();