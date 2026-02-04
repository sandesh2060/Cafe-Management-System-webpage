// frontend/src/redux/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit'

/**
 * Initial state for cart
 */
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  tableNumber: null,
  sessionId: null,
  appliedOffer: null,
  appliedDiscount: null,
}

/**
 * Cart Slice
 * Manages shopping cart items, quantities, and pricing
 */
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add item to cart
    addToCart: (state, action) => {
      const { item, quantity = 1, customizations = [] } = action.payload
      
      // Check if item with same customizations exists
      const existingItemIndex = state.items.findIndex(
        (cartItem) =>
          cartItem.id === item.id &&
          JSON.stringify(cartItem.customizations) === JSON.stringify(customizations)
      )
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        state.items[existingItemIndex].quantity += quantity
      } else {
        // Add new item
        state.items.push({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity,
          customizations,
          subtotal: item.price * quantity,
        })
      }
      
      // Recalculate totals
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
      state.totalPrice = state.items.reduce((sum, item) => sum + item.subtotal, 0)
    },
    
    // Remove item from cart
    removeFromCart: (state, action) => {
      const { itemId, customizations } = action.payload
      
      state.items = state.items.filter(
        (item) =>
          !(
            item.id === itemId &&
            JSON.stringify(item.customizations) === JSON.stringify(customizations)
          )
      )
      
      // Recalculate totals
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
      state.totalPrice = state.items.reduce((sum, item) => sum + item.subtotal, 0)
    },
    
    // Update item quantity
    updateQuantity: (state, action) => {
      const { itemId, customizations, quantity } = action.payload
      
      const itemIndex = state.items.findIndex(
        (item) =>
          item.id === itemId &&
          JSON.stringify(item.customizations) === JSON.stringify(customizations)
      )
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          state.items.splice(itemIndex, 1)
        } else {
          state.items[itemIndex].quantity = quantity
          state.items[itemIndex].subtotal = state.items[itemIndex].price * quantity
        }
        
        // Recalculate totals
        state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
        state.totalPrice = state.items.reduce((sum, item) => sum + item.subtotal, 0)
      }
    },
    
    // Increment quantity
    incrementQuantity: (state, action) => {
      const { itemId, customizations } = action.payload
      
      const item = state.items.find(
        (item) =>
          item.id === itemId &&
          JSON.stringify(item.customizations) === JSON.stringify(customizations)
      )
      
      if (item) {
        item.quantity += 1
        item.subtotal = item.price * item.quantity
        
        // Recalculate totals
        state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
        state.totalPrice = state.items.reduce((sum, item) => sum + item.subtotal, 0)
      }
    },
    
    // Decrement quantity
    decrementQuantity: (state, action) => {
      const { itemId, customizations } = action.payload
      
      const itemIndex = state.items.findIndex(
        (item) =>
          item.id === itemId &&
          JSON.stringify(item.customizations) === JSON.stringify(customizations)
      )
      
      if (itemIndex >= 0) {
        if (state.items[itemIndex].quantity > 1) {
          state.items[itemIndex].quantity -= 1
          state.items[itemIndex].subtotal =
            state.items[itemIndex].price * state.items[itemIndex].quantity
        } else {
          // Remove item if quantity becomes 0
          state.items.splice(itemIndex, 1)
        }
        
        // Recalculate totals
        state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
        state.totalPrice = state.items.reduce((sum, item) => sum + item.subtotal, 0)
      }
    },
    
    // Clear cart
    clearCart: (state) => {
      state.items = []
      state.totalItems = 0
      state.totalPrice = 0
      state.appliedOffer = null
      state.appliedDiscount = null
    },
    
    // Set table number
    setTableNumber: (state, action) => {
      state.tableNumber = action.payload
    },
    
    // Set session ID
    setSessionId: (state, action) => {
      state.sessionId = action.payload
    },
    
    // Apply offer
    applyOffer: (state, action) => {
      state.appliedOffer = action.payload
    },
    
    // Remove offer
    removeOffer: (state) => {
      state.appliedOffer = null
    },
    
    // Apply discount
    applyDiscount: (state, action) => {
      state.appliedDiscount = action.payload
    },
    
    // Remove discount
    removeDiscount: (state) => {
      state.appliedDiscount = null
    },
    
    // Load cart from storage (for persistence)
    loadCart: (state, action) => {
      return { ...state, ...action.payload }
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  setTableNumber,
  setSessionId,
  applyOffer,
  removeOffer,
  applyDiscount,
  removeDiscount,
  loadCart,
} = cartSlice.actions

export default cartSlice.reducer