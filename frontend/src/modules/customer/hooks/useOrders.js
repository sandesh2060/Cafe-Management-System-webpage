// File: frontend/src/modules/customer/hooks/useOrders.js
// ✅ PRODUCTION-PERFECT: Fixed data extraction and error handling

import { useState, useEffect, useCallback, useRef } from 'react';
import { orderAPI } from '../../../api/endpoints';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isMountedRef = useRef(true);

  // Get customer ID from session
  const getCustomerId = useCallback(() => {
    try {
      const session = localStorage.getItem('customerSession');
      if (session) {
        const parsed = JSON.parse(session);
        return parsed.customerId;
      }
    } catch (err) {
      console.error('❌ Error getting customer ID:', err);
    }
    return null;
  }, []);

  /**
   * Transform order data from backend format
   */
  const transformOrder = useCallback((order) => {
    return {
      id: order._id || order.id,
      orderNumber: order.orderNumber,
      items: (order.items || []).map(item => ({
        id: item._id || item.id,
        name: item.name || item.menuItemId?.name || 'Unknown Item',
        quantity: item.quantity || 1,
        price: item.price || item.menuItemId?.price || 0,
        customizations: item.customizations || {},
        specialInstructions: item.specialInstructions || null,
      })),
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      discount: order.discount || 0,
      total: order.total || 0,
      status: order.status || 'pending',
      paymentStatus: order.paymentStatus || 'pending',
      paymentMethod: order.paymentMethod || null,
      notes: order.specialInstructions || order.notes || null,
      tableId: order.tableId,
      customerId: order.customerId,
      estimatedPrepTime: order.estimatedPrepTime || 15,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      timeline: order.timeline || [],
    };
  }, []);

  /**
   * ✅ FIXED: Fetch customer orders with proper error handling
   */
  const fetchOrders = useCallback(async (params = {}) => {
    const customerId = getCustomerId();
    
    if (!customerId) {
      console.warn('⚠️ No customer ID found - skipping fetch');
      setError('No customer session found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📡 Fetching orders for customer:', customerId, 'with params:', params);

      // ✅ CRITICAL: orderAPI.getCustomerOrders returns response.data directly
      // Backend controller sends: successResponse(res, { orders: [...], total: 5 })
      // After axios interceptor: { success: true, orders: [...], total: 5, message: '...' }
      const response = await orderAPI.getCustomerOrders(customerId, params);

      console.log('📦 Raw response from API:', response);

      if (!isMountedRef.current) return;

      // ✅ CRITICAL FIX: Check for both response formats
      let ordersArray = [];
      
      if (response.orders && Array.isArray(response.orders)) {
        // Standard format: { success: true, orders: [...], total: 5 }
        ordersArray = response.orders;
      } else if (response.data?.orders && Array.isArray(response.data.orders)) {
        // Nested format: { data: { orders: [...], total: 5 } }
        ordersArray = response.data.orders;
      } else if (Array.isArray(response)) {
        // Direct array: [...]
        ordersArray = response;
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        setOrders([]);
        setActiveOrder(null);
        return;
      }

      console.log(`✅ Found ${ordersArray.length} orders`);

      if (ordersArray.length === 0) {
        console.log('ℹ️ No orders found for customer');
        setOrders([]);
        setActiveOrder(null);
        return;
      }

      // Transform and sort orders
      const transformedOrders = ordersArray.map(transformOrder);
      
      transformedOrders.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      console.log('✅ Transformed orders:', transformedOrders);

      setOrders(transformedOrders);

      // Find active order (not completed or cancelled)
      const active = transformedOrders.find(
        order => !['completed', 'cancelled'].includes(order.status)
      );
      
      setActiveOrder(active || null);
      console.log('🔄 Active order:', active?.orderNumber || 'None');

    } catch (err) {
      if (!isMountedRef.current) return;
      
      console.error('❌ Fetch orders error:', err);
      
      // ✅ CRITICAL: Handle 404 gracefully (no orders is not an error)
      if (err.status === 404 || err.response?.status === 404) {
        console.log('ℹ️ No orders found (404) - setting empty array');
        setOrders([]);
        setActiveOrder(null);
        setError(null); // Don't show error for empty orders
      } else {
        const errorMsg = err.message || err.response?.data?.message || 'Failed to fetch orders';
        console.error('❌ Setting error:', errorMsg);
        setError(errorMsg);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [getCustomerId, transformOrder]);

  /**
   * Get order by ID
   */
  const getOrderById = useCallback(async (orderId) => {
    try {
      console.log('🔍 Fetching order:', orderId);
      
      const response = await orderAPI.getById(orderId);
      console.log('📦 Get order response:', response);

      // Handle different response formats
      const order = response.order || response.data?.order || response;
      
      if (order && order._id) {
        return transformOrder(order);
      }
      
      return null;
    } catch (err) {
      console.error('❌ Get order error:', err);
      return null;
    }
  }, [transformOrder]);

  /**
   * Cancel order
   */
  const cancelOrder = useCallback(async (orderId, reason = '') => {
    try {
      setLoading(true);
      
      console.log('🗑️ Cancelling order:', orderId);
      
      const response = await orderAPI.cancel(orderId, reason);

      if (response && response.success !== false) {
        // Refresh orders after cancellation
        await fetchOrders();
        
        return {
          success: true,
          message: response.message || 'Order cancelled successfully',
        };
      } else {
        throw new Error(response?.error || 'Failed to cancel order');
      }
    } catch (err) {
      console.error('❌ Cancel order error:', err);
      return {
        success: false,
        error: err.message || 'Failed to cancel order',
      };
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  /**
   * Get order history (completed orders only)
   */
  const getOrderHistory = useCallback(async (limit = 10) => {
    return await fetchOrders({ 
      status: 'completed',
      limit,
      skip: 0,
    });
  }, [fetchOrders]);

  /**
   * Get pending orders
   */
  const getPendingOrders = useCallback(async () => {
    return await fetchOrders({ 
      status: 'pending',
    });
  }, [fetchOrders]);

  /**
   * Track order status
   */
  const trackOrder = useCallback(async (orderId) => {
    try {
      const order = await getOrderById(orderId);
      
      if (order) {
        return {
          success: true,
          order,
          statusSteps: getOrderStatusSteps(order.status),
        };
      }
      
      return {
        success: false,
        error: 'Order not found',
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Failed to track order',
      };
    }
  }, [getOrderById]);

  /**
   * Get order status steps for tracking UI
   */
  const getOrderStatusSteps = (currentStatus) => {
    const steps = [
      { status: 'pending', label: 'Order Placed', icon: '📝', progress: 20 },
      { status: 'confirmed', label: 'Confirmed', icon: '✅', progress: 40 },
      { status: 'preparing', label: 'Preparing', icon: '👨‍🍳', progress: 60 },
      { status: 'ready', label: 'Ready', icon: '🔔', progress: 80 },
      { status: 'served', label: 'Served', icon: '🍽️', progress: 100 },
    ];

    const statusIndex = steps.findIndex(step => step.status === currentStatus);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= statusIndex,
      active: index === statusIndex,
    }));
  };

  /**
   * Calculate order statistics
   */
  const getOrderStats = useCallback(() => {
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
    const averageOrderValue = completedOrders.length > 0 
      ? totalSpent / completedOrders.length 
      : 0;

    return {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      totalSpent: Number(totalSpent.toFixed(2)),
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      pendingOrders: orders.filter(o => 
        !['completed', 'cancelled'].includes(o.status)
      ).length,
      activeOrders: orders.filter(o => 
        ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
      ).length,
    };
  }, [orders]);

  /**
   * Initial load
   */
  useEffect(() => {
    isMountedRef.current = true;
    console.log('🚀 useOrders mounted, fetching orders');
    fetchOrders();

    return () => {
      console.log('👋 useOrders unmounting');
      isMountedRef.current = false;
    };
  }, [fetchOrders]);

  return {
    // State
    orders,
    activeOrder,
    loading,
    error,

    // Actions
    fetchOrders,
    getOrderById,
    cancelOrder,
    getOrderHistory,
    getPendingOrders,
    trackOrder,
    getOrderStats,
    
    // Alias
    refetch: fetchOrders,
  };
};

export default useOrders;