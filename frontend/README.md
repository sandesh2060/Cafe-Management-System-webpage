# 🍽️ Cafe Management System

A comprehensive, full-stack cafe management system with role-based access control, real-time order tracking, kitchen display, table management, loyalty programs, and more.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 👨‍💼 Admin Features
- Dashboard with analytics and insights
- Menu management (add, edit, delete items)
- User management with role assignments
- Loyalty program configuration
- Sales reports and charts
- System settings

### 💰 Cashier Features
- Billing and payment processing
- Transaction history
- Split bill functionality
- Multiple payment methods
- Receipt generation

### 👨‍🍳 Cook Features
- Kitchen display system (KDS)
- Order queue management
- Inventory checking
- Order status updates
- Real-time notifications

### 👥 Customer Features
- QR code table login
- Browse menu and place orders
- Real-time order tracking
- Loyalty points system
- Order history
- Split bill requests
- Request waiter assistance

### 🍽️ Waiter Features
- View assigned tables
- Manage table orders
- Mark orders as served
- Handle customer requests
- Table session management
- Performance tracking

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time:** Socket.IO
- **Validation:** Express Validator
- **File Upload:** Multer
- **QR Code:** qrcode package

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **State Management:** Redux Toolkit
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **UI Components:** Custom + shadcn/ui
- **HTTP Client:** Axios
- **Real-time:** Socket.IO Client
- **QR Scanner:** html5-qrcode

---

## 📁 Project Structure

