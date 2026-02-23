import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check if user has an active session
  const session = localStorage.getItem('customerSession');
  
  if (!session) {
    // Redirect to login if no session
    return <Navigate to="/customer/login" replace />;
  }

  try {
    const sessionData = JSON.parse(session);
    
    // Validate session data
    if (!sessionData.customerId || !sessionData.sessionId) {
      localStorage.removeItem('customerSession');
      return <Navigate to="/customer/login" replace />;
    }

    // Session is valid, render child routes
    return <Outlet />;
  } catch (error) {
    // Invalid session data
    localStorage.removeItem('customerSession');
    return <Navigate to="/customer/login" replace />;
  }
};

export default ProtectedRoute;