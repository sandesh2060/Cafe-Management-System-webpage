// File: backend/src/modules/recommendations/recommendations.routes.js
// 🚀 ENHANCED RECOMMENDATION ROUTES
// ✅ Weather-based recommendations
// ✅ Super-personalized AI recommendations
// ✅ Trending, time-based, and complementary items

const express = require('express');
const router = express.Router();
const recommendationsController = require('./recommendations.controller');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * @route   GET /api/recommendations/weather-based
 * @desc    Get weather-based recommendations
 * @query   lat, lon, limit (optional)
 * @access  Public
 */
router.get('/weather-based', recommendationsController.getWeatherBasedRecommendations);

/**
 * @route   GET /api/recommendations/super-personalized/:customerId
 * @desc    Get super-personalized recommendations (combines everything)
 * @params  customerId
 * @query   lat, lon, limit (optional)
 * @access  Public
 */
router.get('/super-personalized/:customerId', recommendationsController.getSuperPersonalizedRecommendations);

/**
 * @route   GET /api/recommendations/trending
 * @desc    Get trending items
 * @query   limit (optional), timeframe (optional: 1d, 7d, 30d)
 * @access  Public
 */
router.get('/trending', recommendationsController.getTrendingItems);

/**
 * @route   GET /api/recommendations/time-based
 * @desc    Get time-based recommendations (breakfast, lunch, dinner)
 * @query   limit (optional)
 * @access  Public
 */
router.get('/time-based', recommendationsController.getTimeBasedRecommendations);

/**
 * @route   GET /api/recommendations/similar/:menuItemId
 * @desc    Get similar items
 * @params  menuItemId
 * @query   limit (optional)
 * @access  Public
 */
router.get('/similar/:menuItemId', recommendationsController.getSimilarItems);

/**
 * @route   GET /api/recommendations/frequently-ordered-together/:menuItemId
 * @desc    Get items frequently ordered together with this item
 * @params  menuItemId
 * @query   limit (optional)
 * @access  Public
 */
router.get('/frequently-ordered-together/:menuItemId', recommendationsController.getFrequentlyOrderedTogether);

/**
 * @route   POST /api/recommendations/complementary
 * @desc    Get complementary items based on cart
 * @body    { cartItems: [...] }
 * @query   limit (optional)
 * @access  Public
 */
router.post('/complementary', recommendationsController.getComplementaryItems);

/**
 * @route   POST /api/recommendations/track-view
 * @desc    Track item view for recommendation algorithm
 * @body    { menuItemId }
 * @access  Public (can work with or without auth)
 */
router.post('/track-view', recommendationsController.trackItemView);

// ============================================
// AUTHENTICATED ROUTES (Require login)
// ============================================

// Note: If you have authentication middleware, you can add it here
// const { authenticate } = require('../../auth/auth.middleware');
// router.use(authenticate);

/**
 * @route   GET /api/recommendations/personalized
 * @desc    Get personalized recommendations (requires auth)
 * @query   limit (optional)
 * @access  Private
 */
// router.get('/personalized', recommendationsController.getPersonalizedRecommendations);

/**
 * @route   GET /api/recommendations/new-for-you
 * @desc    Get new items user hasn't tried (requires auth)
 * @query   limit (optional)
 * @access  Private
 */
// router.get('/new-for-you', recommendationsController.getNewForYou);

module.exports = router;