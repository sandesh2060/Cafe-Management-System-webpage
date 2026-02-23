const Menu = require('./menu.model');

class MenuService {
  async getAllItems() {
    try {
      const items = await Menu.find({ isAvailable: true }).sort({ category: 1, name: 1 });
      
      // Get unique categories
      const categories = [...new Set(items.map(item => item.category))];
      
      return {
        items,
        categories: categories.map((cat, index) => ({
          id: index + 1,
          name: cat,
          icon: this.getCategoryIcon(cat)
        }))
      };
    } catch (error) {
      throw new Error(`Failed to fetch menu: ${error.message}`);
    }
  }

  getCategoryIcon(category) {
    const icons = {
      'Appetizers': '🥗',
      'Main Course': '🍽️',
      'Desserts': '🍰',
      'Beverages': '☕',
      'Salads': '🥙',
      'Soups': '🍲',
      'Pasta': '🍝',
      'Pizza': '🍕',
      'Burgers': '🍔',
      'Seafood': '🦞'
    };
    return icons[category] || '🍴';
  }

  async getItemById(itemId) {
    const item = await Menu.findById(itemId);
    if (!item) {
      throw new Error('Menu item not found');
    }
    return item;
  }

  async createItem(itemData) {
    const item = new Menu(itemData);
    await item.save();
    return item;
  }

  async updateItem(itemId, itemData) {
    const item = await Menu.findByIdAndUpdate(itemId, itemData, { new: true });
    if (!item) {
      throw new Error('Menu item not found');
    }
    return item;
  }

  async deleteItem(itemId) {
    const item = await Menu.findByIdAndDelete(itemId);
    if (!item) {
      throw new Error('Menu item not found');
    }
    return { message: 'Item deleted successfully' };
  }
}

module.exports = new MenuService();