// File: backend/src/modules/recommendations/recommendations.service.js
// 🚀 ENHANCED AI RECOMMENDATION ENGINE
// ✅ Weather-based recommendations
// ✅ User favorites integration
// ✅ Order history analysis
// ✅ Smart personalization
// 🔧 FIXED: Schema compatibility with your database

const Order = require('../order/order.model');
const MenuItem = require('../menu/menu.model');
const OrderItem = require('../order/orderItem.model');
const Customer = require('../customer/customer.model');
const axios = require('axios');

class RecommendationsService {
  
  // ============================================
  // 🌤️ WEATHER-BASED RECOMMENDATIONS
  // ============================================
  
  /**
   * Get weather-aware recommendations
   * Integrates weather data to suggest appropriate items
   */
  async getWeatherBasedRecommendations(lat, lon, limit = 5) {
    try {
      const weather = await this.fetchWeatherData(lat, lon);
      const weatherCondition = this.categorizeWeather(weather);
      
      console.log(`🌤️ Weather: ${weatherCondition}, Temp: ${weather.temp}°C`);
      
      // Get items suitable for current weather
      const categories = this.getCategoriesForWeather(weatherCondition, weather.temp);
      const keywords = this.getKeywordsForWeather(weatherCondition, weather.temp);
      
      // ✅ FIX: Use 'available' instead of 'isAvailable'
      const items = await MenuItem.find({
        $or: [
          { category: { $in: categories } },
          { name: { $regex: keywords.join('|'), $options: 'i' } },
          { description: { $regex: keywords.join('|'), $options: 'i' } }
        ],
        available: { $ne: false } // ✅ FIXED: Schema compatibility
      })
        .sort({ 'rating.average': -1, orderCount: -1 }) // ✅ FIXED: rating is an object
        .limit(limit)
        .lean();
      
      return items.map(item => ({
        ...item,
        recommendationReason: this.getWeatherRecommendationReason(weatherCondition, weather.temp),
        weatherMatch: true,
        weather: {
          condition: weatherCondition,
          temp: weather.temp,
          emoji: this.getWeatherEmoji(weatherCondition)
        }
      }));
    } catch (error) {
      console.error('❌ Weather-based recommendations error:', error);
      return [];
    }
  }
  
  /**
   * Fetch weather data from OpenWeatherMap
   */
  async fetchWeatherData(lat, lon) {
    try {
      const apiKey = process.env.OPENWEATHER_API_KEY || '7e67097a8ebe8dc17084f99bdc33e595';
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      
      const response = await axios.get(url);
      const data = response.data;
      
      return {
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main.toLowerCase(),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed
      };
    } catch (error) {
      console.error('❌ Weather API error:', error);
      return {
        temp: 20,
        condition: 'clear',
        description: 'clear sky'
      };
    }
  }
  
  /**
   * Categorize weather into actionable types
   */
  categorizeWeather(weather) {
    const { condition, temp } = weather;
    
    if (temp < 10) return 'cold';
    if (temp > 30) return 'hot';
    if (condition.includes('rain') || condition.includes('drizzle')) return 'rainy';
    if (condition.includes('snow')) return 'snowy';
    if (condition.includes('cloud')) return 'cloudy';
    if (condition.includes('clear')) return 'sunny';
    
    return 'moderate';
  }
  
  /**
   * Get food categories suitable for weather
   */
  getCategoriesForWeather(weatherCondition, temp) {
    const weatherMap = {
      'cold': ['Hot Drinks', 'Soup', 'Comfort Food', 'Beverages', 'Pastries'],
      'hot': ['Cold Drinks', 'Ice Cream', 'Salads', 'Smoothies', 'Desserts'],
      'rainy': ['Hot Drinks', 'Soup', 'Comfort Food', 'Snacks', 'Pastries'],
      'snowy': ['Hot Drinks', 'Soup', 'Comfort Food', 'Desserts'],
      'sunny': ['Cold Drinks', 'Salads', 'Ice Cream', 'Smoothies'],
      'cloudy': ['Beverages', 'Snacks', 'Comfort Food', 'Sandwiches'],
      'moderate': ['Beverages', 'Sandwiches', 'Desserts']
    };
    
    return weatherMap[weatherCondition] || ['Beverages', 'Snacks'];
  }
  
