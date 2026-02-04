// frontend/src/utils/constants.js

/**
 * Application Constants
 * Shared constants used across the application
 */

/**
 * User Roles
 */
export const ROLES = {
  CUSTOMER: 'customer',
  SUPERADMIN: 'superadmin',
  CASHIER: 'cashier',
  CHEF: 'chef',
  WAITER: 'waiter',
}

/**
 * Order Status Constants
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
 * Payment Methods
 */
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi',
  WALLET: 'wallet',
  ONLINE: 'online',
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
 * Discount Types
 */
export const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  BUY_ONE_GET_ONE: 'bogo',
  FLAT: 'flat',
}

/**
 * Offer Types
 */
export const OFFER_TYPES = {
  SEASONAL: 'seasonal',
  PROMOTIONAL: 'promotional',
  FESTIVAL: 'festival',
  CLEARANCE: 'clearance',
  FIRST_ORDER: 'first_order',
  LOYALTY: 'loyalty',
}

/**
 * Menu Item Availability
 */
export const ITEM_AVAILABILITY = {
  IN_STOCK: 'in_stock',
  OUT_OF_STOCK: 'out_of_stock',
  LIMITED: 'limited',
}

/**
 * Dietary Types
 */
export const DIETARY_TYPES = {
  VEG: 'veg',
  NON_VEG: 'non_veg',
  VEGAN: 'vegan',
  GLUTEN_FREE: 'gluten_free',
  DAIRY_FREE: 'dairy_free',
}

/**
 * Spice Levels
 */
export const SPICE_LEVELS = {
  MILD: 'mild',
  MEDIUM: 'medium',
  HOT: 'hot',
  EXTRA_HOT: 'extra_hot',
}

/**
 * Meal Types
 */
export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACKS: 'snacks',
  BEVERAGES: 'beverages',
  DESSERTS: 'desserts',
}

/**
 * Order Types
 */
export const ORDER_TYPES = {
  DINE_IN: 'dine_in',
  TAKEAWAY: 'takeaway',
  DELIVERY: 'delivery',
  TABLE: 'table',
}

/**
 * Notification Types
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
}

/**
 * Toast Positions
 */
export const TOAST_POSITIONS = {
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
  BOTTOM_RIGHT: 'bottom-right',
}

/**
 * Date Range Presets
 */
export const DATE_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  CUSTOM: 'custom',
}

/**
 * Sort Orders
 */
export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
}

/**
 * Sort Fields
 */
export const SORT_FIELDS = {
  NAME: 'name',
  PRICE: 'price',
  DATE: 'date',
  RATING: 'rating',
  POPULARITY: 'popularity',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
}

/**
 * Filter Types
 */
export const FILTER_TYPES = {
  CATEGORY: 'category',
  DIETARY: 'dietary',
  PRICE_RANGE: 'priceRange',
  RATING: 'rating',
  AVAILABILITY: 'availability',
  SPICE_LEVEL: 'spiceLevel',
}

/**
 * Inventory Status
 */
export const INVENTORY_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  REORDER_NEEDED: 'reorder_needed',
}

/**
 * Recipe Status
 */
export const RECIPE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DRAFT: 'draft',
}

/**
 * Transaction Types
 */
export const TRANSACTION_TYPES = {
  SALE: 'sale',
  REFUND: 'refund',
  VOID: 'void',
  ADJUSTMENT: 'adjustment',
}

/**
 * Cash Flow Types
 */
export const CASH_FLOW_TYPES = {
  INFLOW: 'inflow',
  OUTFLOW: 'outflow',
}

/**
 * Report Types
 */
export const REPORT_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  CUSTOM: 'custom',
}

/**
 * User Status
 */
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
}

/**
 * Session Status
 */
export const SESSION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

/**
 * Review Status
 */
export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

/**
 * Rating Values
 */
export const RATING_VALUES = {
  MIN: 1,
  MAX: 5,
}

/**
 * Tip Percentages
 */
export const TIP_PERCENTAGES = [5, 10, 15, 20, 25]

/**
 * Default Pagination
 */
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
}

/**
 * File Size Limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  VIDEO: 50 * 1024 * 1024, // 50MB
}

/**
 * Allowed File Types
 */
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  EXCEL: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
}

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
}

/**
 * API Response Status
 */
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  FAIL: 'fail',
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
  FAVORITES: 'favorites',
  RECENT_SEARCHES: 'recentSearches',
}

/**
 * Currency
 */
export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  LOCALE: 'en-IN',
}

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  FULL: 'MMMM DD, YYYY hh:mm A',
  TIME: 'hh:mm A',
  DATE_TIME: 'DD/MM/YYYY hh:mm A',
  API: 'YYYY-MM-DD',
  TIME_24: 'HH:mm',
}

/**
 * Time Constants
 */
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
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
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[0-9]{10}$/,
}

/**
 * Keyboard Keys
 */
export const KEYS = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  SPACE: ' ',
}

/**
 * Breakpoints (Tailwind default)
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
}

/**
 * Animation Durations (in ms)
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
}

/**
 * Debounce/Throttle Delays (in ms)
 */
export const DELAYS = {
  SEARCH: 300,
  RESIZE: 150,
  SCROLL: 100,
  INPUT: 500,
}

/**
 * Max Lengths
 */
export const MAX_LENGTHS = {
  TITLE: 100,
  DESCRIPTION: 500,
  BIO: 250,
  REVIEW: 1000,
  SPECIAL_INSTRUCTIONS: 200,
}

// Export all constants as default
export default {
  ROLES,
  ORDER_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  TABLE_STATUS,
  DISCOUNT_TYPES,
  OFFER_TYPES,
  ITEM_AVAILABILITY,
  DIETARY_TYPES,
  SPICE_LEVELS,
  MEAL_TYPES,
  ORDER_TYPES,
  NOTIFICATION_TYPES,
  TOAST_POSITIONS,
  DATE_RANGES,
  SORT_ORDER,
  SORT_FIELDS,
  FILTER_TYPES,
  INVENTORY_STATUS,
  RECIPE_STATUS,
  TRANSACTION_TYPES,
  CASH_FLOW_TYPES,
  REPORT_TYPES,
  USER_STATUS,
  SESSION_STATUS,
  REVIEW_STATUS,
  RATING_VALUES,
  TIP_PERCENTAGES,
  DEFAULT_PAGINATION,
  FILE_SIZE_LIMITS,
  ALLOWED_FILE_TYPES,
  HTTP_STATUS,
  API_STATUS,
  STORAGE_KEYS,
  CURRENCY,
  DATE_FORMATS,
  TIME_CONSTANTS,
  VALIDATION,
  KEYS,
  BREAKPOINTS,
  ANIMATION_DURATION,
  DELAYS,
  MAX_LENGTHS,
}