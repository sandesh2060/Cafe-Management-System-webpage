# 📁 CAFE MANAGEMENT SYSTEM - COMPLETE FOLDER STRUCTURE

## 🏗️ Project Root Structure

```
cafe-management-system/
│
├── frontend/                          # React/Vite Frontend Application
├── backend/                           # Node.js/Express Backend API
├── database/                          # Database schemas and migrations
├── docs/                              # Project documentation
├── .gitignore                         # Git ignore rules
├── docker-compose.yml                 # Docker orchestration
├── Dockerfile                         # Docker container configuration
└── README.md                          # Project overview
```

---

## 🎨 FRONTEND STRUCTURE (Complete)

```
frontend/
│
├── public/                            # Static public assets
│   ├── images/
│   │   ├── menu/                      # Menu item images
│   │   ├── offers/                    # Promotional banners
│   │   ├── logo/                      # Restaurant logos
│   │   └── icons/                     # Icon assets
│   ├── fonts/                         # Custom fonts
│   └── favicon.ico
│
├── src/                               # Source code
│   │
│   ├── components/                    # React Components
│   │   │
│   │   ├── common/                    # Shared components (all users)
│   │   │   ├── Navbar/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Navbar.module.css
│   │   │   │   └── index.js
│   │   │   ├── Footer/
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Footer.module.css
│   │   │   │   └── index.js
│   │   │   ├── Button/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Button.module.css
│   │   │   │   └── index.js
│   │   │   ├── Card/
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Card.module.css
│   │   │   │   └── index.js
│   │   │   ├── Modal/
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Modal.module.css
│   │   │   │   └── index.js
│   │   │   ├── Input/
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Input.module.css
│   │   │   │   └── index.js
│   │   │   ├── Dropdown/
│   │   │   │   ├── Dropdown.jsx
│   │   │   │   ├── Dropdown.module.css
│   │   │   │   └── index.js
│   │   │   ├── Alert/
│   │   │   │   ├── Alert.jsx
│   │   │   │   ├── Alert.module.css
│   │   │   │   └── index.js
│   │   │   ├── Loader/
│   │   │   │   ├── SkeletonLoader.jsx
│   │   │   │   ├── SkeletonLoader.module.css
│   │   │   │   └── index.js
│   │   │   └── Toast/
│   │   │       ├── Toast.jsx
│   │   │       ├── Toast.module.css
│   │   │       └── index.js
│   │   │
│   │   ├── customer/                  # Customer-specific components
│   │   │   │
│   │   │   ├── Auth/                  # Authentication components
│   │   │   │   ├── QRScanner.jsx           # QR code scanner
│   │   │   │   ├── TableLogin.jsx          # Auto table login
│   │   │   │   ├── UserIdentity.jsx        # Identity selection
│   │   │   │   ├── GuestNameForm.jsx       # Guest name entry
│   │   │   │   ├── RegisteredUserLogin.jsx # Login form
│   │   │   │   ├── QuickRegister.jsx       # Quick registration
│   │   │   │   ├── Auth.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── TableOrder/            # Table ordering
│   │   │   │   ├── TableSelection.jsx
│   │   │   │   ├── MenuBrowse.jsx
│   │   │   │   ├── MenuItemCard.jsx
│   │   │   │   ├── TableOrder.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── MenuSection/
│   │   │   │   ├── MenuSection.jsx
│   │   │   │   ├── MenuSection.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── MenuItem/
│   │   │   │   ├── MenuItem.jsx
│   │   │   │   ├── MenuItemDetails.jsx
│   │   │   │   ├── CustomizationPanel.jsx
│   │   │   │   ├── MenuItem.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── OrderCart/             # Shopping cart
│   │   │   │   ├── OrderCart.jsx
│   │   │   │   ├── CartItem.jsx
│   │   │   │   ├── CartSummary.jsx
│   │   │   │   ├── OrderCart.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── OrderTracking/
│   │   │   │   ├── OrderTracking.jsx
│   │   │   │   ├── OrderStatus.jsx
│   │   │   │   ├── OrderTracking.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── Personalization/       # Personalized features
│   │   │   │   ├── WelcomeScreen.jsx
│   │   │   │   ├── FavoriteItems.jsx
│   │   │   │   ├── ReorderPrevious.jsx
│   │   │   │   ├── RecommendedItems.jsx
│   │   │   │   ├── SavedCustomizations.jsx
│   │   │   │   ├── Personalization.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── QRMenuView/            # QR menu display
│   │   │   │   ├── MenuDisplay.jsx
│   │   │   │   ├── CategoryNav.jsx
│   │   │   │   ├── MenuItemDetail.jsx
│   │   │   │   ├── CallWaiter.jsx
│   │   │   │   ├── QRMenuView.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── LoyaltySystem/
│   │   │   │   ├── LoyaltyCard.jsx
│   │   │   │   ├── TokenProgress.jsx
│   │   │   │   ├── FreeItemRedemption.jsx
│   │   │   │   ├── LoyaltyHistory.jsx
│   │   │   │   ├── LoyaltySystem.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── OfferBanner/
│   │   │   │   ├── OfferBanner.jsx
│   │   │   │   ├── OfferCard.jsx
│   │   │   │   ├── OfferBanner.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── DiscountSection/
│   │   │   │   ├── DiscountSection.jsx
│   │   │   │   ├── DiscountCard.jsx
│   │   │   │   ├── DiscountSection.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── CategoryFilter/
│   │   │   │   ├── CategoryFilter.jsx
│   │   │   │   ├── CategoryFilter.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── SearchBar/
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   ├── SearchBar.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── TableReservation/
│   │   │   │   ├── TableReservation.jsx
│   │   │   │   ├── TableReservation.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── Reviews/
│   │   │   │   ├── Reviews.jsx
│   │   │   │   ├── ReviewCard.jsx
│   │   │   │   ├── Reviews.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   └── TokenEarnAlert/
│   │   │       ├── TokenEarnAlert.jsx
│   │   │       ├── TokenEarnAlert.module.css
│   │   │       └── index.js
│   │   │
│   │   ├── superadmin/                # Super Admin components
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── DashboardStats.jsx
│   │   │   │   ├── RevenueChart.jsx
│   │   │   │   ├── Dashboard.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── UserManagement/
│   │   │   │   ├── UserList.jsx
│   │   │   │   ├── UserForm.jsx
│   │   │   │   ├── RoleAssignment.jsx
│   │   │   │   ├── UserManagement.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── MenuManagement/
│   │   │   │   ├── MenuItemList.jsx
│   │   │   │   ├── MenuItemForm.jsx
│   │   │   │   ├── CategoryManager.jsx
│   │   │   │   ├── MenuManagement.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── OfferManagement/
│   │   │   │   ├── OfferList.jsx
│   │   │   │   ├── OfferForm.jsx
│   │   │   │   ├── OfferManagement.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── DiscountManagement/
│   │   │   │   ├── DiscountList.jsx
│   │   │   │   ├── DiscountForm.jsx
│   │   │   │   ├── DiscountManagement.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── LoyaltyManagement/
│   │   │   │   ├── LoyaltySettings.jsx
│   │   │   │   ├── FreeItemSelector.jsx
│   │   │   │   ├── TokenRulesConfig.jsx
│   │   │   │   ├── CustomerLoyaltyList.jsx
│   │   │   │   ├── LoyaltyAnalytics.jsx
│   │   │   │   ├── LoyaltyManagement.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── ReportsAnalytics/
│   │   │   │   ├── SalesReport.jsx
│   │   │   │   ├── InventoryReport.jsx
│   │   │   │   ├── StaffPerformance.jsx
│   │   │   │   ├── ReportsAnalytics.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── Settings/
│   │   │   │   ├── Settings.jsx
│   │   │   │   ├── Settings.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   └── Notifications/
│   │   │       ├── Notifications.jsx
│   │   │       ├── Notifications.module.css
│   │   │       └── index.js
│   │   │
│   │   ├── cashier/                   # Cashier components
│   │   │   ├── Dashboard/
│   │   │   │   ├── CashierDashboard.jsx
│   │   │   │   ├── DailyStats.jsx
│   │   │   │   ├── Dashboard.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── TableBilling/          # Table-based billing
│   │   │   │   ├── ActiveTablesList.jsx
│   │   │   │   ├── TableBillView.jsx
│   │   │   │   ├── BillSummary.jsx
│   │   │   │   ├── DiscountApplication.jsx
│   │   │   │   ├── SplitBill.jsx
│   │   │   │   ├── TableBilling.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── CashPayment/           # Cash payment system
│   │   │   │   ├── CashPaymentPanel.jsx
│   │   │   │   ├── AmountDisplay.jsx
│   │   │   │   ├── CashReceived.jsx
│   │   │   │   ├── ChangeCalculator.jsx
│   │   │   │   ├── PaymentConfirmation.jsx
│   │   │   │   ├── CashPayment.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── CashManagement/
│   │   │   │   ├── CashRegister.jsx
│   │   │   │   ├── CashInflow.jsx
│   │   │   │   ├── CashOutflow.jsx
│   │   │   │   ├── DailyClosing.jsx
│   │   │   │   ├── CashDenomination.jsx
│   │   │   │   ├── CashManagement.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── TransactionHistory/
│   │   │   │   ├── TransactionList.jsx
│   │   │   │   ├── TransactionDetails.jsx
│   │   │   │   ├── TransactionReceipt.jsx
│   │   │   │   ├── TransactionHistory.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── OrderManagement/
│   │   │   │   ├── ActiveOrders.jsx
│   │   │   │   ├── CompletedOrders.jsx
│   │   │   │   ├── OrderManagement.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   └── Reports/
│   │   │       ├── DailyReport.jsx
│   │   │       ├── CashFlowReport.jsx
│   │   │       ├── Reports.module.css
│   │   │       └── index.js
│   │   │
│   │   ├── chef/                      # Chef/Kitchen components
│   │   │   ├── Dashboard/
│   │   │   │   ├── ChefDashboard.jsx
│   │   │   │   ├── OrderQueue.jsx
│   │   │   │   ├── Dashboard.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── KitchenDisplay/
│   │   │   │   ├── KDS.jsx                 # Kitchen Display System
│   │   │   │   ├── OrderCard.jsx
│   │   │   │   ├── OrderPriority.jsx
│   │   │   │   ├── KitchenDisplay.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── OrderDetails/
│   │   │   │   ├── OrderDetailsPanel.jsx
│   │   │   │   ├── SpecialInstructions.jsx
│   │   │   │   ├── OrderDetails.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── InventoryCheck/
│   │   │   │   ├── IngredientsList.jsx
│   │   │   │   ├── LowStockAlert.jsx
│   │   │   │   ├── InventoryCheck.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── RecipeManagement/
│   │   │   │   ├── RecipeList.jsx
│   │   │   │   ├── RecipeForm.jsx
│   │   │   │   ├── RecipeManagement.module.css
│   │   │   │   └── index.js
│   │   │   │
│   │   │   └── PrepStation/
│   │   │       ├── PrepStation.jsx
│   │   │       ├── PrepStation.module.css
│   │   │       └── index.js
│   │   │
│   │   └── waiter/                    # Waiter components
│   │       ├── Dashboard/
│   │       │   ├── WaiterDashboard.jsx
│   │       │   ├── AssignedTables.jsx
│   │       │   ├── PendingServing.jsx
│   │       │   ├── Dashboard.module.css
│   │       │   └── index.js
│   │       │
│   │       ├── TableManagement/
│   │       │   ├── TableLayout.jsx
│   │       │   ├── TableStatus.jsx
│   │       │   ├── TableAssignment.jsx
│   │       │   ├── CustomerOrders.jsx
│   │       │   ├── TableManagement.module.css
│   │       │   └── index.js
│   │       │
│   │       ├── OrderTaking/
│   │       │   ├── WaiterOrderCart.jsx
│   │       │   ├── MenuBrowser.jsx
│   │       │   ├── CustomizationOptions.jsx
│   │       │   ├── OrderTaking.module.css
│   │       │   └── index.js
│   │       │
│   │       ├── OrderStatus/
│   │       │   ├── ActiveOrders.jsx
│   │       │   ├── ReadyOrders.jsx
│   │       │   ├── OrderStatus.module.css
│   │       │   └── index.js
│   │       │
│   │       ├── OrderService/
│   │       │   ├── ReadyOrders.jsx
│   │       │   ├── ServeOrder.jsx
│   │       │   ├── CustomerRequests.jsx
│   │       │   ├── OrderService.module.css
│   │       │   └── index.js
│   │       │
│   │       ├── CustomerRequests/
│   │       │   ├── RequestsList.jsx
│   │       │   ├── CustomerRequests.module.css
│   │       │   └── index.js
│   │       │
│   │       └── TipManagement/
│   │           ├── TipTracker.jsx
│   │           ├── TipManagement.module.css
│   │           └── index.js
│   │
│   ├── pages/                         # Page components
│   │   ├── customer/
│   │   │   ├── TableSessionPage.jsx        # QR login landing page
│   │   │   ├── MenuBrowsePage.jsx
│   │   │   ├── OrderTrackingPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── LoyaltyPage.jsx
│   │   │   ├── OrderHistoryPage.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── superadmin/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── UsersPage.jsx
│   │   │   ├── MenuManagementPage.jsx
│   │   │   ├── OffersPage.jsx
│   │   │   ├── LoyaltyManagementPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── cashier/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── BillingPage.jsx
│   │   │   ├── CashManagementPage.jsx
│   │   │   ├── TransactionsPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── chef/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── KitchenDisplayPage.jsx
│   │   │   ├── InventoryPage.jsx
│   │   │   ├── RecipesPage.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── waiter/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── TablesPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── TipsPage.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   └── index.js
│   │   │
│   │   └── ErrorPages/
│   │       ├── NotFoundPage.jsx
│   │       ├── UnauthorizedPage.jsx
│   │       └── index.js
│   │
│   ├── layouts/                       # Layout wrappers
│   │   ├── CustomerLayout.jsx
│   │   ├── SuperAdminLayout.jsx
│   │   ├── CashierLayout.jsx
│   │   ├── ChefLayout.jsx
│   │   ├── WaiterLayout.jsx
│   │   ├── AuthLayout.jsx
│   │   └── index.js
│   │
│   ├── animations/                    # GSAP animations
│   │   ├── gsapConfig.js
│   │   ├── scrollAnimations.js
│   │   ├── pageTransitions.js
│   │   ├── menuAnimations.js
│   │   ├── loaderAnimations.js
│   │   └── index.js
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── customer/
│   │   │   ├── useMenu.js
│   │   │   ├── useCart.js
│   │   │   ├── useOrders.js
│   │   │   ├── useOffers.js
│   │   │   ├── useLoyalty.js
│   │   │   ├── useSession.js
│   │   │   └── index.js
│   │   │
│   │   ├── superadmin/
│   │   │   ├── useUsers.js
│   │   │   ├── useMenuManagement.js
│   │   │   ├── useLoyaltyManagement.js
│   │   │   ├── useReports.js
│   │   │   └── index.js
│   │   │
│   │   ├── cashier/
│   │   │   ├── useCashFlow.js
│   │   │   ├── useBilling.js
│   │   │   ├── useTransactions.js
│   │   │   └── index.js
│   │   │
│   │   ├── chef/
│   │   │   ├── useKitchenOrders.js
│   │   │   ├── useInventory.js
│   │   │   └── index.js
│   │   │
│   │   ├── waiter/
│   │   │   ├── useTables.js
│   │   │   ├── useWaiterOrders.js
│   │   │   └── index.js
│   │   │
│   │   ├── common/
│   │   │   ├── useAuth.js
│   │   │   ├── useAnimation.js
│   │   │   ├── useDebounce.js
│   │   │   ├── useIntersectionObserver.js
│   │   │   └── index.js
│   │   │
│   │   └── index.js
│   │
│   ├── context/                       # React Context API
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   ├── OrderContext.jsx
│   │   ├── LoyaltyContext.jsx
│   │   ├── ThemeContext.jsx
│   │   ├── NotificationContext.jsx
│   │   ├── SessionContext.jsx
│   │   └── index.js
│   │
│   ├── services/                      # API services
│   │   ├── api/
│   │   │   ├── axiosConfig.js
│   │   │   ├── interceptors.js
│   │   │   └── index.js
│   │   │
│   │   ├── customer/
│   │   │   ├── menuService.js
│   │   │   ├── orderService.js
│   │   │   ├── offerService.js
│   │   │   ├── sessionService.js
│   │   │   └── index.js
│   │   │
│   │   ├── superadmin/
│   │   │   ├── userService.js
│   │   │   ├── menuManagementService.js
│   │   │   ├── reportService.js
│   │   │   └── index.js
│   │   │
│   │   ├── cashier/
│   │   │   ├── billingService.js
│   │   │   ├── cashFlowService.js
│   │   │   ├── transactionService.js
│   │   │   └── index.js
│   │   │
│   │   ├── chef/
│   │   │   ├── kitchenService.js
│   │   │   ├── inventoryService.js
│   │   │   └── index.js
│   │   │
│   │   ├── waiter/
│   │   │   ├── tableService.js
│   │   │   ├── orderService.js
│   │   │   └── index.js
│   │   │
│   │   ├── authService.js
│   │   └── index.js
│   │
│   ├── utils/                         # Utility functions
│   │   ├── formatters.js              # Price, date formatting
│   │   ├── validators.js              # Form validation
│   │   ├── constants.js               # App constants
│   │   ├── helpers.js                 # Helper functions
│   │   ├── localStorage.js            # Local storage management
│   │   ├── qrCodeGenerator.js         # QR code utilities
│   │   └── index.js
│   │
│   ├── styles/                        # Global styles
│   │   ├── globals.css
│   │   ├── variables.css              # CSS variables
│   │   ├── animations.css             # CSS animations
│   │   ├── skeleton.css               # Skeleton loader styles
│   │   └── responsive.css
│   │
│   ├── redux/                         # Redux state management
│   │   ├── store.js
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── cartSlice.js
│   │   │   ├── orderSlice.js
│   │   │   ├── menuSlice.js
│   │   │   ├── loyaltySlice.js
│   │   │   ├── sessionSlice.js
│   │   │   └── index.js
│   │   └── index.js
│   │
│   ├── routes/                        # Routing configuration
│   │   ├── AppRoutes.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── RoleBasedRoute.jsx
│   │   └── index.js
│   │
│   ├── config/                        # Configuration files
│   │   ├── appConfig.js
│   │   ├── apiEndpoints.js
│   │   └── index.js
│   │
│   ├── types/                         # TypeScript types (optional)
│   │   ├── customer.types.ts
│   │   ├── order.types.ts
│   │   ├── menu.types.ts
│   │   ├── user.types.ts
│   │   ├── session.types.ts
│   │   └── index.ts
│   │
│   ├── App.jsx                        # Main App component
│   ├── main.jsx                       # Entry point
│   └── index.css                      # Root styles
│
├── .env                               # Environment variables
├── .env.example                       # Environment template
├── .gitignore                         # Git ignore
├── package.json                       # Dependencies
├── vite.config.js                     # Vite configuration
├── tailwind.config.js                 # Tailwind CSS config
└── README.md                          # Frontend documentation
```

