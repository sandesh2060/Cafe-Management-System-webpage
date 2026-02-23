// ============================================
// FILE: frontend/src/store/store.js
// 🎯 REDUX STORE CONFIGURATION
// ============================================

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import menuReducer from './slices/menuSlice';
import loyaltyReducer from './slices/loyaltySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    order: orderReducer,
    menu: menuReducer,
    loyalty: loyaltyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/staffLogin/fulfilled', 'auth/logout'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user.lastLogin'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;