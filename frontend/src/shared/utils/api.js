// File: frontend/src/shared/utils/api.js
// 🌐 AXIOS API UTILITY
// ✅ Configured for backend at localhost:5000 with interceptors

import axios from 'axios';

// Base URL for API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - Add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - Clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Don't redirect if already on login/customer pages
        if (!window.location.pathname.includes('/customer')) {
          window.location.href = '/customer/login';
        }
      }
      
      console.error('API Error:', {
        status,
        message: data?.message || error.message,
        url: error.config?.url
      });
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Export as default
export default api;