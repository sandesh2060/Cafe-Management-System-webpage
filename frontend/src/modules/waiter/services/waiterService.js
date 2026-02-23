// File: frontend/src/modules/waiter/services/waiterService.js
// 🎯 WAITER SERVICE - Complete API integration for waiter operations
// ✅ Tables, Orders, Sessions, Requests, Statistics
// 🔧 FIXED: Updated endpoint paths to match backend routes

import axios from '@/api/axios';

const waiterService = {
  // ============================================
  // 📋 WAITER ORDERS
  // ============================================

  /**
   * Get all orders for waiter's assigned tables
   */
  getWaiterOrders: async (waiterId, params = {}) => {
    try {
      console.log('📡 Fetching waiter orders:', { waiterId, params });
      const response = await axios.get(`/waiter/${waiterId}/orders`, { params });
      return response;
    } catch (error) {
      console.error('❌ Get waiter orders error:', error);
      throw error;
    }
  },

  /**
   * Get orders for a specific table
   */
  getTableOrders: async (tableId, params = {}) => {
    try {
      console.log('📡 Fetching table orders:', { tableId, params });
      const response = await axios.get(`/orders/table/${tableId}`, { params });
      return response;
    } catch (error) {
      console.error('❌ Get table orders error:', error);
      throw error;
    }
  },

  /**
   * Create new order for table
   */
  createOrder: async (orderData, waiterId) => {
    try {
      console.log('📡 Creating order:', { orderData, waiterId });
      const response = await axios.post('/orders', {
        ...orderData,
        takenBy: waiterId,
        type: 'dine-in',
      });
      return response;
    } catch (error) {
      console.error('❌ Create order error:', error);
      throw error;
    }
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId, status, waiterId) => {
    try {
      console.log('📡 Updating order status:', { orderId, status, waiterId });
      const response = await axios.patch(`/waiter/${waiterId}/orders/${orderId}/status`, {
        status
      });
      return response;
    } catch (error) {
      console.error('❌ Update order status error:', error);
      throw error;
    }
  },

  /**
   * Mark order as served
   */
  markOrderServed: async (orderId, waiterId) => {
    try {
      console.log('📡 Marking order as served:', { orderId, waiterId });
      const response = await axios.patch(`/waiter/${waiterId}/orders/${orderId}/served`);
      return response;
    } catch (error) {
      console.error('❌ Mark order served error:', error);
      throw error;
    }
  },

  /**
   * Get order details by ID
   */
  getOrderDetails: async (orderId) => {
    try {
      console.log('📡 Fetching order details:', orderId);
      const response = await axios.get(`/orders/${orderId}`);
      return response;
    } catch (error) {
      console.error('❌ Get order details error:', error);
      throw error;
    }
  },

  // ============================================
  // 🪑 TABLES MANAGEMENT
  // ============================================

  /**
   * Get all tables assigned to waiter
   */
  getAssignedTables: async (waiterId) => {
    try {
      console.log('📡 Fetching assigned tables:', waiterId);
      const response = await axios.get(`/waiter/${waiterId}/tables`);
      return response;
    } catch (error) {
      console.error('❌ Get assigned tables error:', error);
      // If endpoint doesn't exist, try getting all tables and filter
      try {
        const allTables = await axios.get('/tables');
        const tables = allTables.tables || allTables.data?.tables || allTables;
        
        // Filter by assigned waiter if available
        const assignedTables = Array.isArray(tables) 
          ? tables.filter(t => t.assignedTo === waiterId || t.assignedWaiter === waiterId)
          : [];
        
        return { tables: assignedTables };
      } catch (fallbackError) {
        console.error('❌ Fallback get tables error:', fallbackError);
        throw error;
      }
    }
  },

  /**
   * Get table details including current session
   */
  getTableDetails: async (tableId) => {
    try {
      console.log('📡 Fetching table details:', tableId);
      const response = await axios.get(`/tables/${tableId}`);
      return response;
    } catch (error) {
      console.error('❌ Get table details error:', error);
      throw error;
    }
  },

  /**
   * Update table status
   */
  updateTableStatus: async (tableId, status, waiterId) => {
    try {
      console.log('📡 Updating table status:', { tableId, status, waiterId });
      const response = await axios.patch(`/tables/${tableId}/status`, {
        status,
        updatedBy: waiterId,
      });
      return response;
    } catch (error) {
      console.error('❌ Update table status error:', error);
      throw error;
    }
  },

  /**
   * Get table session (active customers)
   */
  getTableSession: async (tableId) => {
    try {
      console.log('📡 Fetching table session:', tableId);
      const response = await axios.get(`/tables/${tableId}/session`);
      return response;
    } catch (error) {
      console.error('❌ Get table session error:', error);
      throw error;
    }
  },

  /**
   * End table session
   */
  endTableSession: async (tableId, sessionId, waiterId) => {
    try {
      console.log('📡 Ending table session:', { tableId, sessionId, waiterId });
      const response = await axios.post(`/tables/${tableId}/session/end`, {
        sessionId,
        endedBy: waiterId,
      });
      return response;
    } catch (error) {
      console.error('❌ End table session error:', error);
      throw error;
    }
  },

  // ============================================
  // 🔔 CUSTOMER REQUESTS
  // ============================================

  /**
   * Get customer assistance requests for waiter's tables
   */
  getCustomerRequests: async (waiterId, params = {}) => {
    try {
      console.log('📡 Fetching customer requests:', { waiterId, params });
      const response = await axios.get(`/waiter/${waiterId}/requests`, { params });
      return response;
    } catch (error) {
      console.error('❌ Get customer requests error:', error);
      // Fallback: return empty array if endpoint doesn't exist
      return { requests: [] };
    }
  },

  /**
   * Mark request as completed
   */
  completeRequest: async (requestId, waiterId) => {
    try {
      console.log('📡 Completing request:', { requestId, waiterId });
      const response = await axios.patch(`/waiter/${waiterId}/requests/${requestId}/complete`);
      return response;
    } catch (error) {
      console.error('❌ Complete request error:', error);
      throw error;
    }
  },

  /**
   * Acknowledge request (mark as seen)
   */
  acknowledgeRequest: async (requestId, waiterId) => {
    try {
      console.log('📡 Acknowledging request:', { requestId, waiterId });
      const response = await axios.patch(`/waiter/${waiterId}/requests/${requestId}/acknowledge`);
      return response;
    } catch (error) {
      console.error('❌ Acknowledge request error:', error);
      throw error;
    }
  },

  // ============================================
  // 📊 STATISTICS & ANALYTICS
  // ============================================

  /**
   * Get waiter statistics (orders, revenue, etc.)
   */
  getWaiterStats: async (waiterId, params = {}) => {
    try {
      console.log('📡 Fetching waiter stats:', { waiterId, params });
      const response = await axios.get(`/waiter/${waiterId}/stats`, { params });
      return response;
    } catch (error) {
      console.error('❌ Get waiter stats error:', error);
      // Return default stats if endpoint doesn't exist
      return {
        ordersToday: 0,
        revenueToday: 0,
        tablesServed: 0,
        averageRating: 0,
      };
    }
  },

  /**
   * Get waiter performance metrics
   */
  getPerformanceMetrics: async (waiterId, period = 'today') => {
    try {
      console.log('📡 Fetching performance metrics:', { waiterId, period });
      const response = await axios.get(`/waiter/${waiterId}/performance`, {
        params: { period }
      });
      return response;
    } catch (error) {
      console.error('❌ Get performance metrics error:', error);
      return {
        ordersCompleted: 0,
        averageServiceTime: 0,
        customerSatisfaction: 0,
        tips: 0,
      };
    }
  },

  // ============================================
  // 💰 BILLING & PAYMENTS
  // ============================================

  /**
   * Generate bill for table
   */
  generateBill: async (tableId, waiterId) => {
    try {
      console.log('📡 Generating bill:', { tableId, waiterId });
      const response = await axios.post('/billing/generate', {
        tableId,
        generatedBy: waiterId,
      });
      return response;
    } catch (error) {
      console.error('❌ Generate bill error:', error);
      throw error;
    }
  },

  /**
   * Get bill for order
   */
  getOrderBill: async (orderId) => {
    try {
      console.log('📡 Fetching order bill:', orderId);
      const response = await axios.get(`/billing/order/${orderId}`);
      return response;
    } catch (error) {
      console.error('❌ Get order bill error:', error);
      throw error;
    }
  },

  /**
   * Process split bill
   */
  processSplitBill: async (billId, splits, waiterId) => {
    try {
      console.log('📡 Processing split bill:', { billId, splits, waiterId });
      const response = await axios.post(`/billing/${billId}/split`, {
        splits,
        processedBy: waiterId,
      });
      return response;
    } catch (error) {
      console.error('❌ Process split bill error:', error);
      throw error;
    }
  },

  // ============================================
  // 📍 LOCATION & ZONE
  // ============================================

  /**
   * Get tables in waiter's zone
   */
  getZoneTables: async (zoneId) => {
    try {
      console.log('📡 Fetching zone tables:', zoneId);
      const response = await axios.get(`/zones/${zoneId}/tables`);
      return response;
    } catch (error) {
      console.error('❌ Get zone tables error:', error);
      throw error;
    }
  },

  /**
   * Update waiter location (for nearest waiter routing)
   */
  updateLocation: async (waiterId, location) => {
    try {
      console.log('📡 Updating waiter location:', { waiterId, location });
      const response = await axios.patch(`/waiter/${waiterId}/location`, {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString(),
      });
      return response;
    } catch (error) {
      console.error('❌ Update location error:', error);
      // Non-critical, just log
      return null;
    }
  },

  // ============================================
  // 🔍 SEARCH & FILTER
  // ============================================

  /**
   * Search orders
   */
  searchOrders: async (waiterId, query) => {
    try {
      console.log('📡 Searching orders:', { waiterId, query });
      const response = await axios.get(`/waiter/${waiterId}/orders/search`, {
        params: { q: query }
      });
      return response;
    } catch (error) {
      console.error('❌ Search orders error:', error);
      throw error;
    }
  },

  /**
   * Filter tables by status
   */
  filterTables: async (waiterId, status) => {
    try {
      console.log('📡 Filtering tables:', { waiterId, status });
      const tables = await waiterService.getAssignedTables(waiterId);
      
      const tablesList = tables.tables || tables.data?.tables || tables;
      
      if (status === 'all') {
        return { tables: tablesList };
      }
      
      const filtered = Array.isArray(tablesList)
        ? tablesList.filter(t => t.status === status)
        : [];
      
      return { tables: filtered };
    } catch (error) {
      console.error('❌ Filter tables error:', error);
      throw error;
    }
  },
};

export default waiterService;