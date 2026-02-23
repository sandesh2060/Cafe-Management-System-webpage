// ================================================================
// FILE: frontend/src/modules/customer/hooks/useOrderSession.js
// ORDER SESSION HOOK - Manage Active Order
//
// BUGS FIXED:
// ✅ canMakePayment was checking session?.allItemsServed === true
//    but the backend never sends that field — always false.
// ✅ canAddItems was checking session?.canAddItems === true
//    but the backend never sends that field — always false.
// ✅ Both are now derived from the actual order/item status data
//    using a 3-layer fallback so it works regardless of API shape.
// ================================================================

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// ─────────────────────────────────────────────────────────────────
// DERIVE canMakePayment from whatever shape the session comes back as
//
// Handles 3 cases:
//   1. Backend sends session.allItemsServed (ideal, future-proof)
//   2. Backend sends session.items[] with per-item status
//   3. Backend sends session.status (order-level status)
// ─────────────────────────────────────────────────────────────────
const deriveCanMakePayment = (session) => {
  if (!session) return false;

  // Case 1: explicit backend flag (keep supporting it if added later)
  if (typeof session.allItemsServed === 'boolean') {
    return session.allItemsServed;
  }

  // Case 2: per-item status array — all items must be 'served'
  if (Array.isArray(session.items) && session.items.length > 0) {
    const allItemsServed = session.items.every(
      item => item.status === 'served'
    );
    if (allItemsServed) return true;
  }

  // Case 3: order-level status — 'served' means ready for payment
  const orderStatus = (session.status || session.orderStatus || '').toLowerCase();
  if (orderStatus === 'served') return true;

  // Case 4: paymentStatus is still pending and order is served
  // (covers the exact shape in your DB screenshot)
  if (
    orderStatus === 'served' &&
    (session.paymentStatus === 'pending' || !session.paymentStatus)
  ) {
    return true;
  }

  return false;
};

// ─────────────────────────────────────────────────────────────────
// DERIVE canAddItems
//
// Can add items when order is still in an early stage:
//   pending / confirmed — kitchen hasn't started yet
// Cannot add once preparing/ready/served/completed.
// ─────────────────────────────────────────────────────────────────
const deriveCanAddItems = (session) => {
  if (!session) return false;

  // Case 1: explicit backend flag
  if (typeof session.canAddItems === 'boolean') {
    return session.canAddItems;
  }

  // Case 2: derive from order status
  const orderStatus = (session.status || session.orderStatus || '').toLowerCase();
  return ['pending', 'confirmed'].includes(orderStatus);
};

// ─────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────
export const useOrderSession = (customerId, tableNumber) => {
  const [session, setSession]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchSession = useCallback(async () => {
    if (!customerId || !tableNumber) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('/api/orders/session/active', {
        params: { customerId, tableNumber },
      });

      if (response.data.success) {
        const data = response.data.data;
        console.log('📦 Session data received:', data);
        console.log('📊 Order status:', data?.status);
        console.log('📊 Items:', data?.items?.map(i => ({ name: i.name, status: i.status })));
        setSession(data);
      }
    } catch (err) {
      console.error('Fetch session error:', err);
      // 404 = no active session, not a real error
      if (err.response?.status === 404) {
        setSession(null);
        setError(null);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch session');
      }
    } finally {
      setLoading(false);
    }
  }, [customerId, tableNumber]);

  const addItems = async (items) => {
    try {
      if (!session?.orderId) throw new Error('No active order session');

      const response = await axios.post('/api/orders/session/add-items', {
        orderId: session.orderId,
        items,
      });

      if (response.data.success) {
        toast.success(`${items.length} items added to your order! 🎉`);
        setRefreshTrigger(prev => prev + 1);
        return { success: true, addedItems: response.data.data.addedItems };
      }
    } catch (err) {
      console.error('Add items error:', err);
      toast.error(err.response?.data?.message || 'Failed to add items');
      return { success: false, error: err.response?.data?.message };
    }
  };

  const getStats = async () => {
    try {
      if (!session?.orderId) return null;
      const response = await axios.get(`/api/orders/${session.orderId}/stats`);
      return response.data.data;
    } catch (err) {
      console.error('Get stats error:', err);
      return null;
    }
  };

  const refresh = () => setRefreshTrigger(prev => prev + 1);

  // Initial fetch + re-fetch on refresh trigger
  useEffect(() => {
    fetchSession();
  }, [fetchSession, refreshTrigger]);

  // Auto-refresh — faster when order is served (waiting for payment)
  useEffect(() => {
    if (!session?.orderId) return;

    const status = (session.status || '').toLowerCase();
    const interval = status === 'served' ? 5000 : 10000;

    const timer = setInterval(() => {
      fetchSession();
    }, interval);

    return () => clearInterval(timer);
  }, [session?.orderId, session?.status, fetchSession]);

  // ── Derived values (computed fresh every render from session) ──
  const canMakePayment  = deriveCanMakePayment(session);
  const canAddItems     = deriveCanAddItems(session);

  // Debug log so you can verify in console
  console.log('🎯 useOrderSession computed:', {
    status:         session?.status,
    canMakePayment,
    canAddItems,
    hasActiveOrder: !!(session?.orderId || session?._id),
  });

  return {
    session,
    loading,
    error,
    addItems,
    getStats,
    canMakePayment,
    canAddItems,
    refresh,
    hasActiveOrder: !!(session?.orderId || session?._id),
  };
};