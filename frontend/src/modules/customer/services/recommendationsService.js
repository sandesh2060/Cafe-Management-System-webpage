// frontend/src/modules/customer/services/recommendationsService.js
// ✅ FIXED: Compatible with axios interceptor (returns response.data)

import api from '../../../api/axios';

class RecommendationsService {
  /**
   * Get personalized recommendations based on order history
   * @returns {Promise} Array of recommended menu items
   */
  async getPersonalizedRecommendations() {
    try {
      const response = await api.get('/recommendations/personalized');
      
      // ✅ FIX: Axios interceptor already returns response.data
      // So response IS the data, not response.data
      return response;
    } catch (error) {
      console.error('❌ Error fetching personalized recommendations:', error);
      throw error;
    }
  }

  /**
   * Get trending items
   * @returns {Promise} Array of trending menu items
   */
  async getTrendingItems() {
    try {
      const response = await api.get('/recommendations/trending');
      
      // ✅ FIX: Axios interceptor already returns response.data
      return response;
    } catch (error) {
      console.error('❌ Error fetching trending items:', error);
      throw error;
    }
  }

  /**
   * Get recommendations based on current cart
   * @param {Array} cartItems - Current items in cart
   * @returns {Promise} Array of complementary items
   */
  async getComplementaryItems(cartItems) {
    try {
      const response = await api.post('/recommendations/complementary', {
        cartItems
      });
      
      // ✅ FIX: Axios interceptor already returns response.data
      return response;
    } catch (error) {
      console.error('❌ Error fetching complementary items:', error);
      throw error;
    }
  }

  /**
   * Get frequently ordered together items
   * @param {string} menuItemId - Menu item ID
   * @returns {Promise} Array of items frequently ordered with this item
   */
  async getFrequentlyOrderedTogether(menuItemId) {
    try {
      const response = await api.get(`/recommendations/frequently-together/${menuItemId}`);
      
      // ✅ FIX: Axios interceptor already returns response.data
      return response;
    } catch (error) {
      console.error('❌ Error fetching frequently ordered together items:', error);
      throw error;
    }
  }

  /**
   * Track item view for recommendation algorithm
   * @param {string} menuItemId - Menu item ID
   */
  async trackItemView(menuItemId) {
    try {
      const response = await api.post('/recommendations/track-view', { menuItemId });
      
      // ✅ FIX: Return response for consistency
      return response;
    } catch (error) {
      console.error('❌ Error tracking item view:', error);
      // Don't throw - tracking is not critical
      return null;
    }
  }

  /**
   * Get recommendations for specific time of day
   * @returns {Promise} Array of time-appropriate recommendations
   */
  async getTimeBasedRecommendations() {
    try {
      const response = await api.get('/recommendations/time-based');
      
      // ✅ FIX: Axios interceptor already returns response.data
      return response;
    } catch (error) {
      console.error('❌ Error fetching time-based recommendations:', error);
      throw error;
    }
  }
}

export default new RecommendationsService();