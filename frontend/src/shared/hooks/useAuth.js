// ============================================
// FILE: frontend/src/shared/hooks/useAuth.js
// 🔐 AUTHENTICATION HOOK - Works with Redux
// ✅ Compatible with custom staffLogin thunk
// ============================================

import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { staffLogin, logout as logoutAction, restoreSession } from '../../store/slices/authSlice';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get auth state from Redux
  const { user, token, isAuthenticated, loading, error, role } = useSelector(
    (state) => state.auth
  );

  // Restore session on mount
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(restoreSession());
    }
  }, [dispatch, isAuthenticated]);

  /**
   * Login function - calls Redux thunk action
   */
  const login = async (credentials) => {
    try {
      console.log('🔑 Attempting login:', credentials.email);
      
      // Dispatch returns a promise from our thunk
      const result = await dispatch(staffLogin(credentials));
      
      console.log('✅ Login result:', result);
      
      // Check if login was successful
      if (result && result.user) {
        toast.success(`Welcome back, ${result.user.name}! 👋`);
        
        // Navigate based on role
        const redirectPath = getRoleRedirectPath(result.user.role);
        navigate(redirectPath, { replace: true });
        
        return {
          success: true,
          user: result.user,
          redirectTo: redirectPath
        };
      } else {
        // Login failed
        throw new Error('Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      const errorMsg = typeof err === 'string' ? err : (err.message || 'Login failed');
      toast.error(errorMsg);
      
      return {
        success: false,
        error: errorMsg
      };
    }
  };

  /**
   * Logout function - calls Redux action
   */
  const logout = async () => {
    try {
      dispatch(logoutAction());
      toast.success('Logged out successfully! 👋');
      navigate('/staff/login', { replace: true });
    } catch (err) {
      console.error('❌ Logout error:', err);
      // Force logout even if there's an error
      toast.success('Logged out successfully! 👋');
      navigate('/staff/login', { replace: true });
    }
  };

  /**
   * Get role-based redirect path
   */
  const getRoleRedirectPath = (userRole) => {
    const rolePaths = {
      admin: '/admin/dashboard',
      manager: '/manager/dashboard',
      waiter: '/waiter/tables',
      cook: '/cook/kitchen',
      cashier: '/cashier/billing',
      customer: '/customer/menu'
    };
    return rolePaths[userRole] || '/';
  };

  /**
   * Check if user has required role
   */
  const hasRole = (requiredRoles) => {
    if (!user) return false;
    if (typeof requiredRoles === 'string') {
      return user.role === requiredRoles;
    }
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    return false;
  };

  /**
   * Check if user has any of specified roles
   */
  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  /**
   * Check if user is staff
   */
  const isStaff = () => {
    return hasAnyRole(['admin', 'manager', 'waiter', 'cashier', 'cook']);
  };

  /**
   * Check if user is management
   */
  const isManagement = () => {
    return hasAnyRole(['admin', 'manager']);
  };

  /**
   * Check if user is admin
   */
  const isAdmin = () => {
    return hasRole('admin');
  };

  /**
   * Verify token (optional)
   */
  const verifyToken = async () => {
    // This is handled by Redux session restoration
    return isAuthenticated;
  };

  /**
   * Update user profile locally
   */
  const updateUser = (updates) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Update Redux state
    dispatch(restoreSession());
    
    console.log('✅ User updated:', updatedUser);
  };

  return {
    // State
    user,
    loading,
    isAuthenticated,
    error,
    role,
    token,

    // Actions
    login,
    logout,
    updateUser,
    verifyToken,

    // Role checks
    hasRole,
    hasAnyRole,
    isStaff,
    isManagement,
    isAdmin,

    // Computed values
    userId: user?._id || user?.id,
    userName: user?.name,
    userRole: user?.role,
    userEmail: user?.email,
  };
};

export default useAuth;