  /**
   * Get search keywords for weather
   */
  getKeywordsForWeather(weatherCondition, temp) {
    const keywordMap = {
      'cold': ['hot', 'warm', 'soup', 'coffee', 'tea', 'chocolate', 'steaming'],
      'hot': ['cold', 'iced', 'frozen', 'chilled', 'ice cream', 'refreshing', 'cool'],
      'rainy': ['comfort', 'hot', 'warm', 'soup', 'cozy', 'tea', 'coffee'],
      'snowy': ['hot chocolate', 'warm', 'soup', 'comfort', 'steaming'],
      'sunny': ['fresh', 'light', 'salad', 'iced', 'smoothie', 'refreshing'],
      'cloudy': ['comfort', 'warm', 'cozy'],
      'moderate': []
    };
    
    return keywordMap[weatherCondition] || [];
  }
  
  /**
   * Get recommendation reason based on weather
   */
  getWeatherRecommendationReason(weatherCondition, temp) {
    const reasonMap = {
      'cold': `☃️ Perfect for cold weather (${temp}°C)`,
      'hot': `☀️ Refreshing choice for hot day (${temp}°C)`,
      'rainy': `🌧️ Cozy comfort for rainy weather`,
      'snowy': `❄️ Warm up with this on a snowy day`,
      'sunny': `🌞 Light and fresh for sunny weather`,
      'cloudy': `☁️ Perfect for cloudy weather`,
      'moderate': `🌤️ Great choice for today's weather`
    };
    
    return reasonMap[weatherCondition] || '🌤️ Great choice for today';
  }
  
  /**
   * Get weather emoji
   */
  getWeatherEmoji(weatherCondition) {
    const emojiMap = {
      'cold': '🥶',
      'hot': '🥵',
      'rainy': '🌧️',
      'snowy': '❄️',
      'sunny': '☀️',
      'cloudy': '☁️',
      'moderate': '🌤️'
    };
    
    return emojiMap[weatherCondition] || '🌤️';
  }
  
  // ============================================
  // ❤️ ENHANCED PERSONALIZED RECOMMENDATIONS
  // ============================================
  
