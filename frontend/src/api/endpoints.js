// File: frontend/src/api/endpoints.js
// 🎯 COMPLETE API ENDPOINTS - PRODUCTION READY
// ✅ FIX: toggleFavorite now sends { menuItemId } not { itemId }
//         Backend validator expects "menuItemId" field name

import axios from "./axios";

// ============================================
// TABLE API ENDPOINTS
// ============================================
export const tableAPI = {
  getAll: (params = {}) => axios.get("/tables", { params }),
  getById: (tableId) => axios.get(`/tables/${tableId}`),
  getByNumber: (tableNumber) => axios.get(`/tables/number/${tableNumber}`),
  verifyQRCode: (qrData) => axios.post("/tables/verify-qr", qrData),
  matchLocation: (locationData) =>
    axios.post("/tables/match-location", locationData),
  updateStatus: (tableId, status) =>
    axios.patch(`/tables/${tableId}/status`, { status }),
  create: (tableData) => axios.post("/tables", tableData),
  update: (tableId, updateData) => axios.put(`/tables/${tableId}`, updateData),
  delete: (tableId) => axios.delete(`/tables/${tableId}`),
  getStatus: (tableId) => axios.get(`/tables/${tableId}/status`),
  getQRCode: (tableId) => axios.get(`/tables/${tableId}/qrcode`),
  getActiveSession: (tableId) => axios.get(`/tables/${tableId}/session`),
};

// ============================================
// ZONE API ENDPOINTS
// ============================================
export const zoneAPI = {
  validateLocation: (locationData) =>
    axios.post("/zones/validate-location", locationData),
  checkCustomer: (checkData) => axios.post("/zones/check-customer", checkData),
  findNearest: (locationData) => axios.post("/zones/nearest", locationData),
  getAll: (params = {}) => axios.get("/zones", { params }),
  getById: (zoneId) => axios.get(`/zones/${zoneId}`),
  create: (zoneData) => axios.post("/zones", zoneData),
  update: (zoneId, updateData) => axios.put(`/zones/${zoneId}`, updateData),
  delete: (zoneId) => axios.delete(`/zones/${zoneId}`),
  getStatistics: (zoneId) => axios.get(`/zones/${zoneId}/statistics`),
  assignTables: (zoneId, tableIds) =>
    axios.post(`/zones/${zoneId}/tables`, { tableIds }),
  updateSettings: (zoneId, settings) =>
    axios.patch(`/zones/${zoneId}/settings`, settings),
  getByType: (type) => axios.get(`/zones/type/${type}`),
};

// ============================================
// CUSTOMER API ENDPOINTS
// ============================================
export const customerAPI = {
  login: (credentials) => axios.post("/customers/login", credentials),
  checkUsername: (username) =>
    axios.get("/customers/check-username", { params: { username } }),
  startSession: (sessionData) =>
    axios.post("/customers/start-session", sessionData),
  endSession: (customerId, sessionId) =>
    axios.post("/customers/end-session", { customerId, sessionId }),
  register: (customerData) => axios.post("/customers/register", customerData),
  getProfile: (customerId) => axios.get(`/customers/${customerId}`),
  updateProfile: (customerId, data) =>
    axios.put(`/customers/${customerId}`, data),
  updateCustomer: (customerId, data) =>
    axios.put(`/customers/${customerId}`, data),
  getOrders: (customerId) => axios.get(`/customers/${customerId}/orders`),
  getStats: (customerId) => axios.get(`/customers/${customerId}/stats`),
  getFavorites: (customerId) => axios.get(`/customers/${customerId}/favorites`),

  // Backend route: POST /customers/:customerId/favorites/:menuItemId
  addFavorite: (customerId, menuItemId) =>
    axios.post(`/customers/${customerId}/favorites/${menuItemId}`),

  // Backend route: DELETE /customers/:customerId/favorites/:menuItemId
  removeFavorite: (customerId, menuItemId) =>
    axios.delete(`/customers/${customerId}/favorites/${menuItemId}`),

  // ✅ FIX: menuItemId is a URL param not body — route is /:menuItemId/toggle
  toggleFavorite: (customerId, menuItemId) =>
    axios.post(`/customers/${customerId}/favorites/${menuItemId}/toggle`),
};

// ============================================
// ORDER API ENDPOINTS
// ============================================
export const orderAPI = {
  getCustomerOrders: (customerId, params = {}) =>
    axios.get(`/orders/customer/${customerId}`, { params }),
  getById: (orderId) => axios.get(`/orders/${orderId}`),
  createOrder: (orderData) => axios.post("/orders", orderData),
  updateOrderStatus: (orderId, status, updatedBy) =>
    axios.patch(`/orders/${orderId}/status`, { status, updatedBy }),
  cancel: (orderId, reason, cancelledBy) =>
    axios.patch(`/orders/${orderId}/cancel`, { reason, cancelledBy }),
  trackOrder: (orderId) => axios.get(`/orders/${orderId}/track`),
  getTableOrders: (tableId, params = {}) =>
    axios.get(`/orders/table/${tableId}`, { params }),
  getAllOrders: (params = {}) => axios.get("/orders", { params }),
  getActiveOrders: () => axios.get("/orders/active"),
  getKitchenQueue: () => axios.get("/orders/kitchen/queue"),
  getOrderStatistics: (params = {}) => axios.get("/orders/stats", { params }),
};