```
cafe-management-system/
│
├── backend/                          # Backend application
│   ├── logs/                         # Application logs
│   ├── node_modules/                 # Dependencies
│   ├── src/                          # Source code
│   │   ├── auth/                     # Authentication module
│   │   │   ├── auth.controller.js    # Auth request handlers
│   │   │   ├── auth.middleware.js    # JWT verification middleware
│   │   │   ├── auth.routes.js        # Auth routes
│   │   │   └── auth.service.js       # Auth business logic
│   │   │
│   │   ├── config/                   # Configuration files
│   │   │   ├── database.js           # MongoDB connection
│   │   │   ├── env.js                # Environment variables
│   │   │   └── jwt.js                # JWT configuration
│   │   │
│   │   ├── modules/                  # Feature modules
│   │   │   │
│   │   │   ├── billing/              # Billing & payments
│   │   │   │   ├── billing.controller.js
│   │   │   │   ├── billing.routes.js
│   │   │   │   ├── billing.service.js
│   │   │   │   └── transaction.model.js
│   │   │   │
│   │   │   ├── customer/             # Customer management
│   │   │   │   ├── cart.controller.js
│   │   │   │   ├── cart.routes.js
│   │   │   │   ├── customer.controller.js
│   │   │   │   ├── customer.model.js
│   │   │   │   ├── customer.routes.js
│   │   │   │   └── customer.service.js
│   │   │   │
│   │   │   ├── inventory/            # Inventory management
│   │   │   │   ├── inventory.controller.js
│   │   │   │   ├── inventory.model.js
│   │   │   │   ├── inventory.routes.js
│   │   │   │   └── inventory.service.js
│   │   │   │
│   │   │   ├── kitchen/              # Kitchen operations
│   │   │   │   ├── kitchen.controller.js
│   │   │   │   ├── kitchen.routes.js
│   │   │   │   └── kitchen.service.js
│   │   │   │
│   │   │   ├── loyalty/              # Loyalty program
│   │   │   │   ├── loyalty.controller.js
│   │   │   │   ├── loyalty.model.js
│   │   │   │   ├── loyalty.routes.js
│   │   │   │   ├── loyalty.service.js
│   │   │   │   └── loyaltyTransaction.model.js
│   │   │   │
│   │   │   ├── menu/                 # Menu management
│   │   │   │   ├── menu.controller.js
│   │   │   │   ├── menu.model.js
│   │   │   │   ├── menu.routes.js
│   │   │   │   └── menu.service.js
│   │   │   │
│   │   │   ├── order/                # Order management
│   │   │   │   ├── order.controller.js
│   │   │   │   ├── order.model.js
│   │   │   │   ├── order.routes.js
│   │   │   │   ├── order.service.js
│   │   │   │   ├── orderCounter.model.js
│   │   │   │   ├── orderItem.model.js
│   │   │   │   └── orderSession.service.js
│   │   │   │
│   │   │   ├── request/              # Customer assistance requests
│   │   │   │   ├── request.controller.js
│   │   │   │   ├── request.model.js
│   │   │   │   ├── request.routes.js
│   │   │   │   └── request.service.js
│   │   │   │
│   │   │   ├── table/                # Table management
│   │   │   │   ├── table.controller.js
│   │   │   │   ├── table.model.js
│   │   │   │   ├── table.routes.js
│   │   │   │   ├── table.service.js
│   │   │   │   ├── tableSession.controller.js
│   │   │   │   ├── tableSession.model.js
│   │   │   │   ├── tableSession.routes.js
│   │   │   │   └── tableSession.service.js
│   │   │   │
│   │   │   ├── user/                 # User management
│   │   │   │   ├── user.controller.js
│   │   │   │   ├── user.model.js
│   │   │   │   ├── user.routes.js
│   │   │   │   └── user.service.js
│   │   │   │
│   │   │   └── waiter/               # Waiter operations
│   │   │       ├── waiter.controller.js
│   │   │       ├── waiter.routes.js
│   │   │       └── waiter.service.js
│   │   │
│   │   └── shared/                   # Shared utilities
│   │       ├── middleware/           # Express middlewares
│   │       │   ├── errorHandler.js   # Global error handler
│   │       │   ├── roleCheck.js      # Role-based access control
│   │       │   └── validation.js     # Request validation
│   │       │
│   │       ├── utils/                # Utility functions
│   │       │   ├── constants.js      # App constants
│   │       │   ├── location.js       # Location utilities
│   │       │   ├── qrGenerator.js    # QR code generation
│   │       │   └── response.js       # API response helpers
│   │       │
│   │       ├── validators/           # Input validators
│   │       │   ├── customer.validator.js
│   │       │   ├── menu.validator.js
│   │       │   └── order.validator.js
│   │       │
│   │       └── websockets/           # WebSocket handlers
│   │           ├── kitchenSocket.js  # Kitchen real-time updates
│   │           ├── orderSocket.js    # Order real-time updates
│   │           └── tableSocket.js    # Table real-time updates
│   │
│   ├── uploads/                      # File uploads
│   │   ├── menu/                     # Menu item images
│   │   └── qrcodes/                  # Generated QR codes
│   │
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Example environment file
│   ├── .gitignore                    # Git ignore rules
│   ├── app.js                        # Express app configuration
│   ├── jest.config.js                # Jest testing config
│   ├── nodemon.json                  # Nodemon configuration
│   ├── package.json                  # Dependencies
│   ├── README.md                     # Backend documentation
│   └── server.js                     # Server entry point
│
├── frontend/                         # Frontend application
│   ├── node_modules/                 # Dependencies
│   ├── public/                       # Public assets
│   │   └── vite.svg                  # Vite logo
│   │
│   ├── src/                          # Source code
│   │   ├── api/                      # API configuration
│   │   │   ├── axios.js              # Axios instance setup
│   │   │   └── endpoints.js          # API endpoint definitions
│   │   │
│   │   ├── assets/                   # Static assets
│   │   │   ├── animations/           # Animation files
│   │   │   └── icons/                # Icon files
│   │   │
│   │   ├── auth/                     # Authentication UI
│   │   │   ├── components/           # Auth components
│   │   │   │   ├── shooting-stars.jsx
│   │   │   │   └── stars-background.jsx
│   │   │   │
│   │   │   └── context/              # Auth context
│   │   │       └── components/
│   │   │           └── ui/
│   │   │
│   │   ├── lib/                      # Libraries
│   │   │   └── utils.js              # Utility functions
│   │   │
│   │   ├── modules/                  # Feature modules
│   │   │   │
│   │   │   ├── admin/                # Admin module
│   │   │   │   ├── components/       # Admin components
│   │   │   │   │   ├── Dashboard.jsx
│   │   │   │   │   ├── LoyaltyConfig.jsx
│   │   │   │   │   ├── MenuManager.jsx
│   │   │   │   │   ├── ReportsChart.jsx
│   │   │   │   │   ├── SettingsPanel.jsx
│   │   │   │   │   └── UserManager.jsx
│   │   │   │   │
│   │   │   │   ├── hooks/            # Admin hooks
│   │   │   │   │   ├── useMenuManagement.js
│   │   │   │   │   ├── useReports.js
│   │   │   │   │   └── useUsers.js
│   │   │   │   │
│   │   │   │   ├── pages/            # Admin pages
│   │   │   │   │   ├── DashboardPage.jsx
│   │   │   │   │   ├── LoyaltyPage.jsx
│   │   │   │   │   ├── MenuManagementPage.jsx
│   │   │   │   │   ├── ReportsPage.jsx
│   │   │   │   │   └── UsersPage.jsx
│   │   │   │   │
│   │   │   │   └── services/         # Admin services
│   │   │   │       ├── menuService.js
│   │   │   │       ├── reportService.js
│   │   │   │       └── userService.js
│   │   │   │
│   │   │   ├── cashier/              # Cashier module
│   │   │   │   ├── components/       # Cashier components
│   │   │   │   │   ├── BillingPanel.jsx
│   │   │   │   │   ├── CashRegister.jsx
│   │   │   │   │   ├── PaymentForm.jsx
│   │   │   │   │   └── TransactionList.jsx
│   │   │   │   │
│   │   │   │   ├── hooks/            # Cashier hooks
│   │   │   │   │   ├── useBilling.js
│   │   │   │   │   └── useTransactions.js
│   │   │   │   │
│   │   │   │   ├── pages/            # Cashier pages
│   │   │   │   │   ├── BillingPage.jsx
│   │   │   │   │   └── TransactionPage.jsx
│   │   │   │   │
│   │   │   │   └── services/         # Cashier services
│   │   │   │       └── billingService.js
│   │   │   │
│   │   │   ├── cook/                 # Cook/Kitchen module
│   │   │   │   ├── components/       # Cook components
│   │   │   │   │   ├── InventoryCheck.jsx
│   │   │   │   │   ├── KitchenDisplay.jsx
│   │   │   │   │   ├── OrderCard.jsx
│   │   │   │   │   └── OrderQueue.jsx
│   │   │   │   │
│   │   │   │   ├── hooks/            # Cook hooks
│   │   │   │   │   ├── useInventory.js
│   │   │   │   │   └── useKitchenOrders.js
│   │   │   │   │
│   │   │   │   ├── pages/            # Cook pages
│   │   │   │   │   ├── InventoryPage.jsx
│   │   │   │   │   ├── KitchenDisplayPage.jsx
│   │   │   │   │   └── KitchenPage.jsx
│   │   │   │   │
│   │   │   │   └── services/         # Cook services
│   │   │   │       └── kitchenService.js
│   │   │   │
│   │   │   ├── customer/             # Customer module
│   │   │   │   ├── components/       # Customer components
│   │   │   │   │   ├── ActiveOrderTracker.jsx
│   │   │   │   │   ├── CartSummary.jsx
│   │   │   │   │   ├── CurrentOrderCard.jsx
│   │   │   │   │   ├── LocationLogin.jsx
│   │   │   │   │   ├── LoyaltyCard.jsx
│   │   │   │   │   ├── MenuCard.jsx
│   │   │   │   │   ├── OrderHistory.jsx
│   │   │   │   │   ├── OrderTracking.jsx
│   │   │   │   │   ├── PaymentMethodModal.jsx
│   │   │   │   │   ├── QRScanner.jsx
│   │   │   │   │   ├── SplitBillModal.jsx
│   │   │   │   │   ├── TabletLogin.jsx
│   │   │   │   │   └── UserNamePrompt.jsx
│   │   │   │   │
│   │   │   │   ├── hooks/            # Customer hooks
│   │   │   │   │   ├── useCart.js
│   │   │   │   │   ├── useCurrentOrder.js
│   │   │   │   │   ├── useFavorites.js
│   │   │   │   │   ├── useLoyalty.js
│   │   │   │   │   ├── useMenu.js
│   │   │   │   │   ├── useOrders.js
│   │   │   │   │   ├── useOrderSession.js
│   │   │   │   │   ├── useSplitBill.js
│   │   │   │   │   ├── useTableSession.js
│   │   │   │   │   └── useWeatherAnimations.js
│   │   │   │   │
│   │   │   │   ├── pages/            # Customer pages
│   │   │   │   │   ├── ActiveOrderPage.jsx
│   │   │   │   │   ├── CartPage.jsx
│   │   │   │   │   ├── LoginPage.jsx
│   │   │   │   │   ├── MenuPage.jsx
│   │   │   │   │   ├── OrdersPage.jsx
│   │   │   │   │   └── ProfilePage.jsx
│   │   │   │   │
│   │   │   │   └── services/         # Customer services
│   │   │   │       ├── loyaltyService.js
│   │   │   │       ├── menuService.js
│   │   │   │       └── tableSessionService.js
│   │   │   │
│   │   │   └── waiter/               # Waiter module
│   │   │       ├── components/       # Waiter components
│   │   │       │   ├── ActiveOrders.jsx
│   │   │       │   ├── AssignedTables.jsx
│   │   │       │   ├── CustomerRequests.jsx
│   │   │       │   └── TableLayout.jsx
│   │   │       │
│   │   │       ├── hooks/            # Waiter hooks
│   │   │       │   ├── useTables.js
│   │   │       │   └── useWaiterOrders.js
│   │   │       │
│   │   │       ├── pages/            # Waiter pages
│   │   │       │   ├── OrdersPage.jsx
│   │   │       │   └── TablesPage.jsx
│   │   │       │
│   │   │       └── services/         # Waiter services
│   │   │           └── waiterService.js
│   │   │
│   │   ├── routes/                   # Routing configuration
│   │   │   ├── AppRoutes.jsx         # Main route definitions
│   │   │   ├── ProtectedRoute.jsx    # Auth protection
│   │   │   ├── RoleBasedRoute.jsx    # Role-based routing
│   │   │   └── roleRoutes.js         # Role route mappings
│   │   │
│   │   ├── shared/                   # Shared components/utilities
│   │   │   ├── components/           # Reusable components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── ErrorBoundary.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── NotFound.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── ThemeToggle.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   └── Unauthorized.jsx
│   │   │   │
│   │   │   ├── context/              # React contexts
│   │   │   │   └── ThemeContext.jsx  # Theme management
│   │   │   │
│   │   │   ├── hooks/                # Shared hooks
│   │   │   │   ├── useAuth.js        # Authentication hook
│   │   │   │   ├── useDebounce.js    # Debounce hook
│   │   │   │   ├── useTheme.js       # Theme hook
│   │   │   │   └── useToast.js       # Toast notification hook
│   │   │   │
│   │   │   ├── layouts/              # Layout components
│   │   │   │   ├── AuthLayout.jsx    # Auth pages layout
│   │   │   │   └── DashboardLayout.jsx # Dashboard layout
│   │   │   │
│   │   │   ├── services/             # Shared services
│   │   │   │   ├── socketService.js  # WebSocket service
│   │   │   │   └── weatherService.js # Weather API service
│   │   │   │
│   │   │   └── utils/                # Utility functions
│   │   │       ├── api.js            # API helpers
│   │   │       ├── formatters.js     # Data formatters
│   │   │       ├── location.js       # Location utilities
│   │   │       ├── session.js        # Session management
│   │   │       └── validators.js     # Input validators
│   │   │
│   │   ├── store/                    # Redux store
│   │   │   ├── slices/               # Redux slices
│   │   │   │   ├── authSlice.js      # Auth state
│   │   │   │   ├── cartSlice.js      # Cart state
│   │   │   │   ├── loyaltySlice.js   # Loyalty state
│   │   │   │   ├── menuSlice.js      # Menu state
│   │   │   │   └── orderSlice.js     # Order state
│   │   │   │
│   │   │   └── store.js              # Store configuration
│   │   │
│   │   └── styles/                   # Global styles
│   │       ├── App.css               # App styles
│   │       └── globals.css           # Global CSS
│   │
│   ├── App.css                       # Main app styles
│   ├── App.jsx                       # Root component
│   ├── index.css                     # Base styles
│   ├── main.jsx                      # Entry point
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Example environment file
│   ├── .gitignore                    # Git ignore rules
│   ├── eslint.config.js              # ESLint configuration
│   ├── index.html                    # HTML template
│   ├── package.json                  # Dependencies
│   ├── postcss.config.js             # PostCSS config
│   ├── README.md                     # Frontend documentation
│   ├── tailwind.config.js            # Tailwind configuration
│   └── vite.config.js                # Vite configuration
│
├── .gitignore                        # Root git ignore
├── docker-compose.yml                # Docker compose config
├── Dockerfile                        # Docker configuration
└── README.md                         # This file
```

---

## 📊 Module Summary

### Backend Modules (10 Total)

| Module | Files | Description |
|--------|-------|-------------|
| **auth** | 4 | Authentication & authorization |
| **billing** | 4 | Payment processing & transactions |
| **customer** | 6 | Customer management & cart |
| **inventory** | 4 | Inventory tracking |
| **kitchen** | 3 | Kitchen operations & KDS |
| **loyalty** | 5 | Loyalty program management |
| **menu** | 4 | Menu item management |
| **order** | 7 | Order processing & sessions |
| **request** | 4 | Customer assistance requests |
| **table** | 8 | Table & session management |
| **user** | 4 | User management |
| **waiter** | 3 | Waiter operations |

### Frontend Modules (5 Total)

| Module | Components | Pages | Hooks | Services | Description |
|--------|------------|-------|-------|----------|-------------|
| **admin** | 6 | 5 | 3 | 3 | Admin dashboard & management |
| **cashier** | 4 | 2 | 2 | 1 | Billing & transactions |
| **cook** | 4 | 3 | 2 | 1 | Kitchen operations |
| **customer** | 14 | 6 | 10 | 3 | Customer ordering experience |
| **waiter** | 4 | 2 | 2 | 1 | Waiter operations |

---

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
# Edit .env with your settings

