// File: backend/src/modules/recommendations/recommendations.controller.js
// 🚀 ENHANCED RECOMMENDATION CONTROLLER
// ✅ Weather-based recommendations
// ✅ Super-personalized AI recommendations

const recommendationsService = require('./recommendations.service');
const { successResponse, errorResponse } = require('../../shared/utils/response');

/**
 * 🌤️ NEW: Get weather-based recommendations
 * Suggests items based on current weather conditions
 */
exports.getWeatherBasedRecommendations = async (req, res) => {
  try {
    const { lat, lon, limit = 5 } = req.query;
    
    if (!lat || !lon) {
      return errorResponse(res, 'Latitude and longitude are required', 400);
    }
    
    const recommendations = await recommendationsService.getWeatherBasedRecommendations(
      parseFloat(lat),
      parseFloat(lon),
      parseInt(limit)
    );
    
    return successResponse(res, {
      recommendations
    }, 'Weather-based recommendations retrieved successfully');
  } catch (error) {
    console.error('Error getting weather-based recommendations:', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * 🎯 NEW: Get super-personalized recommendations
 * Combines user history, favorites, weather, time of day, and trending
 */
exports.getSuperPersonalizedRecommendations = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { lat, lon, limit = 10 } = req.query;
    
    if (!customerId) {
      return errorResponse(res, 'Customer ID is required', 400);
    }
    
    const recommendations = await recommendationsService.getSuperPersonalizedRecommendations(
      customerId,
      lat ? parseFloat(lat) : null,
      lon ? parseFloat(lon) : null,
      parseInt(limit)
    );
    
    return successResponse(res, {
      recommendations
    }, 'Super-personalized recommendations retrieved successfully');
  } catch (error) {
    console.error('Error getting super-personalized recommendations:', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Get personalized recommendations based on user's order history
 */
exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const recommendations = await recommendationsService.getPersonalizedRecommendations(
      userId,
      parseInt(limit)
    );

    return successResponse(res, {
      recommendations
    }, 'Personalized recommendations retrieved successfully');
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Get trending items across all users
 */
exports.getTrendingItems = async (req, res) => {
  try {
    const { limit = 10, timeframe = '7d' } = req.query;

    const trending = await recommendationsService.getTrendingItems(
      parseInt(limit),
      timeframe
    );

    return successResponse(res, {
      trending
    }, 'Trending items retrieved successfully');
  } catch (error) {
    console.error('Error getting trending items:', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Get complementary items based on current cart
 */
exports.getComplementaryItems = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const { limit = 5 } = req.query;

    if (!cartItems || !Array.isArray(cartItems)) {
      return errorResponse(res, 'Cart items are required', 400);
    }

    const complementary = await recommendationsService.getComplementaryItems(
      cartItems,
      parseInt(limit)
    );

    return successResponse(res, {
      complementary
    }, 'Complementary items retrieved successfully');
  } catch (error) {
    console.error('Error getting complementary items:', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Get items frequently ordered together with a specific item
 */
exports.getFrequentlyOrderedTogether = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const { limit = 5 } = req.query;

    const items = await recommendationsService.getFrequentlyOrderedTogether(
      menuItemId,
      parseInt(limit)
    );

    return successResponse(res, {
      items
    }, 'Frequently ordered together items retrieved successfully');
  } catch (error) {
    console.error('Error getting frequently ordered together items:', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Get time-based recommendations (breakfast, lunch, dinner, etc.)
 */
exports.getTimeBasedRecommendations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const currentHour = new Date().getHours();

    const recommendations = await recommendationsService.getTimeBasedRecommendations(
      currentHour,
      parseInt(limit)
    );

    return successResponse(res, {
      recommendations,
      timeOfDay: recommendationsService.getTimeOfDay(currentHour)
    }, 'Time-based recommendations retrieved successfully');
  } catch (error) {
    console.error('Error getting time-based recommendations:', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Track item view for recommendation algorithm
 */
exports.trackItemView = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { menuItemId } = req.body;

    if (!menuItemId) {
      return errorResponse(res, 'Menu item ID is required', 400);
    }

    await recommendationsService.trackItemView(userId, menuItemId);

    return successResponse(res, null, 'Item view tracked successfully');
  } catch (error) {
    console.error('Error tracking item view:', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Get similar items based on category and attributes
 */
exports.getSimilarItems = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const { limit = 5 } = req.query;

    const similarItems = await recommendationsService.getSimilarItems(
      menuItemId,
      parseInt(limit)
    );

    return successResponse(res, {
      similarItems
    }, 'Similar items retrieved successfully');
  } catch (error) {
    console.error('Error getting similar items:', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Get new items the user hasn't tried
 */
exports.getNewForYou = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const newItems = await recommendationsService.getNewForYou(
      userId,
      parseInt(limit)
    );

    return successResponse(res, {
      newItems
    }, 'New items retrieved successfully');
  } catch (error) {
    console.error('Error getting new items:', error);
    return errorResponse(res, error.message, 500);
  }
};