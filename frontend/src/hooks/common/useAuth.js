// frontend/src/hooks/common/useAuth.js
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'

/**
 * useAuth Hook
 * Provides authentication state and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

export default useAuth