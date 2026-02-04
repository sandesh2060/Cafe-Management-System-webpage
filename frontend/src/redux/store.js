// frontend/src/redux/store.js
import { configureStore } from '@reduxjs/toolkit'

// Import slices
import authReducer from './slices/authSlice'
import cartReducer from './slices/cartSlice'
import orderReducer from './slices/orderSlice'
import menuReducer from './slices/menuSlice'
import loyaltyReducer from './slices/loyaltySlice'
import sessionReducer from './slices/sessionSlice'

/**
 * Redux Store Configuration
 * Combines all reducers and configures the store
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    order: orderReducer,
    menu: menuReducer,
    loyalty: loyaltyReducer,
    session: sessionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export default store