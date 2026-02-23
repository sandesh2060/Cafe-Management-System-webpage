// File: frontend/src/modules/manager/hooks/useDashboard.js
// ✅ FIXED: Axios interceptor already returns response.data

import { useState, useCallback } from 'react';
import { managerAPI } from '@/api/endpoints';

export const useDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 Fetching dashboard stats...');
      
      const response = await managerAPI.getDashboardStats();
      
      // ✅ Your axios interceptor ALREADY returns response.data
      // So 'response' IS the data object, not the Axios response wrapper
      console.log('📊 Stats received:', response);
      
      setStats(response);  // ✅ Just use response directly!
      console.log('✅ Stats set successfully');
      
    } catch (err) {
      console.error('❌ Error fetching dashboard stats:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch dashboard stats';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats,
  };
};