// File: frontend/src/modules/customer/hooks/useCart.js
// 🛒 PRODUCTION-READY CART HOOK - White Screen Bug Fixed
// ✅ Fix 1: retryCount moved to useRef (no longer triggers re-renders/infinite loop)
// ✅ Fix 2: calculateTotals added to useCallback deps properly

import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../../api/axios";
import { getCustomerId } from "../../../shared/utils/session";

export const useCart = () => {
  const customerId = getCustomerId();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ FIX: Use ref instead of state for retryCount
  // State retryCount was in useCallback deps → recreated fetchCart on every retry
  // → triggered useEffect → called fetchCart again → INFINITE LOOP → white screen
  const retryCountRef = useRef(0);

  const [totals, setTotals] = useState({
    subtotal: 0,
    tax: 0,
    total: 0,
    itemCount: 0,
    totalQuantity: 0,
  });

  // ============================================
  // 💰 CALCULATE TOTALS
  // ============================================
  const calculateTotals = useCallback((cartItems) => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.menuItemId?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    setTotals({
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      itemCount: cartItems.length,
      totalQuantity,
    });
  }, []);

  // ============================================
  // 📥 FETCH CART FROM BACKEND (with retry logic)
  // ============================================
  const fetchCart = useCallback(
    async (isRetry = false) => {
      if (!customerId) {
        console.log("⚠️ No customerId - skipping cart fetch");
        setCart([]);
        setLoading(false);
        return;
      }

      console.log("🔍 Using customerId:", customerId);

      try {
        console.log("📥 Fetching cart from backend for customer:", customerId);
        setLoading(true);
        setError(null);

        const response = await api.get(`/customers/${customerId}/cart`);

        if (response.success) {
          const cartData = response.data?.cart || response.cart || [];
          console.log("✅ Cart fetched:", cartData.length, "items");
          setCart(cartData);
          calculateTotals(cartData);
          setError(null);
          retryCountRef.current = 0; // ✅ Reset via ref - no re-render triggered
        }
      } catch (err) {
        console.error("❌ Fetch cart error:", err);

        if (
          err.originalError?.code === "ERR_NETWORK" ||
          err.originalError?.code === "ECONNREFUSED"
        ) {
          if (!isRetry && retryCountRef.current < 3) {
            retryCountRef.current += 1; // ✅ Increment via ref - no re-render triggered
            console.log(`🔄 Retrying... (${retryCountRef.current}/3)`);
            setTimeout(
              () => fetchCart(true),
              2000 * retryCountRef.current,
            );
            return;
          }

          setError(
            "Cannot connect to server. Please check your internet connection.",
          );
        } else {
          setError(err.message || "Failed to load cart");
        }

        setCart([]);
      } finally {
        setLoading(false);
      }
    },
    // ✅ FIX: retryCount removed from deps - using ref now, calculateTotals added
    [customerId, calculateTotals],
  );

  // ============================================
  // 🔄 LOAD CART ON MOUNT
  // ============================================
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ============================================
  // ➕ ADD ITEM TO CART
  // ============================================
  const addToCart = async (menuItem, quantity = 1, customizations = {}) => {
    if (!customerId) {
      setError("Please login to add items to cart");
      return false;
    }

    try {
      console.log("➕ Adding to cart:", menuItem.name, "x", quantity);

      const itemId = menuItem._id || menuItem.id;

      if (!itemId) {
        console.error("❌ No item ID found:", menuItem);
        setError("Invalid menu item");
        return false;
      }

      const response = await api.post(
        `/customers/${customerId}/cart/items`,
        {
          menuItemId: itemId,
          quantity,
          customizations,
        },
      );

      if (response.success) {
        const updatedCart = response.data?.cart || response.cart || [];
        console.log("✅ Item added - cart now has:", updatedCart.length, "items");
        setCart(updatedCart);
        calculateTotals(updatedCart);
        setError(null);
        return { success: true };
      }

      return { success: false };
    } catch (err) {
      console.error("❌ Add to cart error:", err);
      setError(err.message || "Failed to add item");
      return { success: false, error: err.message };
    }
  };

  // ============================================
  // 🔄 UPDATE CART ITEM QUANTITY
  // ============================================
  const updateQuantity = async (cartItemId, newQuantity) => {
    if (!customerId) return false;

    try {
      console.log("🔄 Updating quantity:", cartItemId, "to", newQuantity);

      if (newQuantity === 0) {
        return await removeFromCart(cartItemId);
      }

      const response = await api.put(
        `/customers/${customerId}/cart/items/${cartItemId}`,
        { quantity: newQuantity },
      );

      if (response.success) {
        const updatedCart = response.data?.cart || response.cart || [];
        console.log("✅ Quantity updated");
        setCart(updatedCart);
        calculateTotals(updatedCart);
        return true;
      }
    } catch (err) {
      console.error("❌ Update quantity error:", err);
      setError(err.message || "Failed to update quantity");
      return false;
    }
  };

  // ============================================
  // ➖ REMOVE ITEM FROM CART
  // ============================================
  const removeFromCart = async (cartItemId) => {
    if (!customerId) return false;

    try {
      console.log("➖ Removing from cart:", cartItemId);

      const response = await api.delete(
        `/customers/${customerId}/cart/items/${cartItemId}`,
      );

      if (response.success) {
        const updatedCart = response.data?.cart || response.cart || [];
        console.log(
          "✅ Item removed - cart now has:",
          updatedCart.length,
          "items",
        );
        setCart(updatedCart);
        calculateTotals(updatedCart);
        return true;
      }
    } catch (err) {
      console.error("❌ Remove from cart error:", err);
      setError(err.message || "Failed to remove item");
      return false;
    }
  };

  // ============================================
  // 🗑️ CLEAR CART
  // ============================================
  const clearCart = async () => {
    if (!customerId) return false;

    try {
      console.log("🗑️ Clearing cart");

      const response = await api.delete(`/customers/${customerId}/cart`);

      if (response.success) {
        console.log("✅ Cart cleared");
        setCart([]);
        setTotals({
          subtotal: 0,
          tax: 0,
          total: 0,
          itemCount: 0,
          totalQuantity: 0,
        });
        return true;
      }
    } catch (err) {
      console.error("❌ Clear cart error:", err);
      setError(err.message || "Failed to clear cart");
      return false;
    }
  };

  // ============================================
  // ✅ VALIDATE CART
  // ============================================
  const validateCart = async () => {
    if (!customerId || cart.length === 0) return { isValid: true };

    try {
      console.log("✅ Validating cart");

      const response = await api.post(`/customers/${customerId}/cart/validate`);

      if (response.success) {
        const validationData = response.data || response;

        if (validationData.invalidItems?.length > 0) {
          console.log(
            "⚠️ Some items were removed:",
            validationData.invalidItems,
          );
          setCart(validationData.cart || []);
          calculateTotals(validationData.cart || []);
        }

        return validationData;
      }

      return { isValid: false };
    } catch (err) {
      console.error("❌ Validate cart error:", err);
      return { isValid: false, error: err.message };
    }
  };

  // ============================================
  // 📊 COMPUTED PROPERTIES
  // ============================================
  const getItemCount = useCallback(() => cart.length, [cart]);

  const getTotalQuantity = useCallback(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const isInCart = useCallback(
    (menuItemId) => {
      return cart.some((item) => {
        const itemId = item.menuItemId?._id || item.menuItemId?.id;
        return itemId === menuItemId;
      });
    },
    [cart],
  );

  const getItemQuantity = useCallback(
    (menuItemId) => {
      const item = cart.find((cartItem) => {
        const itemId = cartItem.menuItemId?._id || cartItem.menuItemId?.id;
        return itemId === menuItemId;
      });
      return item ? item.quantity : 0;
    },
    [cart],
  );

  return {
    // State
    cart,
    loading,
    error,
    totals,

    // Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    validateCart,
    refreshCart: fetchCart,

    // Computed
    getItemCount,
    getTotalQuantity,
    isInCart,
    getItemQuantity,

    // Helpers
    isEmpty: cart.length === 0,
    itemCount: cart.length,
    cartItemCount: cart.length,
  };
};