  /**
   * Get super-personalized recommendations
   * Combines: order history + favorites + weather + time + trending
   */
  async getSuperPersonalizedRecommendations(customerId, lat, lon, limit = 10) {
    try {
      console.log(`🎯 Generating super-personalized recommendations for ${customerId}`);
      
      // 1. Get user data
      const [userOrders, customer, weather] = await Promise.all([
        this.getUserOrderHistory(customerId, 50),
        Customer.findById(customerId).populate('favorites'),
        lat && lon ? this.fetchWeatherData(lat, lon) : null
      ]);
      
      if (!userOrders || userOrders.length === 0) {
        console.log('📝 New user - returning curated items');
        return this.getCuratedNewUserRecommendations(weather, limit);
      }
      
      // 2. Analyze user preferences
      const userProfile = await this.buildUserProfile(customerId, userOrders, customer);
      
      console.log('📊 User profile:', {
        favoriteCategories: userProfile.favoriteCategories,
        favoriteItems: userProfile.favoriteItemIds.length,
        avgOrderValue: userProfile.avgOrderValue,
        preferredTime: userProfile.preferredTimeOfDay
      });
      
      // 3. Score all available items
      // ✅ FIX: Use 'available' field
      const allItems = await MenuItem.find({ 
        available: { $ne: false } 
      }).lean();
      
      const scoredItems = [];
      
      for (const item of allItems) {
        // Skip if user ordered this recently (last 3 orders)
        if (userProfile.recentItemIds.has(item._id.toString())) {
          continue;
        }
        
        let score = 0;
        let reasons = [];
        
        // Category preference score (30 points)
        if (userProfile.favoriteCategories.includes(item.category)) {
          score += 30;
          reasons.push(`❤️ You love ${item.category}`);
        }
        
        // Weather match score (25 points)
        if (weather) {
          const weatherCondition = this.categorizeWeather(weather);
          const weatherCategories = this.getCategoriesForWeather(weatherCondition, weather.temp);
          if (weatherCategories.includes(item.category)) {
            score += 25;
            reasons.push(this.getWeatherRecommendationReason(weatherCondition, weather.temp));
          }
        }
        
        // Time of day match (20 points)
        const currentHour = new Date().getHours();
        const timeOfDay = this.getTimeOfDay(currentHour);
        const timeCategories = this.getCategoriesForTimeOfDay(timeOfDay);
        if (timeCategories.includes(item.category)) {
          score += 20;
          reasons.push(`⏰ Perfect for ${timeOfDay.toLowerCase()}`);
        }
        
        // Similar to favorites (15 points)
        if (userProfile.favoriteItemIds.length > 0) {
          const isSimilarToFavorite = await this.isSimilarToUserFavorites(
            item,
            userProfile.favoriteItemIds,
            allItems
          );
          if (isSimilarToFavorite) {
            score += 15;
            reasons.push('⭐ Similar to your favorites');
          }
        }
        
        // Popularity score (10 points)
        const popularityScore = Math.min(10, (item.orderCount || 0) / 10);
        score += popularityScore;
        if (popularityScore > 5) {
          reasons.push('🔥 Trending item');
        }
        
        // ✅ FIX: Rating is an object with 'average' field
        const ratingScore = ((item.rating?.average || 0) / 5) * 10;
        score += ratingScore;
        
        // Price match score (5 points)
        if (item.price >= userProfile.avgOrderValue * 0.7 && 
            item.price <= userProfile.avgOrderValue * 1.3) {
          score += 5;
        }
        
        // New item discovery bonus (5 points for new users)
        if (userOrders.length < 5 && this.isNewItem(item.createdAt, 30)) {
          score += 5;
          reasons.push('✨ New addition');
        }
        
        if (score > 10) { // Only include items with meaningful scores
          scoredItems.push({
            ...item,
            recommendationScore: score,
            recommendationReason: reasons[0] || 'Recommended for you',
            recommendationReasons: reasons,
            isFavorite: userProfile.favoriteItemIds.includes(item._id.toString()),
            isNew: this.isNewItem(item.createdAt, 14),
            weather: weather ? {
              condition: this.categorizeWeather(weather),
              temp: weather.temp,
              emoji: this.getWeatherEmoji(this.categorizeWeather(weather))
            } : null
          });
        }
      }
      
      // 4. Sort by score and return top items
      const recommendations = scoredItems
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit);
      
      console.log(`✅ Generated ${recommendations.length} personalized recommendations`);
      
      return recommendations;
      
    } catch (error) {
      console.error('❌ Super-personalized recommendations error:', error);
      throw error;
    }
  }
  
  /**
   * Build comprehensive user profile
   */
  async buildUserProfile(customerId, userOrders, customer) {
    const profile = {
      favoriteCategories: [],
      favoriteItemIds: [],
      recentItemIds: new Set(),
      avgOrderValue: 0,
      preferredTimeOfDay: 'lunch',
      orderCount: userOrders.length
    };
    
    // Extract item IDs and categories
    const categoryCount = new Map();
    const itemCount = new Map();
    let totalValue = 0;
    const orderTimes = [];
    
    userOrders.forEach((order, index) => {
      totalValue += order.totalAmount || order.total || 0; // ✅ FIX: Handle both field names
      orderTimes.push(new Date(order.createdAt).getHours());
      
      // Track recent items (last 3 orders)
      if (index < 3) {
        order.items?.forEach(item => {
          // ✅ FIX: Handle populated and non-populated items
          const itemId = item.menuItem?._id || item.menuItem;
          if (itemId) {
            profile.recentItemIds.add(itemId.toString());
          }
        });
      }
      
      // Count categories and items
      order.items?.forEach(item => {
        const menuItem = item.menuItem?._id ? item.menuItem : null;
        if (menuItem) {
          const category = menuItem.category;
          const itemId = menuItem._id.toString();
          
          if (category) {
            categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
          }
          itemCount.set(itemId, (itemCount.get(itemId) || 0) + 1);
        }
      });
    });
    
    // Get top categories
    profile.favoriteCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
    
    // Get favorite items (ordered 2+ times)
    profile.favoriteItemIds = Array.from(itemCount.entries())
      .filter(([_, count]) => count >= 2)
      .map(([itemId]) => itemId);
    
    // Add customer favorites
    if (customer?.favorites) {
      customer.favorites.forEach(fav => {
        const favId = fav._id?.toString() || fav.toString();
        if (!profile.favoriteItemIds.includes(favId)) {
          profile.favoriteItemIds.push(favId);
        }
      });
    }
    
    // Calculate average order value
    profile.avgOrderValue = userOrders.length > 0 
      ? totalValue / userOrders.length 
      : 10;
    
    // Determine preferred time of day
    if (orderTimes.length > 0) {
      const avgHour = orderTimes.reduce((a, b) => a + b, 0) / orderTimes.length;
      profile.preferredTimeOfDay = this.getTimeOfDay(Math.round(avgHour));
    }
    
    return profile;
  }
  
  /**
   * Check if item is similar to user favorites
   */
  async isSimilarToUserFavorites(item, favoriteItemIds, allItems) {
    // Find favorite items
    const favoriteItems = allItems.filter(i => 
      favoriteItemIds.includes(i._id.toString())
    );
    
    // Check if any favorite is in the same category
    return favoriteItems.some(fav => fav.category === item.category);
  }
  
  /**
   * Get curated recommendations for new users
   */
  async getCuratedNewUserRecommendations(weather, limit) {
    const currentHour = new Date().getHours();
    const timeCategories = this.getCategoriesForTimeOfDay(this.getTimeOfDay(currentHour));
    
    let categories = timeCategories;
    
    // Add weather-appropriate categories
    if (weather) {
      const weatherCondition = this.categorizeWeather(weather);
      const weatherCategories = this.getCategoriesForWeather(weatherCondition, weather.temp);
      categories = [...new Set([...categories, ...weatherCategories])];
    }
    
    // ✅ FIX: Use 'available' field
    const items = await MenuItem.find({
      category: { $in: categories },
      available: { $ne: false }
    })
      .sort({ 'rating.average': -1, orderCount: -1 }) // ✅ FIXED: rating object
      .limit(limit)
      .lean();
    
    return items.map(item => ({
      ...item,
      recommendationReason: '⭐ Popular choice',
      isNew: this.isNewItem(item.createdAt, 30),
      weather: weather ? {
        condition: this.categorizeWeather(weather),
        temp: weather.temp,
        emoji: this.getWeatherEmoji(this.categorizeWeather(weather))
      } : null
    }));
  }
  
  // ============================================
  // 📊 HELPER FUNCTIONS
  // ============================================
  
  /**
   * Get user's order history
   */
  async getUserOrderHistory(customerId, limit = 50) {
    try {
      // ✅ FIX: Use correct field name 'customer' instead of 'customerId'
      return await Order.find({ customer: customerId })
        .populate('items.menuItem') // ✅ FIXED: Populate menuItem in items array
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('Error getting user order history:', error);
      return [];
    }
  }
  
  /**
   * Get trending items based on recent orders
   */
  async getTrendingItems(limit = 10, timeframe = '7d') {
    try {
      const days = parseInt(timeframe.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Simple aggregation to count orders
      const recentOrders = await Order.find({
        createdAt: { $gte: startDate }
      }).populate('items.menuItem').lean();
      
      // Count item occurrences
      const itemCounts = new Map();
      
      recentOrders.forEach(order => {
        order.items?.forEach(item => {
          if (item.menuItem) {
            const id = item.menuItem._id.toString();
            const currentCount = itemCounts.get(id) || { item: item.menuItem, count: 0 };
            currentCount.count += item.quantity || 1;
            itemCounts.set(id, currentCount);
          }
        });
      });
      
      // Sort and get top items
      const trending = Array.from(itemCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
      
      return trending.map(({ item, count }) => ({
        ...item,
        orderCount: count,
        recommendationReason: `🔥 Ordered ${count} times this ${timeframe === '1d' ? 'day' : timeframe === '7d' ? 'week' : 'month'}`,
        isNew: this.isNewItem(item.createdAt, 14)
      }));
    } catch (error) {
      console.error('Error getting trending items:', error);
      // Fallback to popular items
      return await MenuItem.find({ available: { $ne: false } })
        .sort({ orderCount: -1 })
        .limit(limit)
        .lean();
    }
  }

  /**
   * Get complementary items based on cart
   */
  async getComplementaryItems(cartItems, limit = 5) {
    try {
      const cartItemIds = cartItems.map(item => item._id || item.menuItem);

      // Find orders that contain any of the cart items
      const ordersWithCartItems = await Order.find({
        'items.menuItem': { $in: cartItemIds }
      }).populate('items.menuItem').limit(100);

      // Count frequency of other items in these orders
      const itemFrequency = new Map();

      for (const order of ordersWithCartItems) {
        for (const item of order.items) {
          const itemId = item.menuItem?._id?.toString();
          if (itemId && !cartItemIds.includes(itemId)) {
            itemFrequency.set(itemId, (itemFrequency.get(itemId) || 0) + 1);
          }
        }
      }

      // Sort by frequency and get top items
      const sortedItems = Array.from(itemFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([itemId]) => itemId);

      // Fetch menu item details
      const complementaryItems = await MenuItem.find({
        _id: { $in: sortedItems },
        available: { $ne: false }
      }).lean();

      return complementaryItems.map(item => ({
        ...item,
        recommendationReason: 'Often ordered together'
      }));
    } catch (error) {
      console.error('Error getting complementary items:', error);
      return [];
    }
  }

  /**
   * Get items frequently ordered together
   */
  async getFrequentlyOrderedTogether(menuItemId, limit = 5) {
    try {
      // Find orders containing this item
      const orders = await Order.find({
        'items.menuItem': menuItemId
      }).populate('items.menuItem').limit(200);

      // Count co-occurrences
      const coOccurrence = new Map();

      for (const order of orders) {
        for (const item of order.items) {
          const itemId = item.menuItem?._id?.toString();
          if (itemId && itemId !== menuItemId.toString()) {
            coOccurrence.set(itemId, (coOccurrence.get(itemId) || 0) + 1);
          }
        }
      }

      // Get top items
      const topItems = Array.from(coOccurrence.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([itemId, count]) => ({ itemId, count }));

      // Fetch details
      const items = await MenuItem.find({
        _id: { $in: topItems.map(t => t.itemId) },
        available: { $ne: false }
      }).lean();

      return items.map(item => {
        const matchData = topItems.find(t => t.itemId === item._id.toString());
        return {
          ...item,
          recommendationReason: `Ordered together ${matchData?.count || 0} times`
        };
      });
    } catch (error) {
      console.error('Error getting frequently ordered together items:', error);
      return [];
    }
  }

  /**
   * Get time-based recommendations
   */
  async getTimeBasedRecommendations(currentHour, limit = 10) {
    try {
      const timeOfDay = this.getTimeOfDay(currentHour);
      const categories = this.getCategoriesForTimeOfDay(timeOfDay);

      // ✅ FIX: Use 'available' field
      const items = await MenuItem.find({
        category: { $in: categories },
        available: { $ne: false }
      })
        .sort({ 'rating.average': -1, orderCount: -1 })
        .limit(limit)
        .lean();

      return items.map(item => ({
        ...item,
        recommendationReason: `⏰ Perfect for ${timeOfDay.toLowerCase()}`
      }));
    } catch (error) {
      console.error('Error getting time-based recommendations:', error);
      throw error;
    }
  }

  /**
   * Helper: Get time of day
   */
  getTimeOfDay(hour) {
    if (hour >= 5 && hour < 11) return 'Breakfast';
    if (hour >= 11 && hour < 15) return 'Lunch';
    if (hour >= 15 && hour < 18) return 'Snack Time';
    if (hour >= 18 && hour < 22) return 'Dinner';
    return 'Late Night';
  }

  /**
   * Helper: Get categories for time of day
   */
  getCategoriesForTimeOfDay(timeOfDay) {
    const categoryMap = {
      'Breakfast': ['Breakfast', 'Beverages', 'Pastries', 'Hot Drinks'],
      'Lunch': ['Sandwiches', 'Salads', 'Beverages', 'Hot Drinks'],
      'Snack Time': ['Snacks', 'Desserts', 'Cold Drinks', 'Hot Drinks'],
      'Dinner': ['Sandwiches', 'Soup', 'Beverages', 'Desserts'],
      'Late Night': ['Snacks', 'Cold Drinks', 'Desserts']
    };
    return categoryMap[timeOfDay] || ['Beverages', 'Snacks'];
  }

  /**
   * Track item view
   */
  async trackItemView(userId, menuItemId) {
    try {
      await MenuItem.findByIdAndUpdate(menuItemId, {
        $inc: { viewCount: 1 }
      });
      console.log(`👁️ Tracked view: User ${userId || 'anonymous'} viewed item ${menuItemId}`);
    } catch (error) {
      console.error('Error tracking item view:', error);
    }
  }

  /**
   * Get similar items based on category and attributes
   */
  async getSimilarItems(menuItemId, limit = 5) {
    try {
      const item = await MenuItem.findById(menuItemId);
      if (!item) return [];

      return await MenuItem.find({
        _id: { $ne: menuItemId },
        category: item.category,
        available: { $ne: false }
      })
        .sort({ 'rating.average': -1 })
        .limit(limit)
        .lean()
        .then(items =>
          items.map(i => ({
            ...i,
            recommendationReason: `Similar to ${item.name}`
          }))
        );
    } catch (error) {
      console.error('Error getting similar items:', error);
      return [];
    }
  }

  /**
   * Get new items user hasn't tried
   */
  async getNewForYou(userId, limit = 10) {
    try {
      // Get user's order history
      const userOrders = await Order.find({ customer: userId }).populate('items.menuItem');
      const orderedItemIds = new Set();

      for (const order of userOrders) {
        for (const item of order.items) {
          const itemId = item.menuItem?._id?.toString();
          if (itemId) {
            orderedItemIds.add(itemId);
          }
        }
      }

      // Find items user hasn't ordered
      const newItems = await MenuItem.find({
        _id: { $nin: Array.from(orderedItemIds) },
        available: { $ne: false }
      })
        .sort({ createdAt: -1, 'rating.average': -1 })
        .limit(limit)
        .lean();

      return newItems.map(item => ({
        ...item,
        recommendationReason: 'New item you haven\'t tried',
        isNew: this.isNewItem(item.createdAt, 30)
      }));
    } catch (error) {
      console.error('Error getting new items:', error);
      return [];
    }
  }

  /**
   * Get personalized recommendations (auth required)
   */
  async getPersonalizedRecommendations(userId, limit = 10) {
    return this.getSuperPersonalizedRecommendations(userId, null, null, limit);
  }

  /**
   * Helper: Check if item is new
   */
  isNewItem(createdAt, daysThreshold) {
    const daysSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation <= daysThreshold;
  }
}

module.exports = new RecommendationsService();