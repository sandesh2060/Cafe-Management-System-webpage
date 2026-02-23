import axios from '@/api/axios';

const BASE_URL = '/manager/tables';

// Create table
export const createTable = async (tableData) => {
  const response = await axios.post(BASE_URL, tableData);
  return response; // ✅ ADD THIS
};

// Get all tables
export const getAllTables = async (params = {}) => {
  const response = await axios.get(BASE_URL, { params });
  return response; // ✅ ADD THIS - WAS MISSING!
};

// Get single table
export const getTableById = async (tableId) => {
  const response = await axios.get(`${BASE_URL}/${tableId}`);
  return response; // ✅ ADD THIS
};

// Update table
export const updateTable = async (tableId, tableData) => {
  const response = await axios.put(`${BASE_URL}/${tableId}`, tableData);
  return response; // ✅ ADD THIS
};

// Delete table
export const deleteTable = async (tableId) => {
  const response = await axios.delete(`${BASE_URL}/${tableId}`);
  return response; // ✅ ADD THIS
};

// Regenerate QR code
export const regenerateQR = async (tableId) => {
  const response = await axios.post(`${BASE_URL}/${tableId}/regenerate-qr`);
  return response; // ✅ ADD THIS
};

// Get table statistics
export const getTableStats = async (params = {}) => {
  const response = await axios.get(`${BASE_URL}/stats`, { params });
  return response; // ✅ ADD THIS
};

export default {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  deleteTable,
  regenerateQR,
  getTableStats
};