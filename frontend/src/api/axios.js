// File: frontend/src/api/axios.js
// 🎯 AXIOS CLIENT CONFIGURATION - PRODUCTION READY
// ✅ Biometric-safe 401 handling
// ✅ Proper token usage
// ✅ Enhanced error handling
// ✅ Clean response.data return

import axios from 'axios';

// ============================================
// AXIOS INSTANCE
// ============================================
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
axiosInstance.interceptors.request.use(
  (config) => {
    // ✅ Attach JWT Token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Attach Customer Session Info
    const customerSession = localStorage.getItem('customerSession');
    if (customerSession) {
      try {
        const session = JSON.parse(customerSession);

        if (session.customerId) {
          config.headers['X-Customer-Id'] = session.customerId;
        }

        if (session.tableNumber) {
          config.headers['X-Table-Number'] = session.tableNumber;
        }

        if (session.sessionId) {
          config.headers['X-Session-Id'] = session.sessionId;
        }
      } catch (err) {
        console.warn('⚠️ Failed to parse customer session:', err);
      }
    }

    // ✅ Dev Logging
    if (import.meta.env.DEV) {
      console.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
axiosInstance.interceptors.response.use(
  (response) => {
    // ✅ Dev Logging
    if (import.meta.env.DEV) {
      console.log('📥 API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    // ✅ Always return response.data for cleaner usage
    return response.data;
  },
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });

    // ============================================
    // SERVER RESPONSE ERRORS
    // ============================================
    if (error.response) {
      const { status, data } = error.response;
      const url = error.config?.url || '';

      switch (status) {
        case 400:
          console.error('🔴 Bad Request:', data?.message);
          break;

        case 401:
          console.error('🔴 Unauthorized:', data?.message);

          // ✅ IMPORTANT: Biometric-safe 401 handling
          const isBiometricEndpoint = url.includes('/biometric/');
          const isRegistrationRequired =
            data?.requiresRegistration === true;

          if (!isBiometricEndpoint || !isRegistrationRequired) {
            console.error('🔴 Clearing session (real auth failure)');

            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');

            // ⚠️ Do NOT automatically remove customerSession
            // Let components handle session closing logic
          } else {
            console.log(
              'ℹ️ Biometric registration required - session preserved'
            );
          }
          break;

        case 403:
          console.error('🔴 Forbidden:', data?.message);
          break;

        case 404:
          console.error('🔴 Not Found:', data?.message);
          break;

        case 429:
          console.error('🔴 Too Many Requests:', data?.message);
          break;

        case 500:
          console.error('🔴 Server Error:', data?.message);
          break;

        default:
          console.error(`🔴 Error ${status}:`, data?.message);
      }

      // ============================================
      // ENHANCED ERROR OBJECT
      // ============================================
      const errorMessage =
        data?.message ||
        data?.error ||
        error.message ||
        'Something went wrong';

      const enhancedError = new Error(errorMessage);
      enhancedError.status = status;
      enhancedError.data = data;
      enhancedError.response = error.response;
      enhancedError.originalError = error;

      return Promise.reject(enhancedError);
    }

    // ============================================
    // NETWORK ERRORS
    // ============================================
    if (error.request) {
      console.error(
        '🔴 No response from server - Check network connection'
      );

      const networkError = new Error(
        'Network error - please check your connection'
      );
      networkError.originalError = error;

      return Promise.reject(networkError);
    }

    // ============================================
    // UNKNOWN ERRORS
    // ============================================
    console.error('🔴 Request Setup Error:', error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
