// frontend/src/layouts/AuthLayout.jsx
import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'

/**
 * Auth Layout
 * Layout wrapper for authentication pages (Login, Register, Forgot Password)
 * Provides consistent styling and structure for all auth pages
 */
const AuthLayout = () => {
  useEffect(() => {
    // Add auth-specific body class for styling
    document.body.classList.add('auth-page')
    
    return () => {
      document.body.classList.remove('auth-page')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      {/* Header */}
      <header className="relative z-10 py-6 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  CafeHub
                </h1>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/customer/menu" className="text-gray-600 hover:text-orange-600 transition-colors">
                Browse Menu
              </a>
              <a href="/about" className="text-gray-600 hover:text-orange-600 transition-colors">
                About Us
              </a>
              <a href="/contact" className="text-gray-600 hover:text-orange-600 transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center px-4 py-12 min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-md">
          {/* Auth Form Container */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <Outlet />
          </div>
          
          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Protected by industry-standard encryption
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-4 border-t border-gray-100">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2026 CafeHub. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a href="/privacy" className="text-sm text-gray-500 hover:text-orange-600 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-sm text-gray-500 hover:text-orange-600 transition-colors">
                Terms of Service
              </a>
              <a href="/help" className="text-sm text-gray-500 hover:text-orange-600 transition-colors">
                Help
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AuthLayout