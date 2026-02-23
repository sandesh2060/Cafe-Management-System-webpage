// File: backend/src/shared/utils/constants.js
// 📋 APPLICATION CONSTANTS

module.exports = {
  // ============================================
  // CART CONFIGURATION
  // ============================================
  CART: {
    MAX_QUANTITY: 99,
    MIN_QUANTITY: 1,
    EXPIRY_HOURS: 24,
    SYNC_INTERVAL_MS: 30000, // 30 seconds
    MAX_ITEMS: 50,
  },

  // ============================================
  // ORDER STATUS
  // ============================================
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    SERVED: 'served',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // ============================================
  // PAYMENT STATUS
  // ============================================
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },

  // ============================================
  // TAX & PRICING
  // ============================================
  TAX_RATE: 0.10, // 10%
  
  // ============================================
  // SESSION CONFIGURATION
  // ============================================
  SESSION: {
    TIMEOUT_HOURS: 8,
    CLEANUP_INTERVAL_MS: 3600000, // 1 hour
  },

  // ============================================
  // TABLE STATUS
  // ============================================
  TABLE_STATUS: {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    RESERVED: 'reserved',
    CLEANING: 'cleaning',
    MAINTENANCE: 'maintenance'
  },

  // ============================================
  // CUSTOMER STATUS
  // ============================================
  CUSTOMER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BLOCKED: 'blocked'
  },

  // ============================================
  // MENU ITEM STATUS
  // ============================================
  MENU_ITEM_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ARCHIVED: 'archived'
  },

  // ============================================
  // PAGINATION
  // ============================================
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    DEFAULT_SKIP: 0
  },

  // ============================================
  // ERROR CODES
  // ============================================
  ERROR_CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    DUPLICATE_ERROR: 'DUPLICATE_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    CART_ERROR: 'CART_ERROR',
    ORDER_ERROR: 'ORDER_ERROR'
  },

  // ============================================
  // REGEX PATTERNS
  // ============================================
  REGEX: {
    USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[1-9]\d{1,14}$/,
  },

  // ============================================
  // WEBSOCKET EVENTS
  // ============================================
  SOCKET_EVENTS: {
    // Cart events
    CART_UPDATED: 'cart:updated',
    CART_SYNCED: 'cart:synced',
    
    // Order events
    ORDER_CREATED: 'order:created',
    ORDER_UPDATED: 'order:updated',
    ORDER_STATUS_CHANGED: 'order:status_changed',
    
    // Kitchen events
    KITCHEN_ORDER_RECEIVED: 'kitchen:order_received',
    KITCHEN_ITEM_READY: 'kitchen:item_ready',
    
    // Table events
    TABLE_STATUS_CHANGED: 'table:status_changed',
    TABLE_SESSION_STARTED: 'table:session_started',
    TABLE_SESSION_ENDED: 'table:session_ended'
  }
};