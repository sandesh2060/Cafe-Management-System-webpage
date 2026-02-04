// frontend/src/routes/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/common/useAuth'
import Loader from '../components/common/Loader/Loader'

/**
 * ProtectedRoute Component
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 * 
 * @param {Array} allowedRoles - Optional array of roles that can access this route
 * @param {string} redirectPath - Path to redirect if unauthorized (default: '/login')
 */
const ProtectedRoute = ({ 
  allowedRoles = [], 
  redirectPath = '/login',
  children 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Show loader while checking authentication
  if (isLoading) {
    return <Loader fullScreen />
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectPath} 
        state={{ from: location }} 
        replace 
      />
    )
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && user) {
    const hasRequiredRole = allowedRoles.includes(user.role)
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  // User is authenticated and authorized
  return children ? children : <Outlet />
}

export default ProtectedRoute