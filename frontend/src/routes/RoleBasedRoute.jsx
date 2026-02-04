// frontend/src/routes/RoleBasedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/common/useAuth'
import Loader from '../components/common/Loader/Loader'

/**
 * RoleBasedRoute Component
 * Restricts access based on user roles
 * More strict than ProtectedRoute - requires specific roles
 * 
 * @param {Array} allowedRoles - Required array of roles that can access
 * @param {string} redirectPath - Path to redirect if unauthorized
 * @param {ReactNode} children - Child components to render
 */
const RoleBasedRoute = ({ 
  allowedRoles = [],
  redirectPath = '/unauthorized',
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
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    )
  }

  // Check if user has required role
  if (!user || !allowedRoles.includes(user.role)) {
    // Log unauthorized access attempt (for security monitoring)
    console.warn(`Unauthorized access attempt to ${location.pathname} by role: ${user?.role}`)
    
    return <Navigate to={redirectPath} replace />
  }

  // User is authenticated and has required role
  return children
}

export default RoleBasedRoute