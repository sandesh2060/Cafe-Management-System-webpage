// File: frontend/src/modules/waiter/hooks/useWaiterOrders.js
// 📋 WAITER ORDERS HOOK - Manage orders with real-time updates
// ✅ Sound notifications, location-based routing, order status updates

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import waiterService from '../services/waiterService';
import notificationService from '../services/notificationService';
import socketService from '@/shared/services/socketService';

export const useWaiterOrders = (waiterId) => {
  const [orders, setOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    preparing: 0,
    ready: 0,
    served: 0
  });

  const isMountedRef = useRef(true);
  const socketConnectedRef = useRef(false);
  const notifiedOrdersRef = useRef(new Set()); // Track which orders we've notified about

  /**
   * Transform order data
   */
  const transformOrder = useCallback((order) => {
    return {
      id: order._id || order.id,
      orderNumber: order.orderNumber,
      tableId: order.tableId,
      tableNumber: order.tableNumber || order.table?.number,
      customerId: order.customerId,
      customerName: order.customerName || order.customer?.name,
      items: (order.items || []).map(item => ({
        id: item._id || item.id,
        name: item.name || item.menuItemId?.name || 'Unknown Item',
        quantity: item.quantity || 1,
        price: item.price || 0,
        status: item.status || 'pending',
        customizations: item.customizations || {},
        specialInstructions: item.specialInstructions || null,
      })),
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      total: order.total || 0,
      status: order.status || 'pending',
      takenBy: order.takenBy,
      estimatedPrepTime: order.estimatedPrepTime || 15,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      timeline: order.timeline || [],
    };
  }, []);

  /**
   * Fetch waiter orders
   */
  const fetchOrders = useCallback(async (params = {}) => {
    if (!waiterId) {
      console.warn('⚠️ No waiter ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📡 Fetching orders for waiter:', waiterId, params);
      const response = await waiterService.getWaiterOrders(waiterId, params);

      if (!isMountedRef.current) return;

      // Handle different response formats
      let ordersArray = [];
      if (response.orders && Array.isArray(response.orders)) {
        ordersArray = response.orders;
      } else if (response.data?.orders && Array.isArray(response.data.orders)) {
        ordersArray = response.data.orders;
      } else if (Array.isArray(response)) {
        ordersArray = response;
      }

      console.log(`✅ Found ${ordersArray.length} orders`);

      // Transform orders
      const transformedOrders = ordersArray.map(transformOrder);
      
      // Sort by creation date (newest first)
      transformedOrders.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(transformedOrders);

      // Filter active orders (not completed/cancelled)
      const active = transformedOrders.filter(
        order => !['completed', 'cancelled'].includes(order.status)
      );
      setActiveOrders(active);

      // Update stats
      updateStats(transformedOrders);

    } catch (err) {
      if (!isMountedRef.current) return;
      
      console.error('❌ Fetch orders error:', err);
      
      // Handle 404 gracefully
      if (err.response?.status === 404 || err.status === 404) {
        setOrders([]);
        setActiveOrders([]);
        setError(null);
      } else {
        const errorMsg = err.message || 'Failed to fetch orders';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [waiterId, transformOrder]);

  /**
   * Update statistics
   */
  const updateStats = useCallback((ordersArray) => {
    const stats = {
      total: ordersArray.length,
      pending: ordersArray.filter(o => o.status === 'pending').length,
      preparing: ordersArray.filter(o => o.status === 'preparing').length,
      ready: ordersArray.filter(o => o.status === 'ready').length,
      served: ordersArray.filter(o => o.status === 'served').length,
    };
    
    setStats(stats);
    console.log('📊 Order stats:', stats);
  }, []);

  /**
   * Get table orders
   */
  const getTableOrders = useCallback(async (tableId, params = {}) => {
    try {
      console.log('📡 Fetching orders for table:', tableId);
      const response = await waiterService.getTableOrders(tableId, params);
      
      let ordersArray = [];
      if (response.orders && Array.isArray(response.orders)) {
        ordersArray = response.orders;
      } else if (Array.isArray(response)) {
        ordersArray = response;
      }

      return ordersArray.map(transformOrder);
    } catch (err) {
      console.error('❌ Get table orders error:', err);
      toast.error('Failed to fetch table orders');
      return [];
    }
  }, [transformOrder]);

  /**
   * Create order for table
   */
  const createOrder = useCallback(async (orderData) => {
    try {
      console.log('📝 Creating order:', orderData);
      
      const response = await waiterService.createOrder(orderData, waiterId);

      if (response.success !== false) {
        toast.success(`Order created successfully! Order #${response.order?.orderNumber}`);
        
        // Refresh orders
        await fetchOrders();
        
        return {
          success: true,
          order: response.order || response.data?.order
        };
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('❌ Create order error:', err);
      toast.error(err.message || 'Failed to create order');
      return { success: false, error: err.message };
    }
  }, [waiterId, fetchOrders]);

  /**
   * Update order status
   */
  const updateOrderStatus = useCallback(async (orderId, status) => {
    try {
      console.log('🔄 Updating order status:', { orderId, status });
      
      const response = await waiterService.updateOrderStatus(orderId, status, waiterId);

      if (response.success !== false) {
        // Update local state
        setOrders(prev =>
          prev.map(order =>
            (order.id === orderId || order._id === orderId)
              ? { ...order, status }
              : order
          )
        );

        // Update active orders
        setActiveOrders(prev =>
          prev.map(order =>
            (order.id === orderId || order._id === orderId)
              ? { ...order, status }
              : order
          ).filter(o => !['completed', 'cancelled'].includes(o.status))
        );

        toast.success(`Order status updated to ${status}`);
        
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('❌ Update order status error:', err);
      toast.error(err.message || 'Failed to update order status');
      return { success: false, error: err.message };
    }
  }, [waiterId]);

  /**
   * Mark order as served
   */
  const markOrderServed = useCallback(async (orderId) => {
    try {
      console.log('✅ Marking order as served:', orderId);
      
      const response = await waiterService.markOrderServed(orderId, waiterId);

      if (response.success !== false) {
        // Update local state
        setOrders(prev =>
          prev.map(order =>
            (order.id === orderId || order._id === orderId)
              ? { ...order, status: 'served' }
              : order
          )
        );

        // Remove from active orders
        setActiveOrders(prev =>
          prev.filter(order => 
            order.id !== orderId && order._id !== orderId
          )
        );

        toast.success('Order marked as served! 🍽️');
        
        // Refresh orders
        await fetchOrders();
        
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to mark as served');
      }
    } catch (err) {
      console.error('❌ Mark order served error:', err);
      toast.error(err.message || 'Failed to mark order as served');
      return { success: false, error: err.message };
    }
  }, [waiterId, fetchOrders]);

  /**
   * Setup WebSocket for real-time updates
   */
  useEffect(() => {
    if (!waiterId || socketConnectedRef.current) return;

    const socket = socketService.connect();
    if (!socket) {
      console.warn('⚠️ Socket service not available');
      return;
    }

    // Join waiter room
    socketService.joinRoom(`waiter:${waiterId}`);
    socketConnectedRef.current = true;

    // ============================================
    // 🔔 NEW ORDER NOTIFICATION
    // ============================================
    socketService.on('order:new', (data) => {
      console.log('🆕 New order received:', data);
      
      const orderId = data.order?._id || data.order?.id;
      
      // Check if we've already notified about this order
      if (notifiedOrdersRef.current.has(orderId)) {
        console.log('ℹ️ Already notified about this order');
        return;
      }

      // Mark as notified
      notifiedOrdersRef.current.add(orderId);

      // Play notification sound
      notificationService.notifyNewOrder(
        data.order,
        data.order.tableNumber || data.tableNumber
      );

      // Vibrate (mobile)
      notificationService.vibrate([200, 100, 200]);

      // Refresh orders
      fetchOrders();
    });

    // ============================================
    // 🔔 ORDER READY NOTIFICATION
    // ============================================
    socketService.on('order:ready', (data) => {
      console.log('✅ Order ready:', data);
      
      // Play notification sound
      notificationService.notifyOrderReady(
        data.order,
        data.order.tableNumber || data.tableNumber
      );

      // Update local state
      setOrders(prev =>
        prev.map(order =>
          (order.id === data.order._id || order._id === data.order._id)
            ? { ...order, status: 'ready' }
            : order
        )
      );

      setActiveOrders(prev =>
        prev.map(order =>
          (order.id === data.order._id || order._id === data.order._id)
            ? { ...order, status: 'ready' }
            : order
        )
      );
    });

    // ============================================
    // ORDER STATUS UPDATE
    // ============================================
    socketService.on('order:statusChanged', (data) => {
      console.log('🔄 Order status changed:', data);
      
      setOrders(prev =>
        prev.map(order =>
          (order.id === data.orderId || order._id === data.orderId)
            ? { ...order, status: data.status }
            : order
        )
      );

      setActiveOrders(prev =>
        prev.map(order =>
          (order.id === data.orderId || order._id === data.orderId)
            ? { ...order, status: data.status }
            : order
        ).filter(o => !['completed', 'cancelled'].includes(o.status))
      );
    });

    return () => {
      if (socketConnectedRef.current) {
        socketService.leaveRoom(`waiter:${waiterId}`);
        socketService.off('order:new');
        socketService.off('order:ready');
        socketService.off('order:statusChanged');
        socketConnectedRef.current = false;
      }
    };
  }, [waiterId, fetchOrders]);

  /**
   * Initial fetch
   */
  useEffect(() => {
    isMountedRef.current = true;
    fetchOrders();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchOrders]);

  /**
   * Auto-refresh every 30 seconds (for active orders)
   */
  useEffect(() => {
    if (activeOrders.length > 0) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing orders...');
        fetchOrders();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [activeOrders.length, fetchOrders]);

  return {
    // State
    orders,
    activeOrders,
    loading,
    error,
    stats,

    // Actions
    fetchOrders,
    getTableOrders,
    createOrder,
    updateOrderStatus,
    markOrderServed,
    
    // Alias
    refetch: fetchOrders,
  };
};

export default useWaiterOrders;