// frontend/src/config/apiEndpoints.js

/**
 * API Endpoints Configuration
 * Centralized API endpoint management for the entire application
 * 
 * @description All API routes are organized by module and role
 * @version 1.0.0
 */

// Base API URL - can be changed based on environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

/**
 * API Version
 */
const API_VERSION = '/v1'

/**
 * Complete API Endpoints Object
 */
const API_ENDPOINTS = {
  // ============================================
  // AUTHENTICATION ENDPOINTS
  // ============================================
  AUTH: {
    LOGIN: `${API_BASE_URL}${API_VERSION}/auth/login`,
    REGISTER: `${API_BASE_URL}${API_VERSION}/auth/register`,
    LOGOUT: `${API_BASE_URL}${API_VERSION}/auth/logout`,
    REFRESH_TOKEN: `${API_BASE_URL}${API_VERSION}/auth/refresh-token`,
    FORGOT_PASSWORD: `${API_BASE_URL}${API_VERSION}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}${API_VERSION}/auth/reset-password`,
    VERIFY_EMAIL: `${API_BASE_URL}${API_VERSION}/auth/verify-email`,
    CHANGE_PASSWORD: `${API_BASE_URL}${API_VERSION}/auth/change-password`,
    GET_ME: `${API_BASE_URL}${API_VERSION}/auth/me`,
  },

  // ============================================
  // CUSTOMER ENDPOINTS
  // ============================================
  CUSTOMER: {
    // Menu & Categories
    MENU: {
      GET_ALL: `${API_BASE_URL}${API_VERSION}/customer/menu`,
      GET_BY_ID: (id) => `${API_BASE_URL}${API_VERSION}/customer/menu/${id}`,
      GET_BY_CATEGORY: (categoryId) => `${API_BASE_URL}${API_VERSION}/customer/menu/category/${categoryId}`,
      SEARCH: `${API_BASE_URL}${API_VERSION}/customer/menu/search`,
      GET_CATEGORIES: `${API_BASE_URL}${API_VERSION}/customer/menu/categories`,
    },

    // Orders
    ORDERS: {
      CREATE: `${API_BASE_URL}${API_VERSION}/customer/orders`,
      GET_ALL: `${API_BASE_URL}${API_VERSION}/customer/orders`,
      GET_BY_ID: (id) => `${API_BASE_URL}${API_VERSION}/customer/orders/${id}`,
      UPDATE: (id) => `${API_BASE_URL}${API_VERSION}/customer/orders/${id}`,
      CANCEL: (id) => `${API_BASE_URL}${API_VERSION}/customer/orders/${id}/cancel`,
      TRACK: (id) => `${API_BASE_URL}${API_VERSION}/customer/orders/${id}/track`,
      HISTORY: `${API_BASE_URL}${API_VERSION}/customer/orders/history`,
      REORDER: (id) => `${API_BASE_URL}${API_VERSION}/customer/orders/${id}/reorder`,
    },

    // Cart
    CART: {
      GET: `${API_BASE_URL}${API_VERSION}/customer/cart`,
      ADD_ITEM: `${API_BASE_URL}${API_VERSION}/customer/cart/add`,
      UPDATE_ITEM: (itemId) => `${API_BASE_URL}${API_VERSION}/customer/cart/items/${itemId}`,
      REMOVE_ITEM: (itemId) => `${API_BASE_URL}${API_VERSION}/customer/cart/items/${itemId}`,
      CLEAR: `${API_BASE_URL}${API_VERSION}/customer/cart/clear`,
      APPLY_COUPON: `${API_BASE_URL}${API_VERSION}/customer/cart/apply-coupon`,
    },

    // Offers & Discounts
    OFFERS: {
      GET_ALL: `${API_BASE_URL}${API_VERSION}/customer/offers`,
      GET_ACTIVE: `${API_BASE_URL}${API_VERSION}/customer/offers/active`,
      GET_BY_ID: (id) => `${API_BASE_URL}${API_VERSION}/customer/offers/${id}`,
      VALIDATE_COUPON: `${API_BASE_URL}${API_VERSION}/customer/offers/validate-coupon`,
    },

    // Loyalty Program
    LOYALTY: {
      GET_POINTS: `${API_BASE_URL}${API_VERSION}/customer/loyalty/points`,
      GET_HISTORY: `${API_BASE_URL}${API_VERSION}/customer/loyalty/history`,
      REDEEM_ITEM: `${API_BASE_URL}${API_VERSION}/customer/loyalty/redeem`,
      GET_FREE_ITEMS: `${API_BASE_URL}${API_VERSION}/customer/loyalty/free-items`,
      CHECK_ELIGIBILITY: `${API_BASE_URL}${API_VERSION}/customer/loyalty/check-eligibility`,
    },

    // Session Management
    SESSION: {
      CREATE: `${API_BASE_URL}${API_VERSION}/customer/session/create`,
      GET_ACTIVE: `${API_BASE_URL}${API_VERSION}/customer/session/active`,
      END: (sessionId) => `${API_BASE_URL}${API_VERSION}/customer/session/${sessionId}/end`,
      SCAN_QR: `${API_BASE_URL}${API_VERSION}/customer/session/scan-qr`,
      CALL_WAITER: (sessionId) => `${API_BASE_URL}${API_VERSION}/customer/session/${sessionId}/call-waiter`,
    },

    // Reviews
    REVIEWS: {
      CREATE: `${API_BASE_URL}${API_VERSION}/customer/reviews`,
      GET_BY_ITEM: (itemId) => `${API_BASE_URL}${API_VERSION}/customer/reviews/item/${itemId}`,
      UPDATE: (id) => `${API_BASE_URL}${API_VERSION}/customer/reviews/${id}`,
      DELETE: (id) => `${API_BASE_URL}${API_VERSION}/customer/reviews/${id}`,
    },

    // Profile
    PROFILE: {
      GET: `${API_BASE_URL}${API_VERSION}/customer/profile`,
      UPDATE: `${API_BASE_URL}${API_VERSION}/customer/profile`,
      UPDATE_AVATAR: `${API_BASE_URL}${API_VERSION}/customer/profile/avatar`,
      GET_FAVORITES: `${API_BASE_URL}${API_VERSION}/customer/profile/favorites`,
      ADD_FAVORITE: (itemId) => `${API_BASE_URL}${API_VERSION}/customer/profile/favorites/${itemId}`,
      REMOVE_FAVORITE: (itemId) => `${API_BASE_URL}${API_VERSION}/customer/profile/favorites/${itemId}`,
    },
  },

  // ============================================
  // SUPER ADMIN ENDPOINTS
  // ============================================
  SUPERADMIN: {
    // Dashboard
    DASHBOARD: {
      STATS: `${API_BASE_URL}${API_VERSION}/superadmin/dashboard/stats`,
      REVENUE: `${API_BASE_URL}${API_VERSION}/superadmin/dashboard/revenue`,
      TOP_ITEMS: `${API_BASE_URL}${API_VERSION}/superadmin/dashboard/top-items`,
      RECENT_ORDERS: `${API_BASE_URL}${API_VERSION}/superadmin/dashboard/recent-orders`,
    },

    // User Management
    USERS: {
      GET_ALL: `${API_BASE_URL}${API_VERSION}/superadmin/users`,
      GET_BY_ID: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/users/${id}`,
      CREATE: `${API_BASE_URL}${API_VERSION}/superadmin/users`,
      UPDATE: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/users/${id}`,
      DELETE: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/users/${id}`,
      ASSIGN_ROLE: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/users/${id}/role`,
      TOGGLE_STATUS: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/users/${id}/toggle-status`,
      GET_BY_ROLE: (role) => `${API_BASE_URL}${API_VERSION}/superadmin/users/role/${role}`,
    },

    // Menu Management
    MENU: {
      GET_ALL: `${API_BASE_URL}${API_VERSION}/superadmin/menu`,
      GET_BY_ID: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/menu/${id}`,
      CREATE: `${API_BASE_URL}${API_VERSION}/superadmin/menu`,
      UPDATE: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/menu/${id}`,
      DELETE: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/menu/${id}`,
      TOGGLE_AVAILABILITY: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/menu/${id}/toggle-availability`,
      UPLOAD_IMAGE: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/menu/${id}/upload-image`,
      
      // Categories
      CATEGORIES: {
        GET_ALL: `${API_BASE_URL}${API_VERSION}/superadmin/menu/categories`,
        CREATE: `${API_BASE_URL}${API_VERSION}/superadmin/menu/categories`,
        UPDATE: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/menu/categories/${id}`,
        DELETE: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/menu/categories/${id}`,
      },
    },

    // Offer Management
    OFFERS: {
      GET_ALL: `${API_BASE_URL}${API_VERSION}/superadmin/offers`,
      GET_BY_ID: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/offers/${id}`,
      CREATE: `${API_BASE_URL}${API_VERSION}/superadmin/offers`,
      UPDATE: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/offers/${id}`,
      DELETE: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/offers/${id}`,
      TOGGLE_STATUS: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/offers/${id}/toggle-status`,
    },

    // Discount Management
    DISCOUNTS: {
      GET_ALL: `${API_BASE_URL}${API_VERSION}/superadmin/discounts`,
      CREATE: `${API_BASE_URL}${API_VERSION}/superadmin/discounts`,
      UPDATE: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/discounts/${id}`,
      DELETE: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/discounts/${id}`,
    },

    // Loyalty Management
    LOYALTY: {
      GET_SETTINGS: `${API_BASE_URL}${API_VERSION}/superadmin/loyalty/settings`,
      UPDATE_SETTINGS: `${API_BASE_URL}${API_VERSION}/superadmin/loyalty/settings`,
      GET_FREE_ITEMS: `${API_BASE_URL}${API_VERSION}/superadmin/loyalty/free-items`,
      ADD_FREE_ITEM: `${API_BASE_URL}${API_VERSION}/superadmin/loyalty/free-items`,
      REMOVE_FREE_ITEM: (id) => `${API_BASE_URL}${API_VERSION}/superadmin/loyalty/free-items/${id}`,
      GET_CUSTOMER_LOYALTY: `${API_BASE_URL}${API_VERSION}/superadmin/loyalty/customers`,
      GET_ANALYTICS: `${API_BASE_URL}${API_VERSION}/superadmin/loyalty/analytics`,
    },

    // Reports & Analytics
    REPORTS: {
      SALES: `${API_BASE_URL}${API_VERSION}/superadmin/reports/sales`,
      INVENTORY: `${API_BASE_URL}${API_VERSION}/superadmin/reports/inventory`,
      STAFF_PERFORMANCE: `${API_BASE_URL}${API_VERSION}/superadmin/reports/staff-performance`,
      CUSTOMER_ANALYTICS: `${API_BASE_URL}${API_VERSION}/superadmin/reports/customer-analytics`,
      EXPORT: `${API_BASE_URL}${API_VERSION}/superadmin/reports/export`,
    },

    // Settings
    SETTINGS: {
      GET: `${API_BASE_URL}${API_VERSION}/superadmin/settings`,
      UPDATE: `${API_BASE_URL}${API_VERSION}/superadmin/settings`,
      UPDATE_TAX: `${API_BASE_URL}${API_VERSION}/superadmin/settings/tax`,
      UPDATE_DELIVERY: `${API_BASE_URL}${API_VERSION}/superadmin/settings/delivery`,
    },
  },

  // ============================================
  // CASHIER ENDPOINTS
  // ============================================
  CASHIER: {
    // Dashboard
    DASHBOARD: {
      STATS: `${API_BASE_URL}${API_VERSION}/cashier/dashboard/stats`,
      DAILY_SUMMARY: `${API_BASE_URL}${API_VERSION}/cashier/dashboard/daily-summary`,
    },

    // Billing
    BILLING: {
      GET_ACTIVE_TABLES: `${API_BASE_URL}${API_VERSION}/cashier/billing/active-tables`,
      GET_TABLE_BILL: (tableId) => `${API_BASE_URL}${API_VERSION}/cashier/billing/table/${tableId}`,
      APPLY_DISCOUNT: `${API_BASE_URL}${API_VERSION}/cashier/billing/apply-discount`,
      SPLIT_BILL: (orderId) => `${API_BASE_URL}${API_VERSION}/cashier/billing/${orderId}/split`,
      PROCESS_PAYMENT: `${API_BASE_URL}${API_VERSION}/cashier/billing/process-payment`,
    },

    // Cash Management
    CASH: {
      GET_REGISTER: `${API_BASE_URL}${API_VERSION}/cashier/cash/register`,
      ADD_CASH: `${API_BASE_URL}${API_VERSION}/cashier/cash/add`,
      REMOVE_CASH: `${API_BASE_URL}${API_VERSION}/cashier/cash/remove`,
      DAILY_CLOSING: `${API_BASE_URL}${API_VERSION}/cashier/cash/daily-closing`,
      GET_CLOSING_HISTORY: `${API_BASE_URL}${API_VERSION}/cashier/cash/closing-history`,
    },

    // Transactions
    TRANSACTIONS: {
      GET_ALL: `${API_BASE_URL}${API_VERSION}/cashier/transactions`,
      GET_BY_ID: (id) => `${API_BASE_URL}${API_VERSION}/cashier/transactions/${id}`,
      GET_RECEIPT: (id) => `${API_BASE_URL}${API_VERSION}/cashier/transactions/${id}/receipt`,
      VOID_TRANSACTION: (id) => `${API_BASE_URL}${API_VERSION}/cashier/transactions/${id}/void`,
    },

    // Orders
    ORDERS: {
      GET_ACTIVE: `${API_BASE_URL}${API_VERSION}/cashier/orders/active`,
      GET_COMPLETED: `${API_BASE_URL}${API_VERSION}/cashier/orders/completed`,
    },

    // Reports
    REPORTS: {
      DAILY: `${API_BASE_URL}${API_VERSION}/cashier/reports/daily`,
      CASH_FLOW: `${API_BASE_URL}${API_VERSION}/cashier/reports/cash-flow`,
      EXPORT: `${API_BASE_URL}${API_VERSION}/cashier/reports/export`,
    },
  },

  // ============================================
  // CHEF ENDPOINTS
  // ============================================
  CHEF: {
    // Dashboard
    DASHBOARD: {
      STATS: `${API_BASE_URL}${API_VERSION}/chef/dashboard/stats`,
      ORDER_QUEUE: `${API_BASE_URL}${API_VERSION}/chef/dashboard/order-queue`,
    },

    // Kitchen Display System
    KITCHEN: {
      GET_ORDERS: `${API_BASE_URL}${API_VERSION}/chef/kitchen/orders`,
      GET_ORDER_DETAILS: (id) => `${API_BASE_URL}${API_VERSION}/chef/kitchen/orders/${id}`,
      START_ORDER: (id) => `${API_BASE_URL}${API_VERSION}/chef/kitchen/orders/${id}/start`,
      COMPLETE_ORDER: (id) => `${API_BASE_URL}${API_VERSION}/chef/kitchen/orders/${id}/complete`,
      MARK_READY: (id) => `${API_BASE_URL}${API_VERSION}/chef/kitchen/orders/${id}/ready`,
      UPDATE_PRIORITY: (id) => `${API_BASE_URL}${API_VERSION}/chef/kitchen/orders/${id}/priority`,
    },

    // Inventory
    INVENTORY: {
      GET_ALL: `${API_BASE_URL}${API_VERSION}/chef/inventory`,
      GET_LOW_STOCK: `${API_BASE_URL}${API_VERSION}/chef/inventory/low-stock`,
      UPDATE_STOCK: (id) => `${API_BASE_URL}${API_VERSION}/chef/inventory/${id}`,
      ADD_ITEM: `${API_BASE_URL}${API_VERSION}/chef/inventory`,
      GET_LOGS: `${API_BASE_URL}${API_VERSION}/chef/inventory/logs`,
    },

    // Recipes
    RECIPES: {
      GET_ALL: `${API_BASE_URL}${API_VERSION}/chef/recipes`,
      GET_BY_ID: (id) => `${API_BASE_URL}${API_VERSION}/chef/recipes/${id}`,
      CREATE: `${API_BASE_URL}${API_VERSION}/chef/recipes`,
      UPDATE: (id) => `${API_BASE_URL}${API_VERSION}/chef/recipes/${id}`,
      DELETE: (id) => `${API_BASE_URL}${API_VERSION}/chef/recipes/${id}`,
    },
  },

  // ============================================
  // WAITER ENDPOINTS
  // ============================================
  WAITER: {
    // Dashboard
    DASHBOARD: {
      STATS: `${API_BASE_URL}${API_VERSION}/waiter/dashboard/stats`,
      ASSIGNED_TABLES: `${API_BASE_URL}${API_VERSION}/waiter/dashboard/assigned-tables`,
      PENDING_SERVING: `${API_BASE_URL}${API_VERSION}/waiter/dashboard/pending-serving`,
    },

    // Table Management
    TABLES: {
      GET_ALL: `${API_BASE_URL}${API_VERSION}/waiter/tables`,
      GET_BY_ID: (id) => `${API_BASE_URL}${API_VERSION}/waiter/tables/${id}`,
      UPDATE_STATUS: (id) => `${API_BASE_URL}${API_VERSION}/waiter/tables/${id}/status`,
      ASSIGN_WAITER: (id) => `${API_BASE_URL}${API_VERSION}/waiter/tables/${id}/assign`,
      GET_CUSTOMER_ORDERS: (tableId) => `${API_BASE_URL}${API_VERSION}/waiter/tables/${tableId}/orders`,
    },

    // Order Management
    ORDERS: {
      GET_ACTIVE: `${API_BASE_URL}${API_VERSION}/waiter/orders/active`,
      GET_READY: `${API_BASE_URL}${API_VERSION}/waiter/orders/ready`,
      CREATE: `${API_BASE_URL}${API_VERSION}/waiter/orders`,
      UPDATE: (id) => `${API_BASE_URL}${API_VERSION}/waiter/orders/${id}`,
      SERVE: (id) => `${API_BASE_URL}${API_VERSION}/waiter/orders/${id}/serve`,
    },

    // Customer Requests
    REQUESTS: {
      GET_ALL: `${API_BASE_URL}${API_VERSION}/waiter/requests`,
      RESPOND: (id) => `${API_BASE_URL}${API_VERSION}/waiter/requests/${id}/respond`,
      COMPLETE: (id) => `${API_BASE_URL}${API_VERSION}/waiter/requests/${id}/complete`,
    },

    // Tips
    TIPS: {
      GET_ALL: `${API_BASE_URL}${API_VERSION}/waiter/tips`,
      GET_SUMMARY: `${API_BASE_URL}${API_VERSION}/waiter/tips/summary`,
    },
  },

  // ============================================
  // COMMON/SHARED ENDPOINTS
  // ============================================
  COMMON: {
    // Notifications
    NOTIFICATIONS: {
      GET_ALL: `${API_BASE_URL}${API_VERSION}/notifications`,
      MARK_READ: (id) => `${API_BASE_URL}${API_VERSION}/notifications/${id}/read`,
      MARK_ALL_READ: `${API_BASE_URL}${API_VERSION}/notifications/read-all`,
      DELETE: (id) => `${API_BASE_URL}${API_VERSION}/notifications/${id}`,
    },

    // File Upload
    UPLOAD: {
      IMAGE: `${API_BASE_URL}${API_VERSION}/upload/image`,
      DOCUMENT: `${API_BASE_URL}${API_VERSION}/upload/document`,
      AVATAR: `${API_BASE_URL}${API_VERSION}/upload/avatar`,
    },

    // QR Code
    QR_CODE: {
      GENERATE: `${API_BASE_URL}${API_VERSION}/qr-code/generate`,
      VERIFY: `${API_BASE_URL}${API_VERSION}/qr-code/verify`,
    },
  },
}

/**
 * Helper function to build query string from params object
 * @param {Object} params - Query parameters
 * @returns {string} Query string
 */
export const buildQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) return ''
  
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
  
  return queryString ? `?${queryString}` : ''
}

/**
 * Helper function to append query params to URL
 * @param {string} url - Base URL
 * @param {Object} params - Query parameters
 * @returns {string} Complete URL with query params
 */
export const appendQueryParams = (url, params) => {
  const queryString = buildQueryString(params)
  return `${url}${queryString}`
}

// Export the main endpoints object
export default API_ENDPOINTS

// Export base URL for direct use
export { API_BASE_URL, API_VERSION }