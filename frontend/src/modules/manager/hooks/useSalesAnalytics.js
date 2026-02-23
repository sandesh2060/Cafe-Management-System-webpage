// File: frontend/src/modules/manager/hooks/useSalesAnalytics.js
// ✅ FIXED: Handle backend response structure correctly

import { useState, useCallback } from 'react';
import { managerAPI } from '@/api/managerEndpoints';

export const useSalesAnalytics = () => {
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async (period = 'week') => {
    setLoading(true);
    setError(null);
    try {
      const response = await managerAPI.getSalesAnalytics({ period });
      
      // Backend returns: { success: true, data: { salesData: [...], categoryData: [...] }, message: '...' }
      const data = response.data?.data || response.data;
      
      setSalesData(data.salesData || []);
      setCategoryData(data.categoryData || []);
      
      console.log('📈 Sales analytics loaded:', {
        period,
        salesDataPoints: data.salesData?.length || 0,
        categories: data.categoryData?.length || 0
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch analytics';
      setError(errorMsg);
      console.error('Sales analytics error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    salesData, 
    categoryData, 
    loading, 
    error, 
    fetchAnalytics 
  };
};