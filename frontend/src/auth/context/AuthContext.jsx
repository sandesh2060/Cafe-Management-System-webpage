// ============================================
// FILE PATH: frontend/src/auth/context/AuthContext.jsx
// ============================================
// ✅ UPDATED: Uses Redux for state management

import { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { restoreSession } from '@/store/slices/authSlice';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, role, token } = useSelector((state) => state.auth);

  // Restore session on mount
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  const value = {
    user,
    isAuthenticated,
    loading,
    role,
    token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};