// ============================================
// MENU API ENDPOINTS
// ============================================
export const menuAPI = {
  getAll: (params = {}) => axios.get("/menu", { params }),
  getById: (id) => axios.get(`/menu/${id}`),
  getCategories: () => axios.get("/menu/categories"),
  getPopular: (limit = 10) => axios.get("/menu/popular", { params: { limit } }),
  search: (query) => axios.get("/menu/search", { params: { q: query } }),
  create: (itemData) => axios.post("/menu", itemData),
  update: (id, updates) => axios.put(`/menu/${id}`, updates),
  delete: (id) => axios.delete(`/menu/${id}`),
};

// ============================================
// RECOMMENDATIONS API
// ============================================
export const recommendationsAPI = {
  getPersonalized: (customerId, params = {}) =>
    axios.get(`/recommendations/personalized/${customerId}`, { params }),
  getSuperPersonalized: (customerId, params = {}) =>
    axios.get(`/recommendations/super-personalized/${customerId}`, { params }),
  getTrending: (params = {}) =>
    axios.get("/recommendations/trending", { params }),
  getTimeBased: (params = {}) =>
    axios.get("/recommendations/time-based", { params }),
  getWeatherBased: (params = {}) =>
    axios.get("/recommendations/weather-based", { params }),
  getComplementary: (cartItems, params = {}) =>
    axios.post("/recommendations/complementary", { cartItems }, { params }),
  getFrequentlyTogether: (menuItemId, params = {}) =>
    axios.get(`/recommendations/frequently-together/${menuItemId}`, { params }),
  trackView: (menuItemId) =>
    axios.post("/recommendations/track-view", { menuItemId }),
};

// ============================================
// LOYALTY API ENDPOINTS
// ============================================
export const loyaltyAPI = {
  getCustomerLoyalty: (customerId) =>
    axios.get(`/loyalty/customer/${customerId}`),
  addVisit: (customerId) => axios.post("/loyalty/add-visit", { customerId }),
  claimReward: (customerId, rewardItemId) =>
    axios.post("/loyalty/claim-reward", { customerId, itemId: rewardItemId }),
  getFreeItems: () => axios.get("/loyalty/free-items"),
  getHistory: (customerId) => axios.get(`/loyalty/history/${customerId}`),
  canClaimReward: (customerId) => axios.get(`/loyalty/can-claim/${customerId}`),
  getPoints: (customerId) => axios.get(`/loyalty/customer/${customerId}`),
  addPoints: (customerId, points, reason) =>
    axios.post("/loyalty/add", { customerId, points, reason }),
  redeemPoints: (customerId, points) =>
    axios.post("/loyalty/redeem", { customerId, points }),
  getTransactions: (customerId) =>
    axios.get(`/loyalty/transactions/${customerId}`),
  getRewards: () => axios.get("/loyalty/rewards"),
};

// ============================================
// CART API
// ============================================
export const cartAPI = {
  getCart: (customerId) => axios.get(`/customers/${customerId}/cart`),
  addToCart: (customerId, item) =>
    axios.post(`/customers/${customerId}/cart/items`, item),
  updateCartItem: (customerId, itemId, updates) =>
    axios.put(`/customers/${customerId}/cart/items/${itemId}`, updates),
  removeFromCart: (customerId, itemId) =>
    axios.delete(`/customers/${customerId}/cart/items/${itemId}`),
  clearCart: (customerId) => axios.delete(`/customers/${customerId}/cart`),
  validateCart: (customerId) =>
    axios.post(`/customers/${customerId}/cart/validate`),
};

// ============================================
// BIOMETRIC API
// ============================================
export const biometricAPI = {
  registerFace: (customerId, faceData) =>
    axios.post("/biometric/face/register", { customerId, faceData }),
  verifyFace: (faceData, tableNumber) =>
    axios.post("/biometric/face/verify", { faceData, tableNumber }),
  registerFingerprint: (customerId, fingerprintData) =>
    axios.post("/biometric/fingerprint/register", {
      customerId,
      fingerprintData,
    }),
  verifyFingerprint: (fingerprintData, tableNumber) =>
    axios.post("/biometric/fingerprint/verify", {
      fingerprintData,
      tableNumber,
    }),
  checkRegistration: (customerId) =>
    axios.get(`/biometric/check/${customerId}`),
  deleteBiometric: (customerId, type) =>
    axios.delete(`/biometric/${customerId}/${type}`),
};

