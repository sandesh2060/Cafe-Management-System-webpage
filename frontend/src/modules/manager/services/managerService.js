
// File : frontend/src/modules/manager/services/managerService.js
import api from '@/api/axios';

const managerService = {
  getDashboardStats: async () => {
    const response = await api.get('/manager/dashboard/stats');
    return response.data;
  },

  getSalesAnalytics: async (period) => {
    const response = await api.get(`/manager/analytics/sales?period=${period}`);
    return response.data;
  },

  getStaffPerformance: async (period = 'week') => {
    const response = await api.get(`/manager/analytics/staff?period=${period}`);
    return response.data;
  },

  getInventoryStatus: async () => {
    const response = await api.get('/manager/inventory/status');
    return response.data;
  },

  getRevenueReport: async (startDate, endDate) => {
    const response = await api.get(`/manager/reports/revenue?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  manageStaff: async (action, userId, data) => {
    const response = await api.post('/manager/staff/manage', { action, userId, data });
    return response.data;
  },

  updateSystemSettings: async (settings) => {
    const response = await api.put('/manager/settings', { settings });
    return response.data;
  }
};

export default managerService;
