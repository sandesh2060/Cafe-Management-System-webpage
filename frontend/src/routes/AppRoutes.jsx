// File: frontend/src/routes/AppRoutes.jsx
// ✅ All routes fully protected — no URL bypass
// 🔥 STREAMLINED: Removed biometric page - auto-detection in LoginPage

import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./ProtectedRoute";
import RoleBasedRoute from "./RoleBasedRoute";
import Loader from "@/shared/components/Loader";

// ==================== CUSTOMER PAGES ====================
const CustomerLoginPage     = lazy(() => import("@/modules/customer/pages/LoginPage"));
const UserNamePrompt        = lazy(() => import("@/modules/customer/components/UserNamePrompt"));
const MenuPage              = lazy(() => import("@/modules/customer/pages/MenuPage"));
const CartPage              = lazy(() => import("@/modules/customer/pages/CartPage"));
const OrdersPage            = lazy(() => import("@/modules/customer/pages/OrdersPage"));
const OrderDetailsPage      = lazy(() => import("@/modules/customer/pages/OrderDetailsPage"));
const ProfilePage           = lazy(() => import("@/modules/customer/pages/ProfilePage"));
const PaymentPage           = lazy(() => import("@/modules/customer/pages/PaymentPage")); // ✅ ADDED

// ==================== STAFF AUTH ====================
const StaffLoginPage = lazy(() => import("@/auth/pages/StaffLoginPage"));

// ==================== ADMIN PAGES ====================
const AdminDashboard    = lazy(() => import("@/modules/admin/pages/DashboardPage"));
const MenuManagement    = lazy(() => import("@/modules/admin/pages/MenuManagementPage"));
const UsersPage         = lazy(() => import("@/modules/admin/pages/UsersPage"));
const LoyaltyManagement = lazy(() => import("@/modules/admin/pages/LoyaltyPage"));
const ReportsPage       = lazy(() => import("@/modules/admin/pages/ReportsPage"));

// ==================== MANAGER PAGES ====================
const ManagerDashboard       = lazy(() => import("@/modules/manager/pages/DashboardPage"));
const ManagerInventory       = lazy(() => import("@/modules/manager/pages/InventoryPage"));
const ManagerReports         = lazy(() => import("@/modules/manager/pages/ReportsPage"));
const ManagerStaff           = lazy(() => import("@/modules/manager/pages/StaffPage"));
const StaffCredentialsPage   = lazy(() => import("@/modules/manager/pages/StaffCredentialsPage"));

// ==================== COOK PAGES ====================
const KitchenDisplay = lazy(() => import("@/modules/cook/pages/KitchenDisplayPage"));
const InventoryPage  = lazy(() => import("@/modules/cook/pages/InventoryPage"));

// ==================== WAITER PAGES ====================
const TablesPage       = lazy(() => import("@/modules/waiter/pages/TablesPage"));
const WaiterOrdersPage = lazy(() => import("@/modules/waiter/pages/OrdersPage"));

// ==================== CASHIER PAGES ====================
const BillingPage      = lazy(() => import("@/modules/cashier/pages/BillingPage"));
const TransactionsPage = lazy(() => import("@/modules/cashier/pages/TransactionsPage"));

// ==================== ERROR PAGES ====================
const NotFound     = lazy(() => import("@/shared/components/NotFound"));
const Unauthorized = lazy(() => import("@/shared/components/Unauthorized"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <Routes>
        {/* ROOT */}
        <Route path="/" element={<Navigate to="/customer/login" replace />} />

        {/* ==================== CUSTOMER ROUTES ==================== */}
        <Route path="/customer">
          {/* Public — table login with auto-detection (QR / location+face / manual) */}
          <Route path="login" element={<CustomerLoginPage />} />

          {/* ✅ username prompt is protected — needs valid table session */}
          <Route element={<ProtectedRoute requireTableState />}>
            <Route path="username" element={<UserNamePrompt />} />
          </Route>

          {/* Protected customer routes — need full customerSession */}
          <Route element={<ProtectedRoute />}>
            <Route path="menu"              element={<MenuPage />} />
            <Route path="cart"              element={<CartPage />} />
            <Route path="orders"            element={<OrdersPage />} />
            <Route path="orders/:orderId"   element={<OrderDetailsPage />} />
            <Route path="profile"           element={<ProfilePage />} />
            <Route path="payment"           element={<PaymentPage />} /> {/* ✅ ADDED */}
          </Route>
        </Route>

        {/* ==================== STAFF LOGIN ==================== */}
        <Route path="/staff">
          <Route path="login" element={<StaffLoginPage />} />
        </Route>

        {/* ==================== ADMIN ROUTES ==================== */}
        <Route path="/admin" element={<RoleBasedRoute allowedRoles={["admin"]} />}>
          <Route index       element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="menu"      element={<MenuManagement />} />
          <Route path="users"     element={<UsersPage />} />
          <Route path="loyalty"   element={<LoyaltyManagement />} />
          <Route path="reports"   element={<ReportsPage />} />
        </Route>

        {/* ==================== MANAGER ROUTES ==================== */}
        <Route path="/manager" element={<RoleBasedRoute allowedRoles={["manager", "admin"]} />}>
          <Route index          element={<Navigate to="/manager/dashboard" replace />} />
          <Route path="dashboard"  element={<ManagerDashboard />} />
          <Route path="inventory"  element={<ManagerInventory />} />
          <Route path="reports"    element={<ManagerReports />} />
          <Route path="staff"      element={<ManagerStaff />} />
          <Route path="staff/:staffId/credentials" element={<StaffCredentialsPage />} />
        </Route>

        {/* ==================== COOK ROUTES ==================== */}
        <Route path="/cook" element={<RoleBasedRoute allowedRoles={["cook"]} />}>
          <Route index        element={<Navigate to="/cook/kitchen" replace />} /> 
          <Route path="kitchen"   element={<KitchenDisplay />} />
          <Route path="inventory" element={<InventoryPage />} />
        </Route>

        {/* ==================== WAITER ROUTES ==================== */}
        <Route path="/waiter" element={<RoleBasedRoute allowedRoles={["waiter"]} />}>
          <Route index      element={<Navigate to="/waiter/tables" replace />} />
          <Route path="tables" element={<TablesPage />} />
          <Route path="orders" element={<WaiterOrdersPage />} />
        </Route>

        {/* ==================== CASHIER ROUTES ==================== */}
        <Route path="/cashier" element={<RoleBasedRoute allowedRoles={["cashier"]} />}>
          <Route index           element={<Navigate to="/cashier/billing" replace />} />
          <Route path="billing"      element={<BillingPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
        </Route>

        {/* ==================== LEGACY ==================== */}
        <Route path="/login" element={<Navigate to="/staff/login" replace />} />

        {/* ==================== ERROR ROUTES ==================== */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*"             element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;