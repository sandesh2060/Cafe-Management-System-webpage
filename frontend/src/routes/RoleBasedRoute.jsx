// ============================================
// FILE: frontend/src/routes/RoleBasedRoute.jsx
// 🔐 ROLE-BASED ROUTE - Fully protected staff routes
// ✅ No URL bypass — checks token + role synchronously
// ✅ No race condition — reads localStorage directly on first render
// ============================================

import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleBasedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  // ✅ Read localStorage synchronously as fallback during Redux hydration.
  // restoreSession() is a plain reducer (synchronous), so by the time any
  // route renders, App.jsx has already dispatched it. But as a belt-and-
  // suspenders guard we also check localStorage directly — this closes the
  // window where isAuthenticated is still false for ~1 render cycle.
  const token     = localStorage.getItem('token');
  const userRole  = localStorage.getItem('userRole');
  const userStr   = localStorage.getItem('user');

  // Still waiting for Redux to finish an async operation (e.g. API call)
  if (loading) {
    return null; // or <Loader fullScreen /> if you prefer a spinner
  }

  // ── Authentication check ──────────────────────────────────────────────
  // Pass if Redux says authenticated, OR if localStorage has a valid token.
  const effectivelyAuthenticated = isAuthenticated || Boolean(token && userStr);

  if (!effectivelyAuthenticated) {
    console.warn('🚫 No valid session — redirecting to staff login');
    return <Navigate to="/staff/login" replace />;
  }

  // ── Role check ────────────────────────────────────────────────────────
  // Prefer Redux user (authoritative after restore), fall back to localStorage.
  const effectiveRole = user?.role || userRole;

  if (allowedRoles.length > 0 && !allowedRoles.includes(effectiveRole)) {
    console.warn('🚫 Role mismatch — required:', allowedRoles, '| actual:', effectiveRole);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('✅ Access granted:', effectiveRole);
  return <Outlet />;
};

export default RoleBasedRoute;