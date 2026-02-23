// File: frontend/src/modules/customer/services/tableSessionService.js
// 🔌 TABLE SESSION API SERVICE

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = `${API_URL}/api/table-sessions`;

const tableSessionService = {
  // Create or join a table session
  createOrJoinSession: async (tableNumber) => {
    try {
      const response = await axios.post(`${BASE_URL}/join`, {
        tableNumber
      });
      return {
        success: true,
        session: response.data.session
      };
    } catch (error) {
      console.error('Create/join session error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to join table session'
      };
    }
  },

  // Get active session for a table
  getActiveSession: async (tableNumber) => {
    try {
      const response = await axios.get(`${BASE_URL}/active/${tableNumber}`);
      return {
        success: true,
        session: response.data.session
      };
    } catch (error) {
      console.error('Get session error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'No active session found'
      };
    }
  },

  // Update cart in session
  updateCart: async (sessionId, cart) => {
    try {
      const response = await axios.put(`${BASE_URL}/${sessionId}/cart`, {
        cart
      });
      return {
        success: true,
        session: response.data.session
      };
    } catch (error) {
      console.error('Update cart error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update cart'
      };
    }
  },

  // End session
  endSession: async (sessionId) => {
    try {
      const response = await axios.post(`${BASE_URL}/${sessionId}/end`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('End session error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to end session'
      };
    }
  },

  // Get session by ID
  getSessionById: async (sessionId) => {
    try {
      const response = await axios.get(`${BASE_URL}/${sessionId}`);
      return {
        success: true,
        session: response.data.session
      };
    } catch (error) {
      console.error('Get session by ID error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Session not found'
      };
    }
  }
};

export default tableSessionService;