---

## 🔧 BACKEND STRUCTURE (Complete)

```
backend/
│
├── src/
│   │
│   ├── controllers/                   # Request handlers
│   │   ├── customer/
│   │   │   ├── menuController.js
│   │   │   ├── orderController.js
│   │   │   ├── cartController.js
│   │   │   ├── offerController.js
│   │   │   ├── loyaltyController.js
│   │   │   ├── sessionController.js          # QR table sessions
│   │   │   └── index.js
│   │   │
│   │   ├── superadmin/
│   │   │   ├── userController.js
│   │   │   ├── menuManagementController.js
│   │   │   ├── offerManagementController.js
│   │   │   ├── loyaltyManagementController.js
│   │   │   ├── reportController.js
│   │   │   ├── analyticsController.js
│   │   │   └── index.js
│   │   │
│   │   ├── cashier/
│   │   │   ├── billingController.js
│   │   │   ├── cashFlowController.js
│   │   │   ├── transactionController.js
│   │   │   ├── reportController.js
│   │   │   └── index.js
│   │   │
│   │   ├── chef/
│   │   │   ├── kitchenController.js
│   │   │   ├── orderQueueController.js
│   │   │   ├── inventoryController.js
│   │   │   ├── recipeController.js
│   │   │   └── index.js
│   │   │
│   │   ├── waiter/
│   │   │   ├── tableController.js
│   │   │   ├── orderController.js
│   │   │   ├── tipController.js
│   │   │   └── index.js
│   │   │
│   │   ├── authController.js
│   │   └── index.js
│   │
│   ├── models/                        # Database models (Mongoose/Sequelize)
│   │   ├── User.js                    # Staff users (waiter, chef, cashier, admin)
│   │   ├── Customer.js                # Customer accounts
│   │   ├── MenuItem.js                # Menu items
│   │   ├── Category.js                # Food categories
│   │   ├── Order.js                   # Customer orders
│   │   ├── OrderItem.js               # Individual order items
│   │   ├── OrderCustomization.js      # Customizations (no sugar, etc.)
│   │   ├── Cart.js                    # Shopping cart (deprecated for table orders)
│   │   ├── CartItem.js
│   │   ├── Offer.js                   # Promotional offers
│   │   ├── Discount.js                # Discount rules
│   │   ├── LoyaltyProgram.js          # Loyalty system settings
│   │   ├── CustomerLoyalty.js         # Customer loyalty points
│   │   ├── LoyaltyTransaction.js      # Points history
│   │   ├── FreeItemConfig.js          # Free items for loyalty
│   │   ├── Table.js                   # Restaurant tables
│   │   ├── TableSession.js            # QR-based table sessions ⭐
│   │   ├── Reservation.js             # Table reservations
│   │   ├── Transaction.js             # Payment transactions
│   │   ├── CashTransaction.js         # Cash payment records
│   │   ├── CashFlow.js                # Daily cash flow
│   │   ├── DailyClosure.js            # End-of-day closing
│   │   ├── Inventory.js               # Inventory items
│   │   ├── InventoryLog.js            # Inventory changes
│   │   ├── Recipe.js                  # Recipe information
│   │   ├── Ingredient.js              # Recipe ingredients
│   │   ├── Review.js                  # Customer reviews
│   │   ├── Tip.js                     # Waiter tips
│   │   ├── Notification.js            # System notifications
│   │   └── index.js
│   │
│   ├── routes/                        # API routes
│   │   ├── customer/
│   │   │   ├── menuRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── cartRoutes.js
│   │   │   ├── offerRoutes.js
│   │   │   ├── loyaltyRoutes.js
│   │   │   ├── reviewRoutes.js
│   │   │   ├── sessionRoutes.js              # QR table session routes ⭐
│   │   │   └── index.js
│   │   │
│   │   ├── superadmin/
│   │   │   ├── userRoutes.js
│   │   │   ├── menuManagementRoutes.js
│   │   │   ├── offerManagementRoutes.js
│   │   │   ├── loyaltyManagementRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   ├── settingsRoutes.js
│   │   │   └── index.js
│   │   │
│   │   ├── cashier/
│   │   │   ├── billingRoutes.js
│   │   │   ├── cashFlowRoutes.js
│   │   │   ├── transactionRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   ├── paymentRoutes.js              # Cash payment routes
│   │   │   └── index.js
│   │   │
│   │   ├── chef/
│   │   │   ├── kitchenRoutes.js
│   │   │   ├── orderQueueRoutes.js
│   │   │   ├── inventoryRoutes.js
│   │   │   ├── recipeRoutes.js
│   │   │   └── index.js
│   │   │
│   │   ├── waiter/
│   │   │   ├── tableRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── tipRoutes.js
│   │   │   └── index.js
│   │   │
│   │   ├── authRoutes.js
│   │   └── index.js
│   │
│   ├── middleware/                    # Custom middleware
│   │   ├── auth.js                    # JWT authentication
│   │   ├── roleCheck.js               # Role-based access control
│   │   ├── validation.js              # Request validation
│   │   ├── errorHandler.js            # Global error handler
│   │   ├── logger.js                  # Request logging
│   │   ├── rateLimiter.js             # Rate limiting
│   │   ├── upload.js                  # File upload (multer)
│   │   └── index.js
│   │
│   ├── services/                      # Business logic layer
│   │   ├── customer/
│   │   │   ├── menuService.js
│   │   │   ├── orderService.js
│   │   │   ├── offerService.js
│   │   │   ├── sessionService.js             # Table session logic ⭐
│   │   │   └── index.js
│   │   │
│   │   ├── superadmin/
│   │   │   ├── userService.js
│   │   │   ├── analyticsService.js
│   │   │   ├── loyaltyManagementService.js
│   │   │   ├── reportService.js
│   │   │   └── index.js
│   │   │
│   │   ├── cashier/
│   │   │   ├── billingService.js
│   │   │   ├── cashFlowService.js
│   │   │   ├── transactionService.js
│   │   │   ├── reportService.js
│   │   │   └── index.js
│   │   │
│   │   ├── chef/
│   │   │   ├── kitchenService.js
│   │   │   ├── inventoryService.js
│   │   │   └── index.js
│   │   │
│   │   ├── waiter/
│   │   │   ├── tableService.js
│   │   │   ├── orderService.js
│   │   │   └── index.js
│   │   │
│   │   ├── emailService.js            # Email notifications
│   │   ├── smsService.js              # SMS/OTP service
│   │   ├── paymentService.js          # Payment processing
│   │   ├── qrCodeService.js           # QR code generation ⭐
│   │   └── index.js
│   │
│   ├── utils/                         # Utility functions
│   │   ├── responseHandler.js         # Standard API responses
│   │   ├── validators.js              # Data validation helpers
│   │   ├── helpers.js                 # General helpers
│   │   ├── constants.js               # Application constants
│   │   ├── dateHelpers.js             # Date formatting
│   │   ├── priceCalculator.js         # Price calculations
│   │   ├── qrCodeGenerator.js         # QR code utilities ⭐
│   │   └── index.js
│   │
│   ├── config/                        # Configuration files
│   │   ├── database.js                # Database connection
│   │   ├── jwt.js                     # JWT settings
│   │   ├── email.js                   # Email config (Nodemailer)
│   │   ├── payment.js                 # Payment gateway config
│   │   ├── cloudinary.js              # Image upload config
│   │   └── index.js
│   │
│   ├── validations/                   # Request validation schemas
│   │   ├── customer/
│   │   │   ├── orderValidation.js
│   │   │   ├── cartValidation.js
│   │   │   ├── sessionValidation.js          # Session validation ⭐
│   │   │   └── index.js
│   │   │
│   │   ├── superadmin/
│   │   │   ├── userValidation.js
│   │   │   ├── menuValidation.js
│   │   │   └── index.js
│   │   │
│   │   ├── cashier/
│   │   │   ├── billingValidation.js
│   │   │   ├── cashFlowValidation.js
│   │   │   └── index.js
│   │   │
│   │   ├── chef/
│   │   │   ├── inventoryValidation.js
│   │   │   └── index.js
│   │   │
│   │   ├── waiter/
│   │   │   ├── tableValidation.js
│   │   │   └── index.js
│   │   │
│   │   ├── authValidation.js
│   │   └── index.js
│   │
│   ├── seeders/                       # Database seeders
│   │   ├── userSeeder.js              # Seed admin/staff users
│   │   ├── menuSeeder.js              # Seed menu items
│   │   ├── categorySeeder.js          # Seed categories
│   │   ├── offerSeeder.js             # Seed offers
│   │   ├── tableSeeder.js             # Seed tables with QR codes ⭐
│   │   └── index.js
│   │
│   ├── migrations/                    # Database migrations
│   │   └── [timestamp]_create_tables.js
│   │
│   ├── websockets/                    # Real-time WebSocket handlers
│   │   ├── orderSocket.js             # Order status updates
│   │   ├── kitchenSocket.js           # Kitchen notifications
│   │   ├── tableSocket.js             # Table status updates
│   │   └── index.js
│   │
│   ├── jobs/                          # Background jobs (cron)
│   │   ├── dailyReportJob.js          # Daily reports
│   │   ├── inventoryCheckJob.js       # Low stock alerts
│   │   ├── offerExpiryJob.js          # Expire old offers
│   │   ├── sessionCleanupJob.js       # Clean old sessions ⭐
│   │   └── index.js
│   │
│   ├── app.js                         # Express app setup
│   └── server.js                      # Server entry point
│
├── tests/                             # Test files
│   ├── unit/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── customer/
│   │   ├── superadmin/
│   │   ├── cashier/
│   │   ├── chef/
│   │   └── waiter/
│   └── setup.js
│
├── uploads/                           # Uploaded files
│   ├── menu/                          # Menu item images
│   ├── profiles/                      # Profile pictures
│   ├── qrcodes/                       # Generated QR codes ⭐
│   └── temp/                          # Temporary files
│
├── logs/                              # Application logs
│   ├── error.log
│   ├── combined.log
│   └── access.log
│
├── .env                               # Environment variables
├── .env.example                       # Environment template
├── .gitignore                         # Git ignore rules
├── package.json                       # Dependencies
├── nodemon.json                       # Nodemon configuration
├── jest.config.js                     # Jest test configuration
└── README.md                          # Backend documentation
```

