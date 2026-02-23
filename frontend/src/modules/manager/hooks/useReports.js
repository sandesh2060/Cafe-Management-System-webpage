// File: frontend/src/modules/manager/hooks/useReports.js
// ✅ FIXED: Handle backend response structure correctly

import { useState, useCallback } from 'react';
import { managerAPI } from '@/api/managerEndpoints';

export const useReports = () => {
  const [revenueReport, setRevenueReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRevenueReport = useCallback(async (startDate, endDate) => {
    if (!startDate || !endDate) {
      setError('Please provide both start and end dates');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await managerAPI.getRevenueReport(startDate, endDate);
      
      // Backend returns: { success: true, data: { summary: {...}, categoryData: [...], ... }, message: '...' }
      const reportData = response.data?.data || response.data;
      
      setRevenueReport(reportData);
      
      console.log('📊 Revenue report loaded:', {
        dateRange: `${startDate} to ${endDate}`,
        totalRevenue: reportData.summary?.totalRevenue,
        totalOrders: reportData.summary?.totalOrders
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch revenue report';
      setError(errorMsg);
      console.error('Revenue report error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadReport = useCallback(async (startDate, endDate) => {
    try {
      const response = await managerAPI.downloadRevenueReport(startDate, endDate);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `revenue-report-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('📥 Report downloaded');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to download report';
      console.error('Download report error:', err);
      throw new Error(errorMsg);
    }
  }, []);

  return { 
    revenueReport, 
    loading, 
    error, 
    fetchRevenueReport, 
    downloadReport 
  };
};