# Start development server
npm run dev

# Or start production server
npm start
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
# Edit .env with your backend URL

# Start development server
npm run dev

# Build for production
npm run build
```

---

## ⚙️ Configuration

### Backend Environment Variables (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/cafe-management

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Socket.IO
SOCKET_CORS_ORIGIN=http://localhost:5173
```

### Frontend Environment Variables (.env)

```env
# API
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# App
VITE_APP_NAME=Cafe Management System
VITE_APP_VERSION=1.0.0
```

---

## 📡 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - User login
POST   /api/auth/logout            - User logout
GET    /api/auth/me                - Get current user
POST   /api/auth/refresh-token     - Refresh JWT token
```

### Menu Endpoints

```
GET    /api/menu                   - Get all menu items
GET    /api/menu/:id               - Get menu item by ID
POST   /api/menu                   - Create menu item (Admin)
PUT    /api/menu/:id               - Update menu item (Admin)
DELETE /api/menu/:id               - Delete menu item (Admin)
GET    /api/menu/category/:category - Get items by category
```

### Order Endpoints

```
GET    /api/orders                 - Get all orders
GET    /api/orders/:id             - Get order by ID
POST   /api/orders                 - Create new order
PUT    /api/orders/:id             - Update order
DELETE /api/orders/:id             - Cancel order
PATCH  /api/orders/:id/status      - Update order status
GET    /api/orders/customer/:customerId - Get customer orders
GET    /api/orders/table/:tableId  - Get table orders
```

### Table Endpoints

```
GET    /api/tables                 - Get all tables
GET    /api/tables/:id             - Get table by ID
POST   /api/tables                 - Create table (Admin)
PUT    /api/tables/:id             - Update table (Admin)
DELETE /api/tables/:id             - Delete table (Admin)
PATCH  /api/tables/:id/status      - Update table status
GET    /api/tables/:id/qr          - Get table QR code
```

### Table Session Endpoints

```
GET    /api/table-sessions         - Get all sessions
GET    /api/table-sessions/:id     - Get session by ID
POST   /api/table-sessions/start   - Start new session
PATCH  /api/table-sessions/:id/end - End session
GET    /api/table-sessions/active  - Get active sessions
GET    /api/table-sessions/table/:tableId - Get table session
```

### Waiter Endpoints

```
GET    /api/waiter/:waiterId/orders - Get waiter orders
GET    /api/waiter/:waiterId/tables - Get assigned tables
PATCH  /api/waiter/:waiterId/orders/:orderId/served - Mark as served
GET    /api/waiter/:waiterId/requests - Get customer requests
PATCH  /api/waiter/:waiterId/requests/:requestId/acknowledge - Acknowledge request
PATCH  /api/waiter/:waiterId/requests/:requestId/complete - Complete request
GET    /api/waiter/:waiterId/stats - Get waiter statistics
POST   /api/waiter/:waiterId/assign-tables - Assign tables
```

### Customer Request Endpoints

```
POST   /api/requests               - Create assistance request
GET    /api/requests               - Get all requests
GET    /api/requests/:id           - Get request by ID
GET    /api/requests/table/:tableId - Get table requests
GET    /api/requests/waiter/:waiterId - Get waiter requests
PATCH  /api/requests/:id/acknowledge - Acknowledge request
PATCH  /api/requests/:id/complete  - Complete request
PATCH  /api/requests/:id/cancel    - Cancel request
```

### Kitchen Endpoints

```
GET    /api/kitchen/orders         - Get kitchen orders
PATCH  /api/kitchen/orders/:id/preparing - Start preparing
PATCH  /api/kitchen/orders/:id/ready - Mark as ready
GET    /api/kitchen/stats          - Get kitchen statistics
```

### Billing Endpoints

```
POST   /api/billing/process        - Process payment
GET    /api/billing/transactions   - Get transactions
GET    /api/billing/transaction/:id - Get transaction by ID
POST   /api/billing/split-bill     - Split bill
GET    /api/billing/invoice/:orderId - Generate invoice
```

### Loyalty Endpoints

```
GET    /api/loyalty/customer/:customerId - Get loyalty points
POST   /api/loyalty/earn           - Earn points
POST   /api/loyalty/redeem         - Redeem points
GET    /api/loyalty/transactions   - Get loyalty transactions
GET    /api/loyalty/config         - Get loyalty configuration
PUT    /api/loyalty/config         - Update configuration (Admin)
```

### User Endpoints

```
GET    /api/users                  - Get all users (Admin)
GET    /api/users/:id              - Get user by ID
POST   /api/users                  - Create user (Admin)
PUT    /api/users/:id              - Update user (Admin)
DELETE /api/users/:id              - Delete user (Admin)
PATCH  /api/users/:id/role         - Update user role (Admin)
```

---

## 🎭 User Roles

### Admin
- Full system access
- Manage users, menu, tables
- View reports and analytics
- Configure loyalty program
- System settings

### Cashier
- Process payments
- View transactions
- Handle billing
- Generate invoices

### Cook
- View kitchen orders
- Update order status
- Check inventory
- Manage order queue

### Waiter
- View assigned tables
- Manage table orders
- Handle customer requests
- Mark orders as served

### Customer
- Browse menu
- Place orders
- Track orders
- View loyalty points
- Request assistance

---

## 🔌 WebSocket Events

### Order Events
```javascript
// Server → Client
'order:new'           - New order created
'order:statusChanged' - Order status updated
'order:ready'         - Order ready for pickup
'order:served'        - Order served to customer

// Client → Server
'order:create'        - Create new order
'order:update'        - Update order status
```

### Kitchen Events
```javascript
// Server → Client
'kitchen:newOrder'    - New order for kitchen
'kitchen:orderUpdate' - Order status changed

// Client → Server
'kitchen:startPreparing' - Start preparing order
'kitchen:markReady'      - Mark order as ready
```

### Table Events
```javascript
// Server → Client
'table:updated'       - Table status changed
'session:started'     - New table session
'session:ended'       - Table session ended

// Client → Server
'table:updateStatus'  - Update table status
```

### Request Events
```javascript
// Server → Client
'request:new'         - New customer request
'request:acknowledged' - Request acknowledged
'request:completed'   - Request completed

// Client → Server
'request:create'      - Create new request
'request:update'      - Update request status
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

### Frontend Tests
```bash
cd frontend
npm test                # Run all tests
npm run test:ui         # UI mode
npm run test:coverage   # Coverage report
```

---

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f
```

---

## 📝 Scripts

### Backend Scripts
```bash
npm start              # Start production server
npm run dev            # Start development server
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
npm test               # Run tests
```

### Frontend Scripts
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- Your Name - Initial work

---

## 🙏 Acknowledgments

- Thanks to all contributors
- Inspired by modern cafe management systems
- Built with love for the hospitality industry

---

## 📞 Support

For support, email support@cafemanagement.com or open an issue in the repository.

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with payment gateways
- [ ] Inventory auto-reordering
- [ ] Customer feedback system
- [ ] Table reservation system
- [ ] Delivery management
- [ ] Multi-location support

---

**Made with ❤️ for cafes worldwide**



# 🔄 SOCKET SERVICE MIGRATION GUIDE

This guide helps you migrate from your current `socketService.js` to the enhanced version.

---

## 📊 COMPARISON: Current vs Enhanced

### What's New in Enhanced Version?

| Feature | Current | Enhanced | Benefit |
|---------|---------|----------|---------|
| **Auto-rejoin rooms** | ❌ No | ✅ Yes | Rooms auto-rejoin after reconnect |
| **Room tracking** | ❌ No | ✅ Yes | Track joined rooms via `rooms` Set |
| **Connection state** | ❌ No | ✅ Yes | Explicit `isConnected` flag |
| **Authentication** | ❌ No | ✅ Yes | Supports token-based auth |
| **Reconnection events** | ⚠️ Partial | ✅ Full | All reconnect events logged |
| **Listener cleanup** | ✅ Yes | ✅ Yes | Both track listeners |
| **Error handling** | ✅ Yes | ✅ Enhanced | More detailed warnings |
| **Helper methods** | ❌ Basic | ✅ Extended | More utility methods |

---

## 🚀 MIGRATION STEPS

### Option A: Drop-in Replacement (Recommended)

**1. Backup your current file**
```bash
cp frontend/src/shared/services/socketService.js \
   frontend/src/shared/services/socketService.js.backup