// ============================================
// SPLIT BILL API
// ============================================
export const splitBillAPI = {
  processSplitPayment: (paymentData) =>
    axios.post("/billing/split", paymentData),
  calculateSplit: (orderId, splitType, numberOfPeople) =>
    axios.post("/billing/calculate-split", {
      orderId,
      splitType,
      numberOfPeople,
    }),
  getSplitStatus: (orderId) => axios.get(`/billing/split-status/${orderId}`),
};

// ============================================
// KITCHEN, BILLING, INVENTORY, USER, AUTH APIs
// ============================================
export const kitchenAPI = {
  getQueue: () => axios.get("/kitchen/queue"),
  updateItemStatus: (orderItemId, status) =>
    axios.patch(`/kitchen/item/${orderItemId}/status`, { status }),
  getStats: () => axios.get("/kitchen/stats"),
};

export const billingAPI = {
  createBill: (billData) => axios.post("/billing", billData),
  getBillByOrder: (orderId) => axios.get(`/billing/order/${orderId}`),
  processPayment: (billId, paymentData) =>
    axios.post(`/billing/${billId}/payment`, paymentData),
  processSplit: (paymentData) => splitBillAPI.processSplitPayment(paymentData),
};

export const inventoryAPI = {
  getAll: () => axios.get("/inventory"),
  update: (itemId, updates) => axios.put(`/inventory/${itemId}`, updates),
  getLowStock: () => axios.get("/inventory/low-stock"),
};

export const userAPI = {
  getAll: () => axios.get("/users"),
  getById: (userId) => axios.get(`/users/${userId}`),
  create: (userData) => axios.post("/users", userData),
  update: (userId, updates) => axios.put(`/users/${userId}`, updates),
  delete: (userId) => axios.delete(`/users/${userId}`),
};

export const authAPI = {
  login: (credentials) => axios.post("/auth/login", credentials),
  logout: () => axios.post("/auth/logout"),
  refreshToken: () => axios.post("/auth/refresh"),
  verifyToken: () => axios.get("/auth/verify"),
};

export const managerAPI = {
  getDashboardStats: () => axios.get("/manager/dashboard-stats"),
  getSalesAnalytics: (params = {}) =>
    axios.get("/manager/analytics/sales", { params }),
  getInventory: (params = {}) => axios.get("/manager/inventory", { params }),
  getRevenueReport: (startDate, endDate) =>
    axios.get("/manager/reports/revenue", { params: { startDate, endDate } }),
  downloadRevenueReport: (startDate, endDate) =>
    axios.get("/manager/reports/revenue/download", {
      params: { startDate, endDate },
      responseType: "blob",
    }),
  createStaff: (staffData) => axios.post("/manager/staff", staffData),
  getAllStaff: (params = {}) => axios.get("/manager/staff", { params }),
  getStaffStats: () => axios.get("/manager/staff/stats"),
  getStaffMember: (staffId) => axios.get(`/manager/staff/${staffId}`),
  updateStaff: (staffId, updateData) =>
    axios.put(`/manager/staff/${staffId}`, updateData),
  deleteStaff: (staffId) => axios.delete(`/manager/staff/${staffId}`),
  resetStaffPassword: (staffId) =>
    axios.post(`/manager/staff/${staffId}/reset-password`),
  verifyPassword: (data) => axios.post("/manager/verify-password", data),
  createTable: (tableData) => axios.post("/manager/tables", tableData),
  getAllTables: (params = {}) => axios.get("/manager/tables", { params }),
  getTableStats: (params = {}) =>
    axios.get("/manager/tables/stats", { params }),
  getTable: (tableId) => axios.get(`/manager/tables/${tableId}`),
  updateTable: (tableId, updateData) =>
    axios.put(`/manager/tables/${tableId}`, updateData),
  deleteTable: (tableId) => axios.delete(`/manager/tables/${tableId}`),
  regenerateTableQR: (tableId) =>
    axios.post(`/manager/tables/${tableId}/regenerate-qr`),
};

export const weatherAPI = {
  getCurrentWeather: (lat, lon) =>
    axios.get("/weather/current", { params: { lat, lon } }),
  getWeatherForecast: (lat, lon, days = 7) =>
    axios.get("/weather/forecast", { params: { lat, lon, days } }),
};

export default {
  tableAPI,
  zoneAPI,
  orderAPI,
  menuAPI,
  customerAPI,
  loyaltyAPI,
  cartAPI,
  recommendationsAPI,
  biometricAPI,
  splitBillAPI,
  kitchenAPI,
  billingAPI,
  inventoryAPI,
  userAPI,
  authAPI,
  managerAPI,
  weatherAPI,
};
