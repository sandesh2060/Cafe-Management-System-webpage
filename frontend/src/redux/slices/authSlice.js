// frontend/src/redux/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit'

/**
 * Initial state for authentication
 */
const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  role: null, // 'customer', 'superadmin', 'cashier', 'chef', 'waiter'
}

/**
 * Auth Slice
 * Manages user authentication, login, logout, and user data
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login start
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    
    // Login success
    loginSuccess: (state, action) => {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.role = action.payload.user.role
      state.error = null
      localStorage.setItem('token', action.payload.token)
    },
    
    // Login failure
    loginFailure: (state, action) => {
      state.isLoading = false
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.role = null
      state.error = action.payload
    },
    
    // Register start
    registerStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    
    // Register success
    registerSuccess: (state, action) => {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.role = action.payload.user.role
      state.error = null
      localStorage.setItem('token', action.payload.token)
    },
    
    // Register failure
    registerFailure: (state, action) => {
      state.isLoading = false
      state.error = action.payload
    },
    
    // Guest login (for customers scanning QR)
    guestLogin: (state, action) => {
      state.isAuthenticated = true
      state.user = {
        name: action.payload.guestName,
        isGuest: true,
        tableNumber: action.payload.tableNumber,
      }
      state.role = 'customer'
    },
    
    // Update user profile
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload }
    },
    
    // Logout
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.role = null
      state.error = null
      localStorage.removeItem('token')
    },
    
    // Clear errors
    clearError: (state) => {
      state.error = null
    },
    
    // Set token (for auto-login)
    setToken: (state, action) => {
      state.token = action.payload
      state.isAuthenticated = true
      localStorage.setItem('token', action.payload)
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  guestLogin,
  updateProfile,
  logout,
  clearError,
  setToken,
} = authSlice.actions

export default authSlice.reducer