```

**2. Replace with enhanced version**
```bash
cp socketService-enhanced.js frontend/src/shared/services/socketService.js
```

**3. No code changes needed!**
The enhanced version is **100% backward compatible** with your current implementation.

---

### Option B: Keep Current + Add Features

If you prefer to keep your current version, you can add these features manually:

#### Feature 1: Auto-rejoin rooms on reconnect

**Add to constructor:**
```javascript
constructor() {
  this.socket = null;
  this.listeners = new Map();
  this.rooms = new Set(); // 🆕 ADD THIS
}
```

**Add to `joinRoom()`:**
```javascript
joinRoom(room) {
  if (this.socket?.connected) {
    this.socket.emit('join-room', room);
    this.rooms.add(room); // 🆕 ADD THIS - Track joined room
    console.log(`📍 Joined room: ${room}`);
  }
}
```

**Add to `leaveRoom()`:**
```javascript
leaveRoom(room) {
  if (this.socket?.connected) {
    this.socket.emit('leave-room', room);
    this.rooms.delete(room); // 🆕 ADD THIS - Remove from tracking
    console.log(`🚪 Left room: ${room}`);
  }
}
```

**Add to `connect()` - after socket is created:**
```javascript
this.socket.on('connect', () => {
  console.log('✅ Socket.IO connected');
  
  // 🆕 ADD THIS - Auto-rejoin rooms
  if (this.rooms.size > 0) {
    console.log(`🔄 Rejoining ${this.rooms.size} room(s)...`);
    this.rooms.forEach(room => {
      this.socket.emit('join-room', room);
    });
  }
});
```

#### Feature 2: Authentication support

**Update `connect()` method:**
```javascript
connect() {
  if (this.socket?.connected) {
    return this.socket;
  }

  try {
    // 🆕 ADD THIS - Get auth token
    const token = localStorage.getItem('token');
    
    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: token ? { token } : {}, // 🆕 ADD THIS
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000
    });

    // ... rest of your code
  }
}
```

#### Feature 3: Connection state tracking

**Add to constructor:**
```javascript
constructor() {
  this.socket = null;
  this.isConnected = false; // 🆕 ADD THIS
  this.listeners = new Map();
  this.rooms = new Set();
}
```

**Update all connection events:**
```javascript
this.socket.on('connect', () => {
  console.log('✅ Socket.IO connected');
  this.isConnected = true; // 🆕 ADD THIS
  // ... auto-rejoin code
});

this.socket.on('disconnect', (reason) => {
  console.log('❌ Socket.IO disconnected:', reason);
  this.isConnected = false; // 🆕 ADD THIS
});

this.socket.on('connect_error', (error) => {
  console.log('⚠️ Socket.IO connection error:', error.message);
  this.isConnected = false; // 🆕 ADD THIS
});
```

**Update `isConnected()` method:**
```javascript
isConnected() {
  return this.isConnected && this.socket?.connected;
}
```

---

## 🎯 NEW FEATURES YOU CAN USE

### 1. Authentication
```javascript
// Automatically reads token from localStorage
socketService.connect();
```

### 2. Auto-rejoin rooms
```javascript
// Join once
socketService.joinRoom('kitchen');

// If connection drops and reconnects, room is auto-rejoined!
// No manual rejoin needed
```

### 3. Room tracking
```javascript
// Check which rooms you're in
const rooms = socketService.getJoinedRooms();
console.log('Joined rooms:', rooms); // ['kitchen', 'table-5', 'waiter-123']

// Check if in specific room
const inKitchen = socketService.isInRoom('kitchen'); // true/false
```

### 4. Socket ID
```javascript
const socketId = socketService.getSocketId();
console.log('My socket ID:', socketId);
```

### 5. Emit with acknowledgement
```javascript
socketService.emitWithAck('order-status', { orderId: 123 }, (err, response) => {
  if (err) {
    console.error('Failed:', err);
  } else {
    console.log('Server confirmed:', response);
  }
});
```

### 6. Manual reconnect
```javascript
// Force reconnection
socketService.reconnect();
```

---

## ✅ TESTING YOUR MIGRATION

### Test 1: Basic connection
```javascript
import socketService from '@/shared/services/socketService';

// Connect
socketService.connect();

// Check if connected
console.log('Connected?', socketService.isSocketConnected());
```

### Test 2: Room auto-rejoin
```javascript
// 1. Join a room
socketService.joinRoom('test-room');

// 2. Disconnect server to trigger reconnect
// 3. Check console - should see "Rejoined: test-room"
```

### Test 3: Event listening
```javascript
socketService.on('test-event', (data) => {
  console.log('Received:', data);
});

// Later, cleanup
socketService.off('test-event');
```

### Test 4: Authentication
```javascript
// Make sure you have a token in localStorage
localStorage.setItem('token', 'your-jwt-token');

// Connect - token will be sent automatically
socketService.connect();
```

---

## 🔧 COMPATIBILITY NOTES

### Your Current Code Will Still Work

All existing method calls remain the same:

```javascript
// ✅ These all work exactly the same
socketService.connect();
socketService.disconnect();
socketService.joinRoom('kitchen');
socketService.leaveRoom('kitchen');
socketService.on('new-order', handleOrder);
socketService.off('new-order', handleOrder);
socketService.emit('order-ready', data);
socketService.isConnected();
```

### New Methods (Optional to Use)

```javascript
// 🆕 New methods you can optionally use
socketService.isSocketConnected();
socketService.getSocketId();
socketService.getJoinedRooms();
socketService.isInRoom('kitchen');
socketService.emitWithAck('event', data, callback);
socketService.reconnect();
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Socket not connecting"

**Check:**
1. Is `VITE_SOCKET_URL` or `VITE_API_URL` set correctly in `.env`?
2. Is backend WebSocket server running?
3. Check browser console for errors

**Debug:**
```javascript
console.log('Socket URL:', import.meta.env.VITE_SOCKET_URL);
console.log('Socket instance:', socketService.getSocket());
console.log('Is connected:', socketService.isSocketConnected());
```

### Issue: "Rooms not auto-rejoining"

**Check:**
1. Are you calling `joinRoom()` before disconnect?
2. Check console - do you see "Rejoined: ..." messages?
3. Is `reconnection: true` in socket config?

**Debug:**
```javascript
console.log('Joined rooms:', socketService.getJoinedRooms());
```

### Issue: "Multiple event listeners"

**Solution:** Always clean up listeners
```javascript
useEffect(() => {
  const handler = (data) => console.log(data);
  
  socketService.on('my-event', handler);
  
  return () => {
    socketService.off('my-event', handler); // 🔥 CLEANUP
  };
}, []);
```

---

## 📝 RECOMMENDED USAGE IN REACT

### Pattern 1: useEffect cleanup
```javascript
useEffect(() => {
  socketService.connect();
  socketService.joinRoom('my-room');
  
  const handler = (data) => {
    console.log('Received:', data);
  };
  
  socketService.on('my-event', handler);
  
  return () => {
    socketService.off('my-event', handler);
    socketService.leaveRoom('my-room');
  };
}, []);
```

### Pattern 2: Custom hook
```javascript
// hooks/useSocket.js
import { useEffect } from 'react';
import socketService from '@/shared/services/socketService';

export const useSocket = (room, event, handler) => {
  useEffect(() => {
    if (!socketService.isSocketConnected()) {
      socketService.connect();
    }
    
    if (room) {
      socketService.joinRoom(room);
    }
    
    if (event && handler) {
      socketService.on(event, handler);
    }
    
    return () => {
      if (event && handler) {
        socketService.off(event, handler);
      }
      if (room) {
        socketService.leaveRoom(room);
      }
    };
  }, [room, event, handler]);
};

// Usage
useSocket('kitchen', 'new-order', handleNewOrder);
```

---

## ✅ MIGRATION CHECKLIST

- [ ] Backup current `socketService.js`
- [ ] Replace with enhanced version (or manually add features)
- [ ] Test basic connection
- [ ] Test room join/leave
- [ ] Test event listening
- [ ] Test auto-rejoin after reconnect
- [ ] Update React components to use cleanup pattern
- [ ] Test in production environment

---

## 🎉 YOU'RE DONE!

Your socket service now has:
- ✅ Auto-reconnection with room rejoin
- ✅ Authentication support
- ✅ Better state tracking
- ✅ Enhanced error handling
- ✅ More utility methods
- ✅ Full backward compatibility

**No breaking changes - all your existing code still works! 🚀**


# 🚀 ORDERS PAGE + WAITER ASSIGNMENT - COMPLETE INTEGRATION GUIDE

Complete guide to integrate the new Orders page with Current/History toggle and automatic waiter assignment system.

---

## 📋 TABLE OF CONTENTS

