// File: frontend/src/modules/customer/hooks/useMenu.js
// ✅ FIXED: Handles multiple response formats from backend

import { useState, useEffect, useCallback } from 'react';
import { menuAPI } from '../../../api/endpoints';

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Category icons mapping
  const categoryIcons = {
    'Hot Drinks': '☕',
    'Cold Drinks': '🧊',
    'Pastries': '🥐',
    'Sandwiches': '🥪',
    'Smoothies': '🥤',
    'Desserts': '🍰',
    'Other': '🍽️',
  };

  // Fetch all menu items
  const fetchMenu = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch menu items with filters
      const response = await menuAPI.getAll({
        available: true, // Only show available items
        ...filters,
      });

      console.log('🔍 Raw API Response:', response);

      // ✅ FIX: Handle multiple response formats
      // Response could be: response.data.items, response.items, or response.data.data.items
      const data = response?.data || response;
      const items = data?.items || data?.menuItems || data?.data?.items || [];

      console.log('📦 Extracted items:', items);

      if (Array.isArray(items) && items.length > 0) {
        const transformedItems = items.map(item => {
          // Build badges array from backend data
          const badges = [];
          if (item.popular) badges.push('popular');
          if (item.dietary?.includes('Vegetarian') || item.dietary?.includes('Vegan')) {
            badges.push('veg');
          }
          if (item.allergens?.includes('Spicy')) badges.push('spicy');

          return {
            id: item._id || item.id,
            name: item.name,
            description: item.description || 'Delicious menu item',
            price: item.price,
            image: item.image || '/placeholder-food.jpg',
            category: item.category,
            available: item.available !== false,
            badges: badges,
            rating: item.rating?.average || 4.5,
            reviews: item.rating?.count || 0,
            preparationTime: item.preparationTime || 15,
            allergens: item.allergens || [],
            dietary: item.dietary || [],
            customizations: item.customizations || [],
            calories: item.calories || 0,
            orderCount: item.orderCount || 0,
            originalPrice: item.originalPrice || null,
            
            // For filter compatibility
            isVeg: item.dietary?.includes('Vegetarian') || item.dietary?.includes('Vegan'),
            isSpicy: item.allergens?.includes('Spicy'),
            isPopular: item.popular || false,
          };
        });

        console.log('✅ Transformed Items:', transformedItems.length);
        setMenuItems(transformedItems);
      } else {
        console.warn('⚠️ No items found in response');
        console.warn('Response structure:', JSON.stringify(data, null, 2));
        setMenuItems([]);
      }
    } catch (err) {
      console.error('❌ Fetch menu error:', err);
      setError(err.message || 'Failed to fetch menu items');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch menu categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await menuAPI.getCategories();

      console.log('🔍 Categories Response:', response);

      // ✅ FIX: Handle multiple response formats
      const data = response?.data || response;
      const categoriesData = data?.categories || data?.data?.categories;

      if (categoriesData) {
        let transformedCategories = [];

        if (Array.isArray(categoriesData)) {
          // Array format
          transformedCategories = categoriesData.map(cat => ({
            id: cat._id || cat.id || cat.name,
            name: cat.name,
            icon: categoryIcons[cat.name] || '🍽️',
            count: cat.count || 0,
            description: cat.description || '',
          }));
        } else if (typeof categoriesData === 'object') {
          // Grouped object format: { "Hot Drinks": [...items], "Pastries": [...items] }
          transformedCategories = Object.keys(categoriesData).map(categoryName => ({
            id: categoryName.toLowerCase().replace(/\s+/g, '-'),
            name: categoryName,
            icon: categoryIcons[categoryName] || '🍽️',
            count: categoriesData[categoryName]?.length || 0,
            description: '',
          }));
        }

        console.log('✅ Transformed Categories:', transformedCategories);
        setCategories(transformedCategories);
      } else {
        console.warn('⚠️ Using fallback categories');
        setCategories([
          { id: 'hot-drinks', name: 'Hot Drinks', icon: '☕', count: 0 },
          { id: 'cold-drinks', name: 'Cold Drinks', icon: '🧊', count: 0 },
          { id: 'pastries', name: 'Pastries', icon: '🥐', count: 0 },
          { id: 'sandwiches', name: 'Sandwiches', icon: '🥪', count: 0 },
          { id: 'smoothies', name: 'Smoothies', icon: '🥤', count: 0 },
          { id: 'desserts', name: 'Desserts', icon: '🍰', count: 0 },
        ]);
      }
    } catch (err) {
      console.error('❌ Fetch categories error:', err);
      // Set fallback categories
      setCategories([
        { id: 'hot-drinks', name: 'Hot Drinks', icon: '☕', count: 0 },
        { id: 'cold-drinks', name: 'Cold Drinks', icon: '🧊', count: 0 },
        { id: 'pastries', name: 'Pastries', icon: '🥐', count: 0 },
        { id: 'sandwiches', name: 'Sandwiches', icon: '🥪', count: 0 },
        { id: 'smoothies', name: 'Smoothies', icon: '🥤', count: 0 },
        { id: 'desserts', name: 'Desserts', icon: '🍰', count: 0 },
      ]);
    }
  }, []);

  // Get menu item by ID
  const getMenuItem = useCallback(async (itemId) => {
    try {
      const response = await menuAPI.getById(itemId);
      const data = response?.data || response;
      
      if (data.success && data.menuItem) {
        return data.menuItem;
      }
      return null;
    } catch (err) {
      console.error('Get menu item error:', err);
      return null;
    }
  }, []);

  // Get popular items
  const fetchPopularItems = useCallback(async (limit = 10) => {
    try {
      const response = await menuAPI.getPopular?.(limit);
      const data = response?.data || response;
      
      if (data.success && data.items) {
        return data.items;
      }
      return [];
    } catch (err) {
      console.error('Fetch popular items error:', err);
      return [];
    }
  }, []);

  // Search menu items
  const searchMenu = useCallback(async (query) => {
    if (!query.trim()) {
      await fetchMenu();
      return;
    }

    await fetchMenu({ search: query });
  }, [fetchMenu]);

  // Filter by category
  const filterByCategory = useCallback(async (category) => {
    if (category === 'all') {
      await fetchMenu();
      return;
    }

    await fetchMenu({ category });
  }, [fetchMenu]);

  // Initial load
  useEffect(() => {
    const loadMenuData = async () => {
      await Promise.all([
        fetchMenu(),
        fetchCategories(),
      ]);
    };

    loadMenuData();
  }, [fetchMenu, fetchCategories]);

  return {
    menuItems,
    categories,
    loading,
    error,
    fetchMenu,
    fetchCategories,
    getMenuItem,
    fetchPopularItems,
    searchMenu,
    filterByCategory,
    refetch: fetchMenu,
  };
};

export default useMenu;