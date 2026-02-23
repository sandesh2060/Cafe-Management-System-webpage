import axios from 'axios';

const API_BASE_URL = '/api';

class LoyaltyService {
  // Get customer loyalty data
  async getLoyaltyData(customerId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/loyalty/customer/${customerId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Add a visit to customer's loyalty record
  async addVisit(customerId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/loyalty/add-visit`, {
        customerId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Claim a loyalty reward
  async claimReward(customerId, itemId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/loyalty/claim-reward`, {
        customerId,
        itemId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get available free items (configured by admin)
  async getAvailableFreeItems() {
    try {
      const response = await axios.get(`${API_BASE_URL}/loyalty/free-items`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get loyalty transaction history
  async getLoyaltyHistory(customerId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/loyalty/history/${customerId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Check if customer can claim reward
  async canClaimReward(customerId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/loyalty/can-claim/${customerId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      return new Error(error.response.data.message || 'Server error occurred');
    } else if (error.request) {
      return new Error('No response from server. Please check your connection.');
    } else {
      return new Error(error.message || 'An error occurred');
    }
  }
}

export default new LoyaltyService();