const MenuItem = require('./menu.model');

// Demo menu data for when database is empty
const DEMO_MENU = [
  // Hot Drinks
  { name: 'Espresso', category: 'Hot Drinks', price: 3.50, description: 'Rich and bold espresso shot', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400', available: true, popular: true },
  { name: 'Cappuccino', category: 'Hot Drinks', price: 4.50, description: 'Espresso with steamed milk and foam', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', available: true, popular: true },
  { name: 'Latte', category: 'Hot Drinks', price: 4.75, description: 'Smooth espresso with steamed milk', image: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400', available: true, popular: true },
  { name: 'Americano', category: 'Hot Drinks', price: 3.75, description: 'Espresso with hot water', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400', available: true },
  { name: 'Mocha', category: 'Hot Drinks', price: 5.25, description: 'Espresso with chocolate and steamed milk', image: 'https://images.unsplash.com/photo-1578374173704-14603a2ecb7d?w=400', available: true },
  
  // Cold Drinks
  { name: 'Iced Coffee', category: 'Cold Drinks', price: 4.25, description: 'Chilled coffee over ice', image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400', available: true, popular: true },
  { name: 'Cold Brew', category: 'Cold Drinks', price: 4.75, description: 'Smooth cold-brewed coffee', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', available: true },
  { name: 'Iced Latte', category: 'Cold Drinks', price: 5.00, description: 'Espresso with cold milk over ice', image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400', available: true },
  { name: 'Frappe', category: 'Cold Drinks', price: 5.50, description: 'Blended iced coffee drink', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', available: true },
  
  // Pastries
  { name: 'Croissant', category: 'Pastries', price: 3.50, description: 'Buttery flaky croissant', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', available: true, popular: true },
  { name: 'Blueberry Muffin', category: 'Pastries', price: 4.00, description: 'Fresh baked muffin with blueberries', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400', available: true },
  { name: 'Chocolate Chip Cookie', category: 'Pastries', price: 2.75, description: 'Classic chocolate chip cookie', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', available: true },
  { name: 'Cinnamon Roll', category: 'Pastries', price: 4.50, description: 'Sweet cinnamon roll with icing', image: 'https://images.unsplash.com/photo-1557019167-001d0c7a1db6?w=400', available: true },
  
  // Sandwiches
  { name: 'Turkey & Cheese', category: 'Sandwiches', price: 7.50, description: 'Turkey with cheese on whole wheat', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', available: true },
  { name: 'Veggie Wrap', category: 'Sandwiches', price: 6.75, description: 'Fresh vegetables in a wrap', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400', available: true, popular: true },
  { name: 'Ham & Swiss', category: 'Sandwiches', price: 7.25, description: 'Ham with Swiss cheese', image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400', available: true },
  
  // Smoothies
  { name: 'Berry Blast', category: 'Smoothies', price: 6.00, description: 'Mixed berries smoothie', image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400', available: true, popular: true },
  { name: 'Mango Paradise', category: 'Smoothies', price: 6.25, description: 'Tropical mango smoothie', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', available: true },
  { name: 'Green Machine', category: 'Smoothies', price: 6.50, description: 'Healthy green smoothie', image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400', available: true }
];

// Get all menu items with filters
exports.getAllMenuItems = async (filters = {}, options = {}) => {
  try {
    const { category, available, search } = filters;
    const { page = 1, limit = 50 } = options;

    let query = {};

    if (category) query.category = category;
    if (available !== undefined) query.available = available;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const items = await MenuItem.find(query)
      .select('-__v')
      .sort({ category: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await MenuItem.countDocuments(query);

    // If no items in database, return demo data
    if (items.length === 0 && !search && !category) {
      console.log('📋 Using demo menu data (database empty)');
      return {
        items: DEMO_MENU,
        total: DEMO_MENU.length,
        page: 1,
        pages: 1,
        hasMore: false
      };
    }

    return {
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
      hasMore: skip + items.length < total
    };
  } catch (error) {
    console.error('Get all menu items error:', error);
    // Return demo data on error
    return {
      items: DEMO_MENU,
      total: DEMO_MENU.length,
      page: 1,
      pages: 1,
      hasMore: false
    };
  }
};

// Get menu item by ID
exports.getMenuItemById = async (id) => {
  return await MenuItem.findById(id).select('-__v').lean();
};

// Get menu grouped by category
exports.getMenuByCategory = async () => {
  try {
    const items = await MenuItem.find({ available: true })
      .select('-__v')
      .sort({ category: 1, name: 1 })
      .lean();

    // If no items, return demo data grouped by category
    if (items.length === 0) {
      const grouped = {};
      DEMO_MENU.forEach(item => {
        if (!grouped[item.category]) {
          grouped[item.category] = [];
        }
        grouped[item.category].push(item);
      });
      return grouped;
    }

    // Group by category
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return grouped;
  } catch (error) {
    console.error('Get menu by category error:', error);
    // Return demo data on error
    const grouped = {};
    DEMO_MENU.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }
};

// Create menu item
exports.createMenuItem = async (data) => {
  const menuItem = await MenuItem.create(data);
  return menuItem.toObject();
};

// Update menu item
exports.updateMenuItem = async (id, data) => {
  const menuItem = await MenuItem.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).select('-__v').lean();
  
  return menuItem;
};

// Delete menu item
exports.deleteMenuItem = async (id) => {
  const result = await MenuItem.findByIdAndDelete(id);
  return !!result;
};

// Toggle availability
exports.toggleAvailability = async (id, available) => {
  const menuItem = await MenuItem.findByIdAndUpdate(
    id,
    { available },
    { new: true }
  ).select('-__v').lean();
  
  return menuItem;
};

// Get popular items
exports.getPopularItems = async (limit = 10) => {
  try {
    const items = await MenuItem.find({ available: true, popular: true })
      .select('-__v')
      .limit(limit)
      .lean();

    // If no items, return demo popular items
    if (items.length === 0) {
      return DEMO_MENU.filter(item => item.popular).slice(0, limit);
    }

    return items;
  } catch (error) {
    return DEMO_MENU.filter(item => item.popular).slice(0, limit);
  }
};