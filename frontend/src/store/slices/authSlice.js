// ============================================
// FILE: frontend/src/store/slices/authSlice.js
// 🎯 AUTH REDUX SLICE - Staff & Customer Authentication
// ✅ Handles login, logout, token management
// ✅ Uses simple reducers (no async thunks for compatibility)
// ============================================

import { createSlice } from '@reduxjs/toolkit';

// ============================================
// INITIAL STATE
// ============================================
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  role: null,
};

// ============================================
// SLICE
// ============================================
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login start
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    // Login success
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.loading = false;
      state.user = user;
      state.token = token;
      state.role = user.role;
      state.isAuthenticated = true;
      state.error = null;
      
      // Store in localStorage (use 'token' not 'authToken')
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('✅ Redux Login:', { role: user.role, userId: user._id });
    },
    
    // Login failure
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    
    // Logout
    logout: (state) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Clear localStorage (use 'token' not 'authToken')
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      localStorage.removeItem('customerSession');
      localStorage.removeItem('tableSession');
      
      console.log('✅ Redux Logout');
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set credentials (for manual login or token restoration)
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.role = user?.role;
      state.isAuthenticated = true;
      state.error = null;
    },
    
    // Restore session from localStorage
    restoreSession: (state) => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          state.user = user;
          state.token = token;
          state.role = userRole || user.role;
          state.isAuthenticated = true;
          console.log('✅ Session restored:', user.name, '/', user.role);
        } catch (error) {
          console.error('❌ Failed to restore session:', error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('user');
        }
      }
      state.loading = false;
    },
  },
});

export const { 
  loginStart,
  loginSuccess,
  loginFailure,
  logout, 
  clearError, 
  setCredentials, 
  restoreSession 
} = authSlice.actions;

export default authSlice.reducer;

// ============================================
// THUNK ACTIONS (for compatibility with useAuth)
// ============================================

// Staff Login Thunk
export const staffLogin = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());
    
    console.log('🔐 Attempting staff login:', credentials.email);
    
    // Import authAPI dynamically to avoid circular dependency
    const { authAPI } = await import('../../api/endpoints');
    
    const response = await authAPI.login(credentials);
    
    console.log('✅ Login successful:', response);

    // Handle response
    const data = response.data || response;
    
    if (data.token && data.user) {
      dispatch(loginSuccess({
        user: data.user,
        token: data.token
      }));
      
      return { user: data.user, token: data.token };
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('❌ Login failed:', error);
    const errorMsg = error.response?.data?.message || error.message || 'Login failed';
    dispatch(loginFailure(errorMsg));
    throw errorMsg;
  }
};