---

## 🗄️ DATABASE STRUCTURE

```
database/
│
├── schema/
│   ├── schema.sql                     # Complete database schema
│   └── indexes.sql                    # Database indexes
│
├── backups/                           # Database backups
│   └── .gitkeep
│
└── README.md                          # Database documentation
```

---

## 📚 DOCUMENTATION STRUCTURE

```
docs/
│
├── API_DOCUMENTATION.md               # Complete API reference
├── DATABASE_SCHEMA.md                 # Database structure
├── USER_ROLES.md                      # User roles & permissions
├── DEPLOYMENT.md                      # Deployment guide
├── SETUP_GUIDE.md                     # Development setup
├── FEATURES.md                        # Feature documentation
├── QR_CODE_SYSTEM.md                  # QR code implementation ⭐
└── SESSION_MANAGEMENT.md              # Session handling ⭐
```

---

## 📦 ROOT CONFIGURATION FILES

```
cafe-management-system/
│
├── .gitignore                         # Git ignore rules
├── docker-compose.yml                 # Docker services
├── Dockerfile                         # Docker image
└── README.md                          # Project overview
```

---

## 🎯 KEY FILES FOR QR TABLE LOGIN SYSTEM ⭐

### **Frontend:**
```
frontend/src/
├── components/customer/Auth/
│   ├── QRScanner.jsx                  # Scan QR code
│   ├── TableLogin.jsx                 # Auto table login
│   └── UserIdentity.jsx               # User identification
│
├── pages/customer/
│   └── TableSessionPage.jsx           # QR landing page
│
├── services/customer/
│   └── sessionService.js              # Session API calls
│
└── context/
    └── SessionContext.jsx             # Session state management
```

