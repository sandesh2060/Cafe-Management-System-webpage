// File: frontend/src/modules/customer/hooks/useCurrentOrder.js
// 🎯 FIXED VERSION - Correct response parsing for YOUR API format
// ✅ Your API returns: { success, data: [...], count, total, hasMore }
// ✅ FIX: "served" status now included in API query AND active filter
//         Previously served orders were excluded at two levels:
//         1. API query param was missing "served"
//         2. activeStatuses filter didn't include "served"
//         Result: canMakePayment was always false even when order was served.

import { useState, useEffect, useCallback, useRef } from 'react';
import { orderAPI } from '../../../api/endpoints';

// Smart refresh intervals based on order status
const REFRESH_INTERVALS = {
  pending:   10000, // 10s - Order just placed, check frequently
  confirmed: 15000, // 15s - Confirmed, moderate checking
  preparing: 20000, // 20s - Being prepared, slower checking
  ready:      5000, // 5s  - Ready! Check very frequently
  served:    10000, // 10s - Served, keep checking for payment status
  completed: 60000, // 60s - Completed, very slow checking
  default:   20000, // 20s - Default fallback
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export const useCurrentOrder = () => {
  const [currentOrder, setCurrentOrder]   = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [refreshing, setRefreshing]       = useState(false);
  const [retryCount, setRetryCount]       = useState(0);

  const intervalRef       = useRef(null);
  const isMountedRef      = useRef(true);
  const lastFetchRef      = useRef(0);
  const retryTimeoutRef   = useRef(null);

  // ──────────────────────────────────────────────────────────────
  // SESSION
  // ──────────────────────────────────────────────────────────────
  const getSessionData = useCallback(() => {
    try {
      const sessionStr = localStorage.getItem('customerSession');
      if (!sessionStr) {
        console.warn('⚠️ No customer session found in localStorage');
        return { customerId: null, tableNumber: null };
      }
      const session = JSON.parse(sessionStr);
      if (!session.customerId) {
        console.warn('⚠️ Customer session missing customerId:', session);
        return { customerId: null, tableNumber: null };
      }
      return { customerId: session.customerId, tableNumber: session.tableNumber || null };
    } catch (err) {
      console.error('❌ Error reading customer session:', err);
      return { customerId: null, tableNumber: null };
    }
  }, []);

  // ──────────────────────────────────────────────────────────────
  // RESPONSE PARSER
  // ──────────────────────────────────────────────────────────────
  const parseOrderResponse = (response) => {
    console.log('🔍 Parsing API response:', response);

    // YOUR ACTUAL API FORMAT: { success, data: [...], count, total, hasMore }
    if (response?.data && Array.isArray(response.data)) {
      console.log('✅ Your API format detected: { success, data: [...], ... }');
      return response.data;
    }

    // Legacy format with "orders" key
    if (response?.orders && Array.isArray(response.orders)) {
      console.log('✅ Legacy format detected: { orders: [...] }');
      return response.orders;
    }

    // Direct array
    if (Array.isArray(response)) {
      console.log('✅ Direct array format detected');
      return response;
    }

    console.warn('⚠️ Unknown response format:', response);
    return [];
  };

  // ──────────────────────────────────────────────────────────────
  // FETCH
  // ──────────────────────────────────────────────────────────────
  const fetchCurrentOrder = useCallback(async (isRefresh = false, retryAttempt = 0) => {
    const { customerId } = getSessionData();

    if (!customerId) {
      console.log('⚠️ No customer ID found - user not logged in');
      setCurrentOrder(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Debounce: skip duplicate fetches within 2s
    const now = Date.now();
    if (now - lastFetchRef.current < 2000 && isRefresh) {
      console.log('⏭️ Skipping duplicate fetch (debounced)');
      return;
    }
    lastFetchRef.current = now;

    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);
      setError(null);

      console.log(`📡 Fetching current order for customer: ${customerId} (attempt ${retryAttempt + 1}/${MAX_RETRIES + 1})`);

      // ✅ FIX 1: "served" added to status filter so served orders are returned
      const response = await orderAPI.getCustomerOrders(customerId, {
        status: 'pending,confirmed,preparing,ready,served',
        limit: 1,
        skip: 0,
      });

      if (!isMountedRef.current) return;

      console.log('📦 Full API Response:', response);

      const orders = parseOrderResponse(response);
      console.log('📋 Parsed orders:', orders);

      // ✅ FIX 2: "served" included in active statuses so served orders
      //           are recognised as current (enables canMakePayment)
      const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served'];
      const activeOrders = orders.filter(order =>
        activeStatuses.includes(order.status?.toLowerCase())
      );

      console.log('🎯 Active orders:', activeOrders);

      if (activeOrders.length > 0) {
        const order = activeOrders[0];

        if (!order._id || !order.orderNumber) {
          console.warn('⚠️ Invalid order data received:', order);
          setCurrentOrder(null);
        } else {
          console.log(`✅ Current order found: #${order.orderNumber} (${order.status})`);
          console.log('📊 Order details:', {
            id:          order._id,
            orderNumber: order.orderNumber,
            status:      order.status,
            items:       order.items?.length || 0,
            total:       order.total,
          });
          setCurrentOrder(order);
          setRetryCount(0);
        }
      } else {
        console.log('ℹ️ No active orders found');
        if (orders.length > 0) {
          console.log('📊 All orders:', orders.map(o => ({
            orderNumber: o.orderNumber,
            status:      o.status,
          })));
        }
        setCurrentOrder(null);
        setRetryCount(0);
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      console.error(`❌ Fetch current order error (attempt ${retryAttempt + 1}):`, err);
      console.error('❌ Error details:', {
        message:  err.message,
        response: err.response?.data,
        status:   err.response?.status,
      });

      const statusCode    = err.response?.status;
      const errorMessage  = err.response?.data?.message || err.message || 'Failed to fetch current order';

      // 404 just means no orders — not a real error
      if (statusCode === 404) {
        console.log('ℹ️ 404 response - no active orders');
        setCurrentOrder(null);
        setError(null);
        setRetryCount(0);
        return;
      }

      // Retry logic for transient errors
      if (retryAttempt < MAX_RETRIES) {
        console.log(`🔄 Retrying in ${RETRY_DELAY}ms... (${retryAttempt + 1}/${MAX_RETRIES})`);
        setRetryCount(retryAttempt + 1);
        retryTimeoutRef.current = setTimeout(() => {
          fetchCurrentOrder(isRefresh, retryAttempt + 1);
        }, RETRY_DELAY);
      } else {
        console.error('❌ Max retries reached, giving up');
        setError(errorMessage);
        setRetryCount(0);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [getSessionData]);

  // ──────────────────────────────────────────────────────────────
  // PUBLIC ACTIONS
  // ──────────────────────────────────────────────────────────────
  const refresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered by user');
    fetchCurrentOrder(true);
  }, [fetchCurrentOrder]);

  const clearOrder = useCallback(() => {
    console.log('🗑️ Clearing current order from state');
    setCurrentOrder(null);
    setError(null);
    setRetryCount(0);
  }, []);

  // ──────────────────────────────────────────────────────────────
  // INITIAL FETCH
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true;
    console.log('🚀 useCurrentOrder hook mounted - fetching initial order');

    const initTimer = setTimeout(() => fetchCurrentOrder(), 100);

    return () => {
      console.log('👋 useCurrentOrder hook unmounting - cleaning up');
      isMountedRef.current = false;
      clearTimeout(initTimer);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [fetchCurrentOrder]);

  // ──────────────────────────────────────────────────────────────
  // SMART AUTO-REFRESH
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const { customerId } = getSessionData();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!customerId || error) {
      if (!customerId) console.log('⏸️ Auto-refresh paused - no customer ID');
      if (error)       console.log('⏸️ Auto-refresh paused - error state');
      return;
    }

    const interval = currentOrder
      ? REFRESH_INTERVALS[currentOrder.status] || REFRESH_INTERVALS.default
      : REFRESH_INTERVALS.default;

    console.log(`⏰ Auto-refresh enabled: ${interval}ms (status: ${currentOrder?.status || 'checking'})`);

    intervalRef.current = setInterval(() => {
      console.log(`⏰ Auto-refresh tick (interval: ${interval}ms)`);
      fetchCurrentOrder(true);
    }, interval);

    return () => {
      if (intervalRef.current) {
        console.log('🛑 Clearing auto-refresh interval');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentOrder?.status, error, fetchCurrentOrder, getSessionData]);

  // ──────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ──────────────────────────────────────────────────────────────
  const getProgress = useCallback(() => {
    if (!currentOrder) return 0;
    const statusProgress = {
      pending:   15,
      confirmed: 35,
      preparing: 65,
      ready:     90,
      served:    100,
      completed: 100,
    };
    return statusProgress[currentOrder.status] || 0;
  }, [currentOrder]);

  const getEstimatedTime = useCallback(() => {
    if (!currentOrder) return 0;
    const statusTimeEstimates = {
      pending:   15,
      confirmed: 12,
      preparing:  8,
      ready:      2,
      served:     0,
      completed:  0,
    };
    const basePrepTime = currentOrder.estimatedPrepTime
      || statusTimeEstimates[currentOrder.status]
      || 15;
    const orderAge = Math.floor(
      (Date.now() - new Date(currentOrder.createdAt).getTime()) / 60000
    );
    return Math.max(0, basePrepTime - orderAge);
  }, [currentOrder]);

  const getStatusInfo = useCallback(() => {
    if (!currentOrder) return null;
    const statusMap = {
      pending: {
        label:   'Order Received',
        color:   'text-info',
        bgColor: 'bg-info/10',
        icon:    '📝',
        message: 'Your order has been received',
        pulse:   true,
      },
      confirmed: {
        label:   'Order Confirmed',
        color:   'text-brand',
        bgColor: 'bg-brand/10',
        icon:    '✅',
        message: 'Kitchen has confirmed your order',
        pulse:   false,
      },
      preparing: {
        label:   'Being Prepared',
        color:   'text-warning',
        bgColor: 'bg-warning/10',
        icon:    '👨‍🍳',
        message: 'Chef is preparing your food',
        pulse:   true,
      },
      ready: {
        label:   'Ready to Serve',
        color:   'text-success',
        bgColor: 'bg-success/10',
        icon:    '🔔',
        message: 'Your order is ready!',
        pulse:   true,
      },
      served: {
        label:   'Served',
        color:   'text-success',
        bgColor: 'bg-success/10',
        icon:    '🎉',
        message: 'Enjoy your meal!',
        pulse:   false,
      },
      completed: {
        label:   'Completed',
        color:   'text-text-tertiary',
        bgColor: 'bg-bg-tertiary',
        icon:    '✨',
        message: 'Order completed',
        pulse:   false,
      },
    };
    return statusMap[currentOrder.status] || statusMap['pending'];
  }, [currentOrder]);

  const isOrderComplete = useCallback(() => {
    if (!currentOrder) return false;
    return ['served', 'completed', 'cancelled'].includes(currentOrder.status);
  }, [currentOrder]);

  const canCancelOrder = useCallback(() => {
    if (!currentOrder) return false;
    return ['pending', 'confirmed'].includes(currentOrder.status);
  }, [currentOrder]);

  // ──────────────────────────────────────────────────────────────
  // RETURN API
  // ──────────────────────────────────────────────────────────────
  return {
    // State
    currentOrder,
    loading,
    refreshing,
    error,
    retryCount,

    // Computed values
    hasActiveOrder:  !!currentOrder,
    progress:        getProgress(),
    estimatedTime:   getEstimatedTime(),
    statusInfo:      getStatusInfo(),
    isOrderComplete: isOrderComplete(),
    canCancelOrder:  canCancelOrder(),

    // Actions
    refresh,
    clearOrder,
  };
};

export default useCurrentOrder;