// frontend/src/layouts/CashierLayout.jsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../redux/slices/authSlice'
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  History,
  BarChart3,
  Menu,
  X,
  LogOut,
  Bell,
  User,
  ChevronDown,
} from 'lucide-react'

/**
 * Cashier Layout
 * Layout wrapper for cashier dashboard
 * Includes sidebar navigation and cashier-specific features
 */
const CashierLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const navigationItems = [
    { name: 'Dashboard', path: '/cashier/dashboard', icon: LayoutDashboard },
    { name: 'Billing', path: '/cashier/billing', icon: Receipt },
    { name: 'Cash Management', path: '/cashier/cash-management', icon: Wallet },
    { name: 'Transactions', path: '/cashier/transactions', icon: History },
    { name: 'Reports', path: '/cashier/reports', icon: BarChart3 },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-blue-900 to-blue-800 text-white transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-blue-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
              <Receipt size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">CafeHub</h1>
              <p className="text-xs text-blue-300">Cashier Panel</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-blue-300 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-blue-200 hover:bg-blue-700'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700">
          <div className="flex items-center space-x-3 px-4 py-3 bg-blue-700 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.name?.[0]?.toUpperCase() || 'C'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{user?.name || 'Cashier'}</p>
              <p className="text-xs text-blue-300">Cashier</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white shadow-md">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Menu Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu size={24} />
            </button>

            {/* Page Title */}
            <h2 className="text-xl font-bold text-gray-800">
              {navigationItems.find((item) => isActive(item.path))?.name || 'Dashboard'}
            </h2>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.[0]?.toUpperCase() || 'C'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.name || 'Cashier'}
                  </span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {/* Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default CashierLayout