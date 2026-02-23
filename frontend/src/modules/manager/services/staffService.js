import axios from '@/api/axios';

const BASE_URL = '/manager/staff';

// ✅ FIXED: axios interceptor already returns response.data
// So we don't need to do response.data again!

// Create staff member
export const createStaff = async (staffData) => {
  const data = await axios.post(BASE_URL, staffData);
  return data; // ✅ Already the data object
};

// Get all staff
export const getAllStaff = async (params = {}) => {
  const data = await axios.get(BASE_URL, { params });
  return data; // ✅ Already the data object
};

// Get single staff member
export const getStaffById = async (staffId) => {
  const data = await axios.get(`${BASE_URL}/${staffId}`);
  return data; // ✅ Already the data object
};

// Update staff member
export const updateStaff = async (staffId, staffData) => {
  const data = await axios.put(`${BASE_URL}/${staffId}`, staffData);
  return data; // ✅ Already the data object
};

// Delete staff member
export const deleteStaff = async (staffId) => {
  const data = await axios.delete(`${BASE_URL}/${staffId}`);
  return data; // ✅ Already the data object
};

// Reset staff password
export const resetStaffPassword = async (staffId) => {
  const data = await axios.post(`${BASE_URL}/${staffId}/reset-password`);
  return data; // ✅ Already the data object
};

// Get staff statistics
export const getStaffStats = async () => {
  const data = await axios.get(`${BASE_URL}/stats`);
  return data; // ✅ Already the data object
};

export default {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  resetStaffPassword,
  getStaffStats
};