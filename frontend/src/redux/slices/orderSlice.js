// frontend/src/redux/slices/orderSlice.js
import { createSlice } from '@reduxjs/toolkit'

/**
 * Initial state for orders
 */
const initialState = {
  activeOrders: [],
  orderHistory: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  orderStatus: null, // 'pending', 'confirmed', 'preparing', 'ready', 'served', 'completed'
}

/**
 * Order Slice
 * Manages customer orders, order tracking, and order history
 */
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Place order start
    placeOrderStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    
    // Place order success
    placeOrderSuccess: (state, action) => {
      state.isLoading = false
      state.currentOrder = action.payload
      state.activeOrders.push(action.payload)
      state.orderStatus = 'pending'
      state.error = null
    },
    
    // Place order failure
    placeOrderFailure: (state, action) => {
      state.isLoading = false
      state.error = action.payload
    },
    
    // Fetch orders start
    fetchOrdersStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    
    // Fetch orders success
    fetchOrdersSuccess: (state, action) => {
      state.isLoading = false
      state.activeOrders = action.payload.activeOrders || []
      state.orderHistory = action.payload.orderHistory || []
      state.error = null
    },
    
    // Fetch orders failure
    fetchOrdersFailure: (state, action) => {
      state.isLoading = false
      state.error = action.payload
    },
    
    // Update order status
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload
      
      // Update in active orders
      const activeOrderIndex = state.activeOrders.findIndex(
        (order) => order.id === orderId
      )
      
      if (activeOrderIndex >= 0) {
        state.activeOrders[activeOrderIndex].status = status
        
        // If order is completed, move to history
        if (status === 'completed' || status === 'cancelled') {
          const completedOrder = state.activeOrders.splice(activeOrderIndex, 1)[0]
          state.orderHistory.unshift(completedOrder)
        }
      }
      
      // Update current order if it matches
      if (state.currentOrder?.id === orderId) {
        state.currentOrder.status = status
        state.orderStatus = status
      }
    },
    
    // Set current order
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
      state.orderStatus = action.payload?.status || null
    },
    
    // Clear current order
    clearCurrentOrder: (state) => {
      state.currentOrder = null
      state.orderStatus = null
    },
    
    // Add item to order
    addItemToOrder: (state, action) => {
      if (state.currentOrder) {
        state.currentOrder.items.push(action.payload)
      }
    },
    
    // Remove item from order
    removeItemFromOrder: (state, action) => {
      if (state.currentOrder) {
        state.currentOrder.items = state.currentOrder.items.filter(
          (item) => item.id !== action.payload
        )
      }
    },
    
    // Cancel order
    cancelOrderStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    
    cancelOrderSuccess: (state, action) => {
      state.isLoading = false
      const orderId = action.payload
      
      // Remove from active orders
      const orderIndex = state.activeOrders.findIndex((order) => order.id === orderId)
      if (orderIndex >= 0) {
        const cancelledOrder = state.activeOrders.splice(orderIndex, 1)[0]
        cancelledOrder.status = 'cancelled'
        state.orderHistory.unshift(cancelledOrder)
      }
      
      // Clear current order if it was cancelled
      if (state.currentOrder?.id === orderId) {
        state.currentOrder = null
        state.orderStatus = null
      }
    },
    
    cancelOrderFailure: (state, action) => {
      state.isLoading = false
      state.error = action.payload
    },
    
    // Reorder (add previous order items to cart)
    reorder: (state, action) => {
      state.currentOrder = action.payload
    },
    
    // Clear error
    clearOrderError: (state) => {
      state.error = null
    },
    
    // Real-time order update (from WebSocket)
    receiveOrderUpdate: (state, action) => {
      const { orderId, updates } = action.payload
      
      const activeOrderIndex = state.activeOrders.findIndex(
        (order) => order.id === orderId
      )
      
      if (activeOrderIndex >= 0) {
        state.activeOrders[activeOrderIndex] = {
          ...state.activeOrders[activeOrderIndex],
          ...updates,
        }
      }
      
      if (state.currentOrder?.id === orderId) {
        state.currentOrder = { ...state.currentOrder, ...updates }
        state.orderStatus = updates.status || state.orderStatus
      }
    },
  },
})

export const {
  placeOrderStart,
  placeOrderSuccess,
  placeOrderFailure,
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  updateOrderStatus,
  setCurrentOrder,
  clearCurrentOrder,
  addItemToOrder,
  removeItemFromOrder,
  cancelOrderStart,
  cancelOrderSuccess,
  cancelOrderFailure,
  reorder,
  clearOrderError,
  receiveOrderUpdate,
} = orderSlice.actions

export default orderSlice.reducer