### **Backend:**
```
backend/src/
├── controllers/customer/
│   └── sessionController.js           # Session logic
│
├── models/
│   ├── Table.js                       # Table with QR data
│   └── TableSession.js                # Active sessions
│
├── routes/customer/
│   └── sessionRoutes.js               # Session endpoints
│
├── services/
│   └── qrCodeService.js               # QR generation
│
└── utils/
    └── qrCodeGenerator.js             # QR utilities
```

---

## 📊 TOTAL FILE COUNT

| Category | Count |
|----------|-------|
| **Frontend Files** | ~350+ files |
| **Backend Files** | ~200+ files |
| **Database Files** | ~5 files |
| **Documentation** | ~8 files |
| **Config Files** | ~10 files |
| **TOTAL** | **~570+ files** |

---

## ✅ This Structure Supports:

- ✅ **QR-based table login with credentials**
- ✅ **Auto-navigation to cafe webpage**
- ✅ **Guest & registered user flows**
- ✅ **Cart system for ordering**
- ✅ **Cash-only payment**
- ✅ **Kitchen display system**
- ✅ **Waiter management**
- ✅ **Loyalty program**
- ✅ **Multi-role dashboards**
- ✅ **Real-time updates (WebSockets)**

---

**Would you like me to:**
1. Create sample code for any specific folder/file?
2. Generate the bash script to create this entire structure?
3. Provide detailed implementation for QR login system?