1. [Frontend Integration](#frontend-integration)
2. [Backend Integration](#backend-integration)
3. [Socket Configuration](#socket-configuration)
4. [Testing Guide](#testing-guide)
5. [API Endpoints](#api-endpoints)
6. [Troubleshooting](#troubleshooting)

---

## 🎨 FRONTEND INTEGRATION

### Step 1: Copy Frontend Files

```bash
# Copy files to your frontend
cp OrdersPage.jsx frontend/src/modules/customer/pages/
cp AssignmentNotification.jsx frontend/src/modules/waiter/components/
cp useAssignmentNotifications.js frontend/src/modules/waiter/hooks/
```

### Step 2: Update Customer Routes

**File:** `frontend/src/routes/AppRoutes.jsx`

```javascript
import OrdersPage from '@/modules/customer/pages/OrdersPage';

// Inside customer routes:
<Route path="/customer" element={<RoleBasedRoute allowedRoles={['customer']} />}>
  <Route path="orders" element={<OrdersPage />} />
  <Route path="orders/:orderId" element={<OrderDetailsPage />} />
  {/* ... other customer routes */}
</Route>
```

### Step 3: Integrate Assignment Notifications in Waiter Dashboard

**File:** `frontend/src/modules/waiter/pages/TablesPage.jsx` (or main waiter page)

```javascript
import { useAssignmentNotifications } from '../hooks/useAssignmentNotifications';
import AssignmentNotification from '../components/AssignmentNotification';

const TablesPage = () => {
  const {
    activeAssignment,
    acceptAssignment,
    passAssignment,
    timeoutAssignment,
  } = useAssignmentNotifications();

  return (
    <div>
      {/* Existing waiter dashboard content */}
      
      {/* Assignment Notification Overlay */}
      {activeAssignment && (
        <AssignmentNotification
          assignment={activeAssignment}
          onAccept={acceptAssignment}
          onPass={passAssignment}
          onTimeout={timeoutAssignment}
        />
      )}
    </div>
  );
};
```

### Step 4: Add Notification Sounds

Create folder and add sound files:

```bash
mkdir -p frontend/public/sounds
```

Add these MP3 files to `frontend/public/sounds/`:
- `notification.mp3` - Assignment notification sound

You can download free sounds from:
- https://freesound.org
- https://mixkit.co/free-sound-effects/

Or the component will silently fail (no sound, but still works).

---

## 🔧 BACKEND INTEGRATION

### Step 1: Copy Backend Files

```bash
# Copy files to your backend
cp waiter-assignment.controller.js backend/src/modules/waiter/
cp waiter-assignment.routes.js backend/src/modules/waiter/
```

### Step 2: Register Routes

**File:** `backend/src/app.js` or `backend/src/server.js`

```javascript
const waiterAssignmentRoutes = require('./modules/waiter/waiter-assignment.routes');

// Register routes
app.use('/api/waiter-assignment', waiterAssignmentRoutes);
```

### Step 3: Update Order Model

Make sure your Order model has these fields:

**File:** `backend/src/modules/order/order.model.js`

```javascript
const orderSchema = new mongoose.Schema({
  // ... existing fields ...
  
  assignedWaiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  assignedAt: {
    type: Date,
    default: null,
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  
  // ... other fields ...
});
```

### Step 4: Update User Model

Make sure your User model has these fields for waiters:

**File:** `backend/src/modules/user/user.model.js`

```javascript
const userSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // For waiters
  assignedTables: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
  }],
  currentOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  }],
  isOnline: {
    type: Boolean,
    default: false,
  },
  
  // ... other fields ...
});
```

### Step 5: Trigger Assignment on Order Creation

**File:** `backend/src/modules/order/order.controller.js`

In your `createOrder` function, add:

```javascript
const { assignOrderToWaiter } = require('../waiter/waiter-assignment.controller');

const createOrder = async (req, res) => {
  try {
    // ... create order logic ...
    
    const newOrder = await Order.create({
      // ... order data ...
    });

    // ✅ AUTO-ASSIGN TO NEAREST WAITER
    try {
      await assignOrderToWaiter(
        { params: { orderId: newOrder._id } },
        { json: () => {} } // Mock response object
      );
    } catch (err) {
      console.error('❌ Failed to assign waiter:', err);
      // Don't fail the order creation if assignment fails
    }

    return successResponse(res, {
      message: 'Order created successfully',
      order: newOrder,
    });
  } catch (error) {
    // ... error handling ...
  }
};
```

---

## 🔌 SOCKET CONFIGURATION

### Backend Socket Setup

**File:** `backend/src/services/socketService.js`

```javascript
const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    // Join rooms
    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`📍 Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('leave-room', (room) => {
      socket.leave(room);
      console.log(`🚪 Socket ${socket.id} left room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
    console.log(`📡 Emitted ${event} to room ${room}`);
  }
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`waiter-${userId}`).emit(event, data);
    console.log(`📡 Emitted ${event} to user ${userId}`);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToRoom,
  emitToUser,
};
```

**Initialize in your server:**

```javascript
// backend/src/server.js
const http = require('http');
const { initializeSocket } = require('./services/socketService');

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### Frontend Socket Configuration

Your `socketService.js` is already good! Just make sure:

**File:** `frontend/.env`

```env
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 TESTING GUIDE

### Test 1: Orders Page - Current Order

1. **Login as customer**
   ```
   POST /api/auth/customer/login
   {
     "phoneNumber": "+1234567890",
     "tableNumber": "5"
   }
   ```

2. **Place an order**
   - Navigate to `/customer/menu`
   - Add items to cart
   - Place order

3. **View current order**
   - Navigate to `/customer/orders`
   - Should see "Current Order" tab with live progress
   - Should show real-time status updates

4. **Verify features**
   - ✅ Progress bar updates
   - ✅ Status timeline shows current step
   - ✅ Estimated time displays
   - ✅ Order items list visible
   - ✅ Total amount correct

### Test 2: Orders Page - History Tab

1. **Complete an order** (via kitchen or waiter interface)

2. **Navigate to History tab**
   - Click "History" tab
   - Should see completed order

3. **Test filters**
   - Click "All Orders" - shows everything
   - Click "Completed" - shows only completed
   - Click "Cancelled" - shows only cancelled

4. **View order details**
   - Click "View Details" on any order
   - Should navigate to `/customer/orders/:orderId`

### Test 3: Waiter Assignment System

1. **Setup test waiters**
   ```javascript
   // Create 3 test waiters in database
   db.users.insertMany([
     {
       name: "John Waiter",
       email: "john@restaurant.com",
       role: "waiter",
       isActive: true,
       isOnline: true,
       assignedTables: [ObjectId("table1"), ObjectId("table2")]
     },
     {
       name: "Jane Waiter",
       email: "jane@restaurant.com",
       role: "waiter",
       isActive: true,
       isOnline: true,
       assignedTables: [ObjectId("table3"), ObjectId("table4")]
     },
     {
       name: "Bob Waiter",
       email: "bob@restaurant.com",
       role: "waiter",
       isActive: true,
       isOnline: true,
       assignedTables: [ObjectId("table5"), ObjectId("table6")]
     }
   ]);
   ```

2. **Login as each waiter** in different browser tabs/windows

3. **Place customer order from Table 1**
   - Should notify John (nearest to Table 1)
   - Should show popup with 10-second countdown

4. **Test Accept Flow**
   - Click "Accept" button
   - Should assign order to John
   - Should notify customer "John is taking care of your order"
   - Should dismiss notification

5. **Test Pass Flow**
   - Don't click anything, wait for timeout
   - After 10 seconds, should auto-pass to Jane
   - Jane should see notification popup
   - Click "Pass" button
   - Should pass to Bob
   - Bob should see notification

6. **Test Timeout Flow**
   - Bob doesn't respond for 10 seconds
   - Should auto-pass (but no more waiters)
   - Should notify kitchen/manager

### Test 4: Real-time Updates

1. **Customer places order**
   - Current Order tab should update immediately

2. **Kitchen confirms order**
   - Status should change to "Confirmed"
   - Progress bar should update
   - Timeline should show checkmark

3. **Kitchen marks as preparing**
   - Status → "Preparing"
   - Icon changes to chef emoji
   - Progress updates to 65%

4. **Order ready**
   - Status → "Ready"
   - Progress → 90%
   - Customer sees "Your order is ready!"

5. **Waiter serves**
   - Status → "Served"
   - Progress → 100%
   - Can now switch to History tab

---

## 📡 API ENDPOINTS

### Customer Endpoints

```javascript
// Get all customer orders
GET /api/orders/customer/:customerId
Response: { success: true, orders: [...], total: 5 }

// Get single order
GET /api/orders/:orderId
Response: { success: true, order: {...} }

// Get current active order
GET /api/orders/session/active?customerId=...&tableNumber=5
Response: { success: true, data: {...} }
```

### Waiter Assignment Endpoints

```javascript
// Auto-assign order (called by system)
POST /api/waiter-assignment/assign/:orderId
Response: { success: true, assignedTo: "waiterId", waitingForResponse: true }

// Waiter accepts assignment
POST /api/waiter-assignment/accept/:assignmentId
Response: { success: true, message: "Order accepted", order: {...} }

// Waiter passes assignment
POST /api/waiter-assignment/pass/:assignmentId
Body: { reason: "Currently busy" }
Response: { success: true, message: "Order passed", nextWaiter: true }

// Get pending assignments
GET /api/waiter-assignment/my-pending
Response: { success: true, assignments: [...], count: 2 }
```

### Socket Events

```javascript
// Customer Events
'order:status-update' - Order status changed
'order:waiter-assigned' - Waiter was assigned to order

// Waiter Events
'order:assignment-request' - New assignment request (with 10s timeout)
'order:assignment-timeout' - Assignment timed out
'order:no-waiter' - No waiter accepted (notify kitchen/manager)

// Kitchen Events
'order:waiter-assigned' - Waiter accepted order
'order:no-waiter' - No waiter available for order
```

---

## 🐛 TROUBLESHOOTING

### Issue: "No active orders" even though order exists

**Solutions:**
1. Check order status - must be in ['pending', 'confirmed', 'preparing', 'ready']
2. Check customerId matches session
3. Verify API endpoint returns correct format: `{ success: true, orders: [...] }`
4. Check browser console for API errors

```javascript
// Debug in browser console:
const session = JSON.parse(localStorage.getItem('customerSession'));
console.log('Customer ID:', session.customerId);

// Check API directly:
fetch('/api/orders/customer/' + session.customerId)
  .then(r => r.json())
  .then(data => console.log('Orders:', data));
```

### Issue: Assignment notification not appearing

**Solutions:**
1. Check waiter is logged in
2. Verify socket connection:
   ```javascript
   console.log('Socket connected:', socketService.isSocketConnected());
   ```
3. Check waiter is in correct room:
   ```javascript
   // Should join: `waiter-${waiterId}`
   ```
4. Verify backend emits to correct room:
   ```javascript
   emitToUser(waiterId, 'order:assignment-request', {...});
   ```

### Issue: Timeout not working

**Solutions:**
1. Check component receives `timeout` in assignment data
2. Verify countdown timer is running (check `timeRemaining` state)
3. Check `handleTimeout` is being called after 10 seconds
4. Ensure backend cleanup runs: `cleanupExpiredAssignments()`

### Issue: Order doesn't appear in History

**Solutions:**
1. Check order status is 'completed' or 'cancelled'
2. Verify `useOrders` hook fetches all orders
3. Check filter is set to 'all' or matching status
4. Ensure order has `customerId` field

### Issue: Progress bar not animating

**Solutions:**
1. Check GSAP is installed: `npm install gsap`
2. Verify `progress` value is being calculated correctly
3. Check `statusInfo` object has correct data
4. Ensure animation refs are attached to DOM elements

### Issue: Socket keeps disconnecting

**Solutions:**
1. Check CORS configuration in backend
2. Verify VITE_SOCKET_URL is correct
3. Check firewall/network settings
4. Increase timeout in socket config:
   ```javascript
   io = new Server(server, {
     pingTimeout: 60000,
     pingInterval: 25000,
   });
   ```

---

## ✅ FINAL CHECKLIST

### Backend Setup
- [ ] Copied controller and routes files
- [ ] Registered routes in app.js
- [ ] Updated Order model with `assignedWaiter`, `timeline`
- [ ] Updated User model with `assignedTables`, `currentOrders`, `isOnline`
- [ ] Added assignment trigger in order creation
- [ ] Initialized Socket.IO in server
- [ ] Created socket service utilities

### Frontend Setup
- [ ] Copied OrdersPage.jsx
- [ ] Copied AssignmentNotification.jsx
- [ ] Copied useAssignmentNotifications.js
- [ ] Updated routes to include /customer/orders
- [ ] Added assignment notification to waiter dashboard
- [ ] Added notification sound file (optional)
- [ ] Set VITE_SOCKET_URL in .env

### Testing
- [ ] Customer can view current order
- [ ] Customer can view order history
- [ ] Toggle between Current/History works
- [ ] Real-time updates work
- [ ] Waiter receives assignment notification
- [ ] Accept button works
- [ ] Pass button works
- [ ] 10-second timeout auto-passes
- [ ] Next waiter receives after pass/timeout

---

## 🎉 YOU'RE DONE!

Your Orders page with Current Order/History toggle and automatic waiter assignment system is now fully integrated!

**Key Features:**
- ✅ Separate Current Order and History views
- ✅ Real-time order tracking with progress
- ✅ Auto-assign to nearest waiter
- ✅ Accept/Pass buttons with 10s countdown
- ✅ Cascading assignment if waiter passes/times out
- ✅ Socket-based real-time notifications
- ✅ Beautiful animations with GSAP
- ✅ Mobile-responsive design

**Next Steps:**
1. Add notification preferences (sound on/off)
2. Implement waiter performance tracking
3. Add customer satisfaction ratings
4. Build kitchen display system
5. Integrate payment processing

# 🔔 Notification System - Complete Backend Implementation

## 📁 File Structure

Place these files in your backend:

```
backend/src/modules/notification/
├── notification.controller.js  ← All API handlers
├── notification.model.js       ← MongoDB schema
├── notification.routes.js      ← Express routes
└── notification.service.js     ← Helper functions
```

## 🚀 Installation Steps

### Step 1: Copy Files

Copy all 4 files to `backend/src/modules/notification/`

### Step 2: Verify Routes Registration

Your `app.js` already has this (line 91-95):
```javascript
const notificationRoutes = safeRequire('./modules/notification/notification.routes', 'Notification');
if (notificationRoutes) {
  app.use('/api/notifications', notificationRoutes);
  console.log('🔔 Notification routes registered at /api/notifications');
}
```

✅ **No changes needed** - routes are already registered!

### Step 3: Start Server

```bash
cd backend
npm start
```

You should see:
```
✅ Notification routes loaded
🔔 Notification routes registered at /api/notifications
```

## 📡 API Endpoints

### Get Notifications (Paginated)
```http
GET /api/notifications?page=1&limit=20
Authorization: Bearer <token>

Response:
{
  "success": true,
  "notifications": [...],
  "unreadCount": 5,
  "page": 1,
  "limit": 20,
  "totalPages": 3,
  "total": 47
}
```

### Create Notification
```http
POST /api/notifications
Authorization: Bearer <token>

Body:
{
  "recipient": "6989c1207a6cacb657d33af6",
  "title": "New Order",
  "message": "Order #123 has been placed",
  "type": "order_new",
  "priority": "high",
  "actionUrl": "/orders/123",
  "data": { "orderId": "123" }
}
```

### Broadcast Notification (Admin/Manager only)
```http
POST /api/notifications/broadcast
Authorization: Bearer <token>

Body:
{
  "recipients": ["user1_id", "user2_id", "user3_id"],
  "title": "System Maintenance",
  "message": "System will be down for 30 minutes",
  "type": "announcement",
  "priority": "urgent"
}
```

### Mark as Read
```http
PATCH /api/notifications/:id/read
Authorization: Bearer <token>
```

### Mark All as Read
```http
PATCH /api/notifications/mark-all-read
Authorization: Bearer <token>
```

### Delete Notification
```http
DELETE /api/notifications/:id
Authorization: Bearer <token>
```

### Clear All
```http
DELETE /api/notifications/clear-all
Authorization: Bearer <token>
```

## 💡 Usage Examples

### Example 1: Send Order Notification
```javascript
const notificationService = require('./modules/notification/notification.service');

// In your order controller
const order = await Order.create(orderData);

// Send notification to assigned waiter
await notificationService.sendOrderNotification(
  req.app.get('io'),
  order.assignedWaiter,
  order,
  'order_new'
);
```

### Example 2: Send Table Request
```javascript
// In your request controller
const request = await Request.create(requestData);

// Notify assigned waiter
await notificationService.sendTableRequestNotification(
  req.app.get('io'),
  request.assignedWaiter,
  request
);
```

### Example 3: Broadcast to All Staff
```javascript
// Get all staff IDs
const staff = await User.find({ 
  role: { $in: ['waiter', 'cook', 'manager'] } 
}).select('_id');
const staffIds = staff.map(s => s._id);

// Send announcement
await notificationService.sendAnnouncementToStaff(
  req.app.get('io'),
  staffIds,
  {
    title: '🎉 Team Meeting',
    message: 'Meeting at 5 PM in the conference room',
    priority: 'high'
  }
);
```

### Example 4: Direct Creation (Without Service)
```javascript
const Notification = require('./modules/notification/notification.model');

const notification = await Notification.create({
  recipient: userId,
  title: 'Custom Notification',
  message: 'Your custom message here',
  type: 'message',
  priority: 'normal'
});

// Emit via Socket.IO
const io = req.app.get('io');
if (io) {
  io.to(`user-${userId}`).emit('notification:new', {
    notification: notification.toObject()
  });
}
```

## 🎯 Notification Types

```javascript
type: 'order_new'          // New order placed
type: 'order_ready'        // Order ready to serve
type: 'order_served'       // Order served to customer
type: 'order_cancelled'    // Order cancelled
type: 'order_payment'      // Payment received
type: 'table_request'      // Customer assistance request
type: 'table_assigned'     // Table assigned to waiter
type: 'report_generated'   // Report ready
type: 'alert'              // System alert
type: 'message'            // General message
type: 'announcement'       // Announcement
type: 'reminder'           // Reminder
type: 'update'             // Update notification
type: 'success'            // Success message
type: 'warning'            // Warning
type: 'error'              // Error notification
```

## 📊 Priority Levels

```javascript
priority: 'low'      // Low priority, no vibration
priority: 'normal'   // Default, standard notification
priority: 'high'     // Important, requires attention
priority: 'urgent'   // Critical, max volume + vibration
```

## 🔊 Sound Files

The system expects these sound files in `frontend/public/sounds/`:
- `notification.mp3` - General notification
- `new-order.mp3` - New order alert
- `order-ready.mp3` - Order ready
- `request.mp3` - Table request
- `alert.mp3` - Urgent alert
- `success.mp3` - Success notification

## 🧪 Testing

### Test with cURL:
```bash
# Get notifications
curl -X GET http://localhost:5000/api/notifications?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create notification
curl -X POST http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "6989c1207a6cacb657d33af6",
    "title": "Test Notification",
    "message": "This is a test",
    "type": "message",
    "priority": "normal"
  }'
```

### Test with Postman:
1. Import the collection
2. Set Authorization header with your token
3. Test all endpoints

## 🐛 Troubleshooting

### 404 Error on `/api/notifications`
✅ Fixed! Routes are already registered in your `app.js`

### Socket.IO not emitting
Check if Socket.IO is attached to app:
```javascript
// In your server.js
const io = require('socket.io')(server);
app.set('io', io);
```

### Notifications not showing in frontend
1. Check browser console for Socket.IO connection
2. Verify user is in the correct room: `user-{userId}`
3. Check notification permission in browser

## 🎉 You're All Set!

Your notification system is now:
- ✅ Fully functional backend
- ✅ Real-time Socket.IO integration
- ✅ Pagination support
- ✅ Sound and vibration
- ✅ Browser notifications
- ✅ Helper functions for common use cases

Frontend already works - just restart your backend!






## folder structure

CAFE MANAGEMENT SYSTEM
│
├── backend/
│   ├── logs/
│   ├── node_modules/
│   ├── scripts/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.middleware.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.service.js
│   │   │
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── env.js
│   │   │   └── jwt.js
│   │   │
│   │   ├── modules/
│   │   │   ├── billing/
│   │   │   │   ├── billing.controller.js
│   │   │   │   ├── billing.routes.js
│   │   │   │   ├── billing.service.js
│   │   │   │   └── transaction.model.js
│   │   │   │
│   │   │   ├── biometric/
│   │   │   │   ├── biometric.routes.js
│   │   │   │   ├── face.controller.js
│   │   │   │   ├── faceRecognition.service.js
│   │   │   │   ├── fingerprint.controller.js
│   │   │   │   └── fingerprint.routes.js
│   │   │   │
│   │   │   ├── customer/
│   │   │   │   ├── cart.controller.js
│   │   │   │   ├── cart.routes.js
│   │   │   │   ├── customer.controller.js
│   │   │   │   ├── customer.model.js
│   │   │   │   ├── customer.routes.js
│   │   │   │   ├── customer.service.js
│   │   │   │   ├── favorites.controller.js
│   │   │   │   └── favorites.routes.js
│   │   │   │
│   │   │   ├── inventory/
│   │   │   │   ├── inventory.controller.js
│   │   │   │   ├── inventory.model.js
│   │   │   │   ├── inventory.routes.js
│   │   │   │   └── inventory.service.js
│   │   │   │
│   │   │   ├── kitchen/
│   │   │   │   ├── kitchen.controller.js
│   │   │   │   ├── kitchen.routes.js
│   │   │   │   └── kitchen.service.js
│   │   │   │
│   │   │   ├── loyalty/
│   │   │   │   ├── loyalty.controller.js
│   │   │   │   ├── loyalty.model.js
│   │   │   │   ├── loyalty.routes.js
│   │   │   │   ├── loyalty.service.js
│   │   │   │   └── loyaltyTransaction.model.js
│   │   │   │
│   │   │   ├── manager/
│   │   │   │   ├── manager.controller.js
│   │   │   │   ├── manager.routes.js
│   │   │   │   └── manager.service.js
│   │   │   │
│   │   │   ├── menu/
│   │   │   │   ├── menu.controller.js
│   │   │   │   ├── menu.model.js
│   │   │   │   ├── menu.routes.js
│   │   │   │   └── menu.service.js
│   │   │   │
│   │   │   ├── notification/
│   │   │   │   ├── notification.controller.js
│   │   │   │   ├── notification.helpers.js
│   │   │   │   ├── notification.model.js
│   │   │   │   ├── notification.routes.js
│   │   │   │   └── notification.service.js
│   │   │   │
│   │   │   ├── order/
│   │   │   │   ├── order.controller.js
│   │   │   │   ├── order.model.js
│   │   │   │   ├── order.routes.js
│   │   │   │   ├── order.service.js
│   │   │   │   ├── orderCounter.model.js
│   │   │   │   ├── orderItem.model.js
│   │   │   │   ├── orderSession.service.js
│   │   │   │   └── payment.model.js
│   │   │   │
│   │   │   ├── recommendations/
│   │   │   │   ├── recommendations.controller.js
│   │   │   │   ├── recommendations.routes.js
│   │   │   │   └── recommendations.service.js
│   │   │   │
│   │   │   ├── report/
│   │   │   │   ├── report.controller.js
│   │   │   │   ├── report.model.js
│   │   │   │   └── report.routes.js
│   │   │   │
│   │   │   ├── request/
│   │   │   │   ├── request.controller.js
│   │   │   │   ├── request.model.js
│   │   │   │   ├── request.routes.js
│   │   │   │   └── request.service.js
│   │   │   │
│   │   │   ├── restaurant/
│   │   │   │   └── restaurant.model.js
│   │   │   │
│   │   │   ├── table/
│   │   │   │   ├── table-detection.service.js
│   │   │   │   ├── table.controller.js
│   │   │   │   ├── table.model.js
│   │   │   │   ├── table.routes.js
│   │   │   │   ├── table.service.js
│   │   │   │   ├── tableSession.controller.js
│   │   │   │   ├── tableSession.model.js
│   │   │   │   ├── tableSession.routes.js
│   │   │   │   └── tableSession.service.js
│   │   │   │
│   │   │   ├── user/
│   │   │   │   ├── user.controller.js
│   │   │   │   ├── user.model.js
│   │   │   │   ├── user.routes.js
│   │   │   │   └── user.service.js
│   │   │   │
│   │   │   ├── waiter/
│   │   │   │   ├── waiter-assignment.controller.js
│   │   │   │   ├── waiter-assignment.routes.js
│   │   │   │   ├── waiter.controller.js
│   │   │   │   ├── waiter.routes.js
│   │   │   │   └── waiter.service.js
│   │   │   │
│   │   │   └── zone/
│   │   │       ├── zone.controller.js
│   │   │       ├── zone.model.js
│   │   │       ├── zone.routes.js
│   │   │       └── zone.service.js
│   │   │
│   │   ├── services/
│   │   │   └── socketService.js
│   │   │
│   │   └── shared/
│   │       ├── middleware/
│   │       │   ├── errorHandler.js
│   │       │   ├── roleCheck.js
│   │       │   └── validation.js
│   │       │
│   │       ├── utils/
│   │       │   ├── AppError.js
│   │       │   ├── constants.js
│   │       │   ├── location.js
│   │       │   ├── qrGenerator.js
│   │       │   └── response.js
│   │       │
│   │       ├── validators/
│   │       │   ├── customer.validator.js
│   │       │   ├── menu.validator.js
│   │       │   └── order.validator.js
│   │       │
│   │       └── websockets/
│   │           ├── managerSocket.js
│   │           ├── kitchenSocket.js
│   │           ├── orderSocket.js
│   │           └── tableSocket.js
│   │
│   ├── uploads/
│   │   ├── menu/
│   │   └── qrcodes/
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── cleanup-test-users.js
│   ├── createManager.js
│   ├── createWaiter.js
│   ├── jest.config.js
│   ├── nodemon.json
│   ├── package-lock.json
│   ├── package.json
│   ├── app.js
│   ├── server.js
│   └── README.md
│
├── frontend/
│   ├── node_modules/
│   ├── public/
│   │   ├── fonts/
│   │   ├── images/
│   │   │   ├── avatars/
│   │   │   ├── icons/
│   │   │   ├── logo/
│   │   │   ├── logos/
│   │   │   ├── menu/
│   │   │   ├── offers/
│   │   │   └── qr-codes/
│   │   ├── models/
│   │   │   ├── face_expression_model-shard1
│   │   │   ├── face_expression_model-weights_manifest.json
│   │   │   ├── face_landmark_68_model-shard1
│   │   │   ├── face_landmark_68_model-weights_manifest.json
│   │   │   ├── face_recognition_model-shard1
│   │   │   ├── face_recognition_model-shard2
│   │   │   ├── face_recognition_model-weights_manifest.json
│   │   │   ├── tiny_face_detector_model-shard1
│   │   │   └── tiny_face_detector_model-weights_manifest.json
│   │   ├── sounds/
│   │   │   ├── new-guest.mp3
│   │   │   ├── new-order.mp3
│   │   │   ├── order-ready.mp3
│   │   │   └── waiter-call.mp3
│   │   └── vite.svg
│   │
│   └── src/
│       ├── api/
│       │   ├── axios.js
│       │   └── endpoints.js
│       │
│       ├── assets/
│       │   ├── animations/
│       │   └── icons/
│       │
│       ├── auth/
│       │   ├── components/
│       │   │   ├── LoginForm.jsx
│       │   │   └── ProtectedRoute.jsx
│       │   ├── context/
│       │   │   └── AuthContext.jsx
│       │   ├── pages/
│       │   │   └── StaffLoginPage.jsx
│       │   └── components/ui/
│       │       ├── shooting-stars.jsx
│       │       └── stars-background.jsx
│       │
│       ├── lib/
│       │   └── utils.js
│       │
│       ├── modules/
│       │   │
│       │   ├── admin/
│       │   │   ├── components/
│       │   │   │   ├── Dashboard.jsx
│       │   │   │   ├── LoyaltyConfig.jsx
│       │   │   │   ├── MenuManager.jsx
│       │   │   │   ├── ReportsChart.jsx
│       │   │   │   ├── SettingsPanel.jsx
│       │   │   │   └── UserManager.jsx
│       │   │   ├── hooks/
│       │   │   │   ├── useMenuManagement.js
│       │   │   │   ├── useReports.js
│       │   │   │   └── useUsers.js
│       │   │   ├── pages/
│       │   │   │   ├── DashboardPage.jsx
│       │   │   │   ├── LoyaltyPage.jsx
│       │   │   │   ├── MenuManagementPage.jsx
│       │   │   │   ├── ReportsPage.jsx
│       │   │   │   └── UsersPage.jsx
│       │   │   └── services/
│       │   │       ├── menuService.js
│       │   │       ├── reportService.js
│       │   │       └── userService.js
│       │   │
│       │   ├── cashier/
│       │   │   ├── components/
│       │   │   │   ├── BillingPanel.jsx
│       │   │   │   ├── CashRegister.jsx
│       │   │   │   ├── PaymentForm.jsx
│       │   │   │   └── TransactionList.jsx
│       │   │   ├── hooks/
│       │   │   │   ├── useBilling.js
│       │   │   │   └── useTransactions.js
│       │   │   ├── pages/
│       │   │   │   ├── BillingPage.jsx
│       │   │   │   └── TransactionsPage.jsx
│       │   │   └── services/
│       │   │       └── billingService.js
│       │   │
│       │   ├── cook/
│       │   │   ├── components/
│       │   │   │   ├── InventoryCheck.jsx
│       │   │   │   ├── KitchenDisplay.jsx
│       │   │   │   ├── OrderCard.jsx
│       │   │   │   └── OrderQueue.jsx
│       │   │   ├── hooks/
│       │   │   │   ├── useInventory.js
│       │   │   │   └── useKitchenOrders.js
│       │   │   ├── pages/
│       │   │   │   ├── InventoryPage.jsx
│       │   │   │   ├── KitchenDisplayPage.jsx
│       │   │   │   └── KitchenPage.jsx
│       │   │   └── services/
│       │   │       └── kitchenService.js
│       │   │
│       │   ├── customer/
│       │   │   ├── components/
│       │   │   │   ├── ActiveOrderTracker.jsx
│       │   │   │   ├── CartSummary.jsx
│       │   │   │   ├── CurrentOrderCard.jsx
│       │   │   │   ├── FaceRecognitionCapture.jsx
│       │   │   │   ├── FaceRecognitionMultiAngle.jsx
│       │   │   │   ├── FingerprintCapture.jsx
│       │   │   │   ├── LocationLogin.jsx
│       │   │   │   ├── LoyaltyCard.jsx
│       │   │   │   ├── MenuCard.jsx
│       │   │   │   ├── OrderHistory.jsx
│       │   │   │   ├── OrderTracking.jsx
│       │   │   │   ├── PaymentMethodModal.jsx
│       │   │   │   ├── QRScanner.jsx
│       │   │   │   ├── QRScannerView.jsx
│       │   │   │   ├── RecommendationsSection.jsx
│       │   │   │   ├── SplitBillModal.jsx
│       │   │   │   ├── TableLogin.jsx
│       │   │   │   └── UserNamePrompt.jsx
│       │   │   ├── hooks/
│       │   │   │   ├── useAutoSlider.js
│       │   │   │   ├── useCart.js
│       │   │   │   ├── useCurrentOrder.js
│       │   │   │   ├── useFavorites.js
│       │   │   │   ├── useGeofencing.js
│       │   │   │   ├── useLoyalty.js
│       │   │   │   ├── useMenu.js
│       │   │   │   ├── useOrders.js
│       │   │   │   ├── useOrderSession.js
│       │   │   │   ├── useRecommendations.js
│       │   │   │   ├── useSplitBill.js
│       │   │   │   ├── useTableSession.js
│       │   │   │   └── useWeatherAnimations.js
│       │   │   ├── pages/
│       │   │   │   ├── ActiveOrderPage.jsx
│       │   │   │   ├── CartPage.jsx
│       │   │   │   ├── LoginPage.jsx
│       │   │   │   ├── MenuPage.jsx
│       │   │   │   ├── OrderDetailsPage.jsx
│       │   │   │   ├── OrdersPage.jsx
│       │   │   │   ├── PaymentPage.jsx
│       │   │   │   ├── PaymentSuccessPage.jsx
│       │   │   │   ├── ProfilePage.jsx
│       │   │   │   └── UsernamePage.jsx
│       │   │   └── services/
│       │   │       ├── loyaltyService.js
│       │   │       ├── menuService.js
│       │   │       ├── recommendationsService.js
│       │   │       └── tableSessionService.js
│       │   │
│       │   ├── manager/
│       │   │   ├── components/
│       │   │   │   ├── CreateStaffModal.jsx
│       │   │   │   ├── CreateTableModal.jsx
│       │   │   │   ├── Dashboard.jsx
│       │   │   │   ├── InventoryOverview.jsx
│       │   │   │   ├── QRCodeDisplay.jsx
│       │   │   │   ├── ReportsPanel.jsx
│       │   │   │   ├── SalesAnalytics.jsx
│       │   │   │   ├── StaffCredentialsCard.jsx
│       │   │   │   ├── StaffManagement.jsx
│       │   │   │   └── TableManagement.jsx
│       │   │   ├── hooks/
│       │   │   │   ├── useDashboard.js
│       │   │   │   ├── useInventory.js
│       │   │   │   ├── useReports.js
│       │   │   │   ├── useSalesAnalytics.js
│       │   │   │   ├── useStaffManagement.js
│       │   │   │   └── useTableManagement.js
│       │   │   ├── pages/
│       │   │   │   ├── DashboardPage.jsx
│       │   │   │   ├── InventoryPage.jsx
│       │   │   │   ├── ReportsPage.jsx
│       │   │   │   ├── StaffCredentialsPage.jsx
│       │   │   │   ├── StaffPage.jsx
│       │   │   │   └── TablesPage.jsx
│       │   │   └── services/
│       │   │       ├── managerService.js
│       │   │       ├── staffService.js
│       │   │       └── tableService.js
│       │   │
│       │   └── waiter/
│       │       ├── components/
│       │       │   ├── ActiveOrders.jsx
│       │       │   ├── AssignedTables.jsx
│       │       │   ├── AssignmentNotification.jsx
│       │       │   ├── CustomerArrivalNotification.jsx
│       │       │   ├── CustomerRequests.jsx
│       │       │   ├── TableLayout.jsx
│       │       │   └── ZoneManagement.jsx
│       │       ├── hooks/
│       │       │   ├── useAssignmentNotifications.js
│       │       │   ├── useCustomerNotifications.js
│       │       │   ├── useTables.js
│       │       │   └── useWaiterOrders.js
│       │       ├── pages/
│       │       │   ├── OrdersPage.jsx
│       │       │   └── TablesPage.jsx
│       │       └── services/
│       │           ├── notificationService.js
│       │           ├── tableService.js
│       │           └── waiterService.js
│       │
│       ├── pages/
│       │   └── auth/
│       │       └── UnifiedLogin.jsx
│       │
│       ├── routes/
│       │   ├── AppRoutes.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── RoleBasedRoute.jsx
│       │   └── roleRoutes.js
│       │
│       ├── shared/
│       │   ├── components/
│       │   │   ├── Button.jsx
│       │   │   ├── Card.jsx
│       │   │   ├── ErrorBoundary.jsx
│       │   │   ├── Input.jsx
│       │   │   ├── Loader.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── NotFound.jsx
│       │   │   ├── NotificationBell.jsx
│       │   │   ├── NotificationSettings.jsx
│       │   │   ├── NotificationToast.jsx
│       │   │   ├── SuccessAnimation.jsx
│       │   │   ├── Table.jsx
│       │   │   ├── ThemeToggle.jsx
│       │   │   ├── Toast.jsx
│       │   │   └── Unauthorized.jsx
│       │   ├── context/
│       │   │   └── ThemeContext.jsx
│       │   ├── hooks/
│       │   │   ├── useAuth.js
│       │   │   ├── useDebounce.js
│       │   │   ├── useNotifications.js
│       │   │   ├── useTheme.js
│       │   │   └── useToast.js
│       │   ├── layouts/
│       │   │   ├── AuthLayout.jsx
│       │   │   └── DashboardLayout.jsx
│       │   ├── services/
│       │   │   ├── geofencing.service.js
│       │   │   ├── notificationService.js
│       │   │   ├── socketService.js
│       │   │   └── weatherService.js
│       │   └── utils/
│       │       ├── api.js
│       │       ├── formatters.js
│       │       ├── location.js
│       │       ├── session.js
│       │       ├── soundPlayer.js
│       │       ├── validators.js
│       │       └── vibration.js
│       │
│       ├── store/
│       │   ├── slices/
│       │   │   ├── authSlice.js
│       │   │   ├── cartSlice.js
│       │   │   ├── loyaltySlice.js
│       │   │   ├── menuSlice.js
│       │   │   └── orderSlice.js
│       │   └── store.js
│       │
│       └── styles/
│           ├── App.css
│           └── globals.css
│
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── download-models.mjs
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore
├── docker-compose.yml
└── Dockerfile





