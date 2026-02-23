// ============================================
// FILE: frontend/src/routes/ProtectedRoute.jsx
// 🔐 PROTECTED ROUTE - Customer session check
// ✅ Fully protected — no URL bypass
// ✅ requireTableState prop: guards /customer/username
// ============================================

import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ requireTableState = false }) => {
  const location = useLocation();

  // ── Guard for /customer/username ──────────────────────────────────────
  // This route is only reachable by navigating from LoginPage with state.
  // A direct URL hit has no location.state, so we bounce back to login.
  if (requireTableState) {
    const hasState = Boolean(location.state?.tableId);
    if (!hasState) {
      console.warn('🚫 Direct URL access to /customer/username blocked');
      return <Navigate to="/customer/login" replace />;
    }
    return <Outlet />;
  }

  // ── Guard for all other customer routes ──────────────────────────────
  const sessionStr = localStorage.getItem('customerSession');

  if (!sessionStr) {
    console.warn('🚫 No customer session — redirecting to login');
    return <Navigate to="/customer/login" replace />;
  }

  try {
    const session = JSON.parse(sessionStr);

    if (!session?.customerId || !session?.sessionId) {
      console.warn('🚫 Malformed customer session — clearing and redirecting');
      localStorage.removeItem('customerSession');
      return <Navigate to="/customer/login" replace />;
    }

    return <Outlet />;
  } catch {
    console.warn('🚫 Corrupt customer session — clearing and redirecting');
    localStorage.removeItem('customerSession');
    return <Navigate to="/customer/login" replace />;
  }
};

export default ProtectedRoute;