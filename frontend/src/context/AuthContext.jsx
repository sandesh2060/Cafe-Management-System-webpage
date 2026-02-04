// frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_ENDPOINTS from '../config/apiEndpoints'

/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */
export const AuthContext = createContext(null)

/**
 * AuthProvider Component
 * Wraps the app and provides authentication context
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  /**
   * Get stored token from localStorage
   */
  const getStoredToken = () => {
    return localStorage.getItem('token')
  }

  /**
   * Store token in localStorage
   */
  const storeToken = (token) => {
    localStorage.setItem('token', token)
  }

  /**
   * Remove token from localStorage
   */
  const removeToken = () => {
    localStorage.removeItem('token')
  }

  /**
   * Get stored user from localStorage
   */
  const getStoredUser = () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  /**
   * Store user in localStorage
   */
  const storeUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
  }

  /**
   * Remove user from localStorage
   */
  const removeUser = () => {
    localStorage.removeItem('user')
  }

  /**
   * Set axios default authorization header
   */
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }

  /**
   * Load user from token
   * Validates token and fetches user data
   */
  const loadUser = useCallback(async () => {
    const token = getStoredToken()
    
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      setAuthHeader(token)
      
      // Fetch current user data
      const response = await axios.get(API_ENDPOINTS.AUTH.GET_ME)
      
      if (response.data.status === 'success') {
        const userData = response.data.data.user
        setUser(userData)
        setIsAuthenticated(true)
        storeUser(userData)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
      // Token is invalid, clear everything
      removeToken()
      removeUser()
      setAuthHeader(null)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Initialize auth on mount
   */
  useEffect(() => {
    loadUser()
  }, [loadUser])

  /**
   * Login Method
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Keep user logged in
   */
  const login = async (email, password, rememberMe = false) => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
        rememberMe
      })

      if (response.data.status === 'success') {
        const { token, user: userData } = response.data.data

        // Store token and user
        storeToken(token)
        storeUser(userData)
        setAuthHeader(token)

        // Update state
        setUser(userData)
        setIsAuthenticated(true)

        // Redirect based on role
        redirectBasedOnRole(userData.role)

        return { success: true, user: userData }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Register Method
   * @param {Object} userData - User registration data
   */
  const register = async (userData) => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, userData)

      if (response.data.status === 'success') {
        const { token, user: newUser } = response.data.data

        // Store token and user
        storeToken(token)
        storeUser(newUser)
        setAuthHeader(token)

        // Update state
        setUser(newUser)
        setIsAuthenticated(true)

        // Redirect based on role
        redirectBasedOnRole(newUser.role)

        return { success: true, user: newUser }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Logout Method
   */
  const logout = async () => {
    try {
      // Call logout API (optional - to invalidate token on server)
      await axios.post(API_ENDPOINTS.AUTH.LOGOUT).catch(() => {
        // Ignore errors, logout anyway
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear everything
      removeToken()
      removeUser()
      setAuthHeader(null)
      setUser(null)
      setIsAuthenticated(false)
      setError(null)

      // Redirect to login
      navigate('/login', { replace: true })
    }
  }

  /**
   * Update User Profile
   * @param {Object} updates - User data to update
   */
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    storeUser(updatedUser)
  }

  /**
   * Redirect based on user role
   * @param {string} role - User role
   */
  const redirectBasedOnRole = (role) => {
    const roleRedirects = {
      customer: '/customer/menu',
      superadmin: '/superadmin/dashboard',
      cashier: '/cashier/dashboard',
      chef: '/chef/dashboard',
      waiter: '/waiter/dashboard'
    }

    const redirectPath = roleRedirects[role] || '/customer/menu'
    navigate(redirectPath, { replace: true })
  }

  /**
   * Check if user has specific role
   * @param {string|Array} roles - Role(s) to check
   */
  const hasRole = (roles) => {
    if (!user) return false
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role)
    }
    
    return user.role === roles
  }

  /**
   * Refresh Token
   */
  const refreshToken = async () => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN)
      
      if (response.data.status === 'success') {
        const { token } = response.data.data
        storeToken(token)
        setAuthHeader(token)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }

  /**
   * Context Value
   */
  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    refreshToken,
    setError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext