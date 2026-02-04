// frontend/src/config/appConfig.js

/**
 * Application Configuration
 * Central configuration file for the entire application
 */

/**
 * Environment Variables
 */
export const ENV = {
  MODE: import.meta.env.MODE || 'development',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  CLIENT_URL: import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173',
}

/**
 * Application Information
 */
export const APP_INFO = {
  NAME: 'Cafe Management System',
  VERSION: '1.0.0',
  DESCRIPTION: 'Complete restaurant management solution',
  AUTHOR: 'Your Company',
  SUPPORT_EMAIL: 'support@cafemanagement.com',
}

/**
 * API Configuration
 */
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
}

/**
 * Authentication Configuration
 */
export const AUTH_CONFIG = {
  TOKEN_KEY: 'token',
  USER_KEY: 'user',
  REMEMBER_ME_KEY: 'rememberMe',
  TOKEN_EXPIRY_DAYS: 7,
  SESSION_TIMEOUT: 3600000, // 1 hour in milliseconds
}

/**
 * User Roles
 */
export const USER_ROLES = {
  CUSTOMER: 'customer',
  SUPERADMIN: 'superadmin',
  CASHIER: 'cashier',
  CHEF: 'chef',
  WAITER: 'waiter',
}

/**
 * Role Display Names
 */
export const ROLE_NAMES = {
  [USER_ROLES.CUSTOMER]: 'Customer',
  [USER_ROLES.SUPERADMIN]: 'Super Admin',
  [USER_ROLES.CASHIER]: 'Cashier',
  [USER_ROLES.CHEF]: 'Chef',
  [USER_ROLES.WAITER]: 'Waiter',
}

/**
 * Default Routes by Role
 */
export const DEFAULT_ROUTES = {
  [USER_ROLES.CUSTOMER]: '/customer/menu',
  [USER_ROLES.SUPERADMIN]: '/superadmin/dashboard',
  [USER_ROLES.CASHIER]: '/cashier/dashboard',
  [USER_ROLES.CHEF]: '/chef/dashboard',
  [USER_ROLES.WAITER]: '/waiter/dashboard',
}

/**
 * Order Status
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

/**
 * Order Status Display
 */
export const ORDER_STATUS_DISPLAY = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.CONFIRMED]: 'Confirmed',
  [ORDER_STATUS.PREPARING]: 'Preparing',
  [ORDER_STATUS.READY]: 'Ready',
  [ORDER_STATUS.SERVED]: 'Served',
  [ORDER_STATUS.COMPLETED]: 'Completed',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
}

/**
 * Order Status Colors
 */
export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUS.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUS.PREPARING]: 'bg-orange-100 text-orange-800',
  [ORDER_STATUS.READY]: 'bg-green-100 text-green-800',
  [ORDER_STATUS.SERVED]: 'bg-purple-100 text-purple-800',
  [ORDER_STATUS.COMPLETED]: 'bg-gray-100 text-gray-800',
  [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
}

/**
 * Payment Methods
 */
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi',
  WALLET: 'wallet',
}

/**
 * Payment Status
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
}

/**
 * Table Status
 */
export const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
}

/**
 * Table Status Colors
 */
export const TABLE_STATUS_COLORS = {
  [TABLE_STATUS.AVAILABLE]: 'bg-green-100 text-green-800',
  [TABLE_STATUS.OCCUPIED]: 'bg-red-100 text-red-800',
  [TABLE_STATUS.RESERVED]: 'bg-blue-100 text-blue-800',
  [TABLE_STATUS.CLEANING]: 'bg-yellow-100 text-yellow-800',
  [TABLE_STATUS.MAINTENANCE]: 'bg-gray-100 text-gray-800',
}

/**
 * Pagination Configuration
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
}

/**
 * File Upload Configuration
 */
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
}

/**
 * Date/Time Formats
 */
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  FULL: 'MMMM DD, YYYY hh:mm A',
  TIME: 'hh:mm A',
  DATE_TIME: 'DD/MM/YYYY hh:mm A',
  API: 'YYYY-MM-DD',
}

/**
 * Currency Configuration
 */
export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  LOCALE: 'en-IN',
}

/**
 * Notification Configuration
 */
export const NOTIFICATION_CONFIG = {
  DURATION: 5000, // 5 seconds
  POSITION: 'top-right',
  MAX_NOTIFICATIONS: 3,
}

/**
 * Socket Events
 */
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Orders
  NEW_ORDER: 'new_order',
  ORDER_UPDATED: 'order_updated',
  ORDER_CANCELLED: 'order_cancelled',

  // Kitchen
  ORDER_PREPARING: 'order_preparing',
  ORDER_READY: 'order_ready',

  // Tables
  TABLE_STATUS_CHANGED: 'table_status_changed',
  WAITER_CALLED: 'waiter_called',

  // Notifications
  NEW_NOTIFICATION: 'new_notification',
}

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CART: 'cart',
  THEME: 'theme',
  LANGUAGE: 'language',
  REMEMBER_ME: 'rememberMe',
}

/**
 * Theme Configuration
 */
export const THEME = {
  DEFAULT: 'light',
  OPTIONS: ['light', 'dark', 'auto'],
}

/**
 * Loyalty Program Configuration
 */
export const LOYALTY_CONFIG = {
  POINTS_PER_CURRENCY: 1, // 1 point per ₹1
  MIN_REDEMPTION_POINTS: 100,
  POINTS_EXPIRY_DAYS: 365,
}

/**
 * Validation Rules
 */
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 50,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  PHONE_LENGTH: 10,
  OTP_LENGTH: 6,
}

/**
 * Feature Flags
 */
export const FEATURES = {
  ENABLE_LOYALTY: true,
  ENABLE_REVIEWS: true,
  ENABLE_RESERVATIONS: true,
  ENABLE_TIPS: true,
  ENABLE_DARK_MODE: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_SOCKET: true,
}

/**
 * Debug Configuration
 */
export const DEBUG = {
  ENABLED: ENV.MODE === 'development',
  LOG_API_CALLS: ENV.MODE === 'development',
  LOG_SOCKET_EVENTS: ENV.MODE === 'development',
}

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
}

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  REGISTER_SUCCESS: 'Registration successful!',
  UPDATE_SUCCESS: 'Updated successfully!',
  DELETE_SUCCESS: 'Deleted successfully!',
  ORDER_PLACED: 'Order placed successfully!',
}

// Export all as default
export default {
  ENV,
  APP_INFO,
  API_CONFIG,
  AUTH_CONFIG,
  USER_ROLES,
  ROLE_NAMES,
  DEFAULT_ROUTES,
  ORDER_STATUS,
  ORDER_STATUS_DISPLAY,
  ORDER_STATUS_COLORS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  TABLE_STATUS,
  TABLE_STATUS_COLORS,
  PAGINATION,
  UPLOAD_CONFIG,
  DATE_FORMATS,
  CURRENCY,
  NOTIFICATION_CONFIG,
  SOCKET_EVENTS,
  STORAGE_KEYS,
  THEME,
  LOYALTY_CONFIG,
  VALIDATION,
  FEATURES,
  DEBUG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
}