// frontend/src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Layouts
import CustomerLayout from '../layouts/CustomerLayout'
import SuperAdminLayout from '../layouts/SuperAdminLayout'
import CashierLayout from '../layouts/CashierLayout'
import ChefLayout from '../layouts/ChefLayout'
import WaiterLayout from '../layouts/WaiterLayout'
import AuthLayout from '../layouts/AuthLayout'

// Protected Route Components
import ProtectedRoute from './ProtectedRoute'
import RoleBasedRoute from './RoleBasedRoute'

// Common Components
import Loader from '../components/common/Loader/Loader'

// Lazy load pages for better performance
// QR Login Page (First Page)
const QRLoginPage = lazy(() => import('../pages/customer/QRLoginPage'))

// Auth Pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'))

// Customer Pages
const TableSessionPage = lazy(() => import('../pages/customer/TableSessionPage'))
const MenuBrowsePage = lazy(() => import('../pages/customer/MenuBrowsePage'))
const OrderTrackingPage = lazy(() => import('../pages/customer/OrderTrackingPage'))
const ProfilePage = lazy(() => import('../pages/customer/ProfilePage'))
const LoyaltyPage = lazy(() => import('../pages/customer/LoyaltyPage'))
const OrderHistoryPage = lazy(() => import('../pages/customer/OrderHistoryPage'))

// SuperAdmin Pages
const SuperAdminDashboardPage = lazy(() => import('../pages/superadmin/DashboardPage'))
const UsersPage = lazy(() => import('../pages/superadmin/UsersPage'))
const MenuManagementPage = lazy(() => import('../pages/superadmin/MenuManagementPage'))
const OffersPage = lazy(() => import('../pages/superadmin/OffersPage'))
const LoyaltyManagementPage = lazy(() => import('../pages/superadmin/LoyaltyManagementPage'))
const ReportsPage = lazy(() => import('../pages/superadmin/ReportsPage'))
const SettingsPage = lazy(() => import('../pages/superadmin/SettingsPage'))

// Cashier Pages
const CashierDashboardPage = lazy(() => import('../pages/cashier/DashboardPage'))
const BillingPage = lazy(() => import('../pages/cashier/BillingPage'))
const CashManagementPage = lazy(() => import('../pages/cashier/CashManagementPage'))
const TransactionsPage = lazy(() => import('../pages/cashier/TransactionsPage'))
const CashierReportsPage = lazy(() => import('../pages/cashier/ReportsPage'))

// Chef Pages
const ChefDashboardPage = lazy(() => import('../pages/chef/DashboardPage'))
const KitchenDisplayPage = lazy(() => import('../pages/chef/KitchenDisplayPage'))
const InventoryPage = lazy(() => import('../pages/chef/InventoryPage'))
const RecipesPage = lazy(() => import('../pages/chef/RecipesPage'))

// Waiter Pages
const WaiterDashboardPage = lazy(() => import('../pages/waiter/DashboardPage'))
const TablesPage = lazy(() => import('../pages/waiter/TablesPage'))
const OrdersPage = lazy(() => import('../pages/waiter/OrdersPage'))
const TipsPage = lazy(() => import('../pages/waiter/TipsPage'))

// Error Pages
const NotFoundPage = lazy(() => import('../pages/ErrorPages/NotFoundPage'))
const UnauthorizedPage = lazy(() => import('../pages/ErrorPages/UnauthorizedPage'))

/**
 * Main Application Routes
 * QR Login Page is the first page users see
 */
const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <Routes>
        {/* ============================================
            DEFAULT ROUTE - QR LOGIN PAGE
        ============================================ */}
        <Route path="/" element={<QRLoginPage />} />

        {/* ============================================
            PUBLIC ROUTES (No Authentication Required)
        ============================================ */}
        
        {/* Staff Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* ============================================
            CUSTOMER ROUTES (Session Required)
        ============================================ */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<Navigate to="/customer/menu" replace />} />
          
          {/* Protected Customer Routes - Require Session */}
          <Route path="menu" element={<MenuBrowsePage />} />
          <Route path="order-tracking" element={<OrderTrackingPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="loyalty" element={<LoyaltyPage />} />
          <Route path="order-history" element={<OrderHistoryPage />} />
        </Route>

        {/* ============================================
            SUPER ADMIN ROUTES (Protected)
        ============================================ */}
        <Route
          path="/superadmin"
          element={
            <RoleBasedRoute allowedRoles={['superadmin']}>
              <SuperAdminLayout />
            </RoleBasedRoute>
          }
        >
          <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="menu-management" element={<MenuManagementPage />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="loyalty-management" element={<LoyaltyManagementPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* ============================================
            CASHIER ROUTES (Protected)
        ============================================ */}
        <Route
          path="/cashier"
          element={
            <RoleBasedRoute allowedRoles={['cashier', 'superadmin']}>
              <CashierLayout />
            </RoleBasedRoute>
          }
        >
          <Route index element={<Navigate to="/cashier/dashboard" replace />} />
          <Route path="dashboard" element={<CashierDashboardPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="cash-management" element={<CashManagementPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="reports" element={<CashierReportsPage />} />
        </Route>

        {/* ============================================
            CHEF ROUTES (Protected)
        ============================================ */}
        <Route
          path="/chef"
          element={
            <RoleBasedRoute allowedRoles={['chef', 'superadmin']}>
              <ChefLayout />
            </RoleBasedRoute>
          }
        >
          <Route index element={<Navigate to="/chef/dashboard" replace />} />
          <Route path="dashboard" element={<ChefDashboardPage />} />
          <Route path="kitchen-display" element={<KitchenDisplayPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="recipes" element={<RecipesPage />} />
        </Route>

        {/* ============================================
            WAITER ROUTES (Protected)
        ============================================ */}
        <Route
          path="/waiter"
          element={
            <RoleBasedRoute allowedRoles={['waiter', 'superadmin']}>
              <WaiterLayout />
            </RoleBasedRoute>
          }
        >
          <Route index element={<Navigate to="/waiter/dashboard" replace />} />
          <Route path="dashboard" element={<WaiterDashboardPage />} />
          <Route path="tables" element={<TablesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="tips" element={<TipsPage />} />
        </Route>

        {/* ============================================
            ERROR ROUTES
        ============================================ */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes