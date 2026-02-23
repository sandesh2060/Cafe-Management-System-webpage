// File: frontend/src/modules/manager/hooks/useTableManagement.js
// ✅ FINAL FIX - Handles response.data correctly when interceptor returns response.data

import { useState, useEffect, useCallback, useRef } from 'react';
import tableService from '../services/tableService';
import { useToast } from '@/shared/hooks/useToast';

export const useTableManagement = () => {
  const [tables, setTables] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    restaurant: '',
    page: 1,
    limit: 50
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasMore: false
  });

  const toast = useToast();
  const isMounted = useRef(false);

  // Fetch tables function
  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Fetching tables with filters:', filters);
      const response = await tableService.getAllTables(filters);
      
      console.log('📥 Tables API response:', response);
      
      // ✅ CRITICAL FIX: Handle interceptor that returns response.data
      // Response structure after interceptor:
      // { success: true, data: { tables: [...], pagination: {...} } }
      
      if (response?.success || response?.data) {
        // ✅ Extract the actual data object
        const apiData = response.data || response;
        
        console.log('📦 Extracted apiData:', apiData);
        
        // ✅ Tables can be at data.tables OR data.data.tables
        const tablesData = apiData.tables || apiData.data?.tables || [];
        
        console.log('✅ Setting tables:', tablesData.length, 'tables');
        console.log('🪑 Tables array:', tablesData);
        
        setTables(tablesData);
        
        // ✅ Extract pagination
        const paginationData = apiData.pagination || apiData.data?.pagination || {
          currentPage: 1,
          totalPages: 1,
          total: tablesData.length,
          hasMore: false
        };
        
        console.log('📄 Pagination:', paginationData);
        setPagination(paginationData);
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        setTables([]);
      }
    } catch (err) {
      const errorMsg = err.message || err.response?.data?.message || 'Failed to fetch tables';
      console.error('❌ Fetch tables error:', errorMsg);
      console.error('Full error:', err);
      setError(errorMsg);
      
      if (toast?.error) {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch stats function
  const fetchStats = useCallback(async () => {
    try {
      const response = await tableService.getTableStats(
        filters.restaurant ? { restaurant: filters.restaurant } : {}
      );
      
      console.log('📊 Stats response:', response);
      
      if (response?.success || response?.data) {
        // ✅ Handle both response formats
        const statsData = response.stats || response.data?.stats || response.data || null;
        console.log('📊 Setting stats:', statsData);
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to fetch table stats:', err);
    }
  }, [filters.restaurant]);

  // Create table
  const createTable = async (tableData) => {
    try {
      setCreating(true);
      setError(null);
      
      console.log('🔄 Creating table:', tableData);
      const response = await tableService.createTable(tableData);
      
      console.log('✅ Table created, response:', response);
      
      if (response?.success || response?.data) {
        if (toast?.success) {
          toast.success('Table created successfully with QR code');
        }
        
        // Force immediate refresh
        console.log('🔄 Refreshing table list...');
        await fetchTables();
        await fetchStats();
        console.log('✅ Refresh complete');
        
        return response.data || response;
      }
    } catch (err) {
      const errorMsg = err.message || err.response?.data?.message || 'Failed to create table';
      console.error('❌ Create table error:', errorMsg);
      setError(errorMsg);
      
      if (toast?.error) {
        toast.error(errorMsg);
      }
      throw err;
    } finally {
      setCreating(false);
    }
  };

  // Update table
  const updateTable = async (tableId, tableData) => {
    try {
      setUpdating(true);
      setError(null);
      const response = await tableService.updateTable(tableId, tableData);
      
      if (response?.success || response?.data) {
        if (toast?.success) {
          toast.success('Table updated successfully');
        }
        
        await fetchTables();
        return response.data?.table || response.table || response.data;
      }
    } catch (err) {
      const errorMsg = err.message || err.response?.data?.message || 'Failed to update table';
      setError(errorMsg);
      
      if (toast?.error) {
        toast.error(errorMsg);
      }
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Delete table
  const deleteTable = async (tableId) => {
    try {
      setDeleting(true);
      setError(null);
      const response = await tableService.deleteTable(tableId);
      
      if (response?.success || response?.data !== undefined) {
        if (toast?.success) {
          toast.success('Table deleted successfully');
        }
        
        await fetchTables();
        await fetchStats();
      }
    } catch (err) {
      const errorMsg = err.message || err.response?.data?.message || 'Failed to delete table';
      setError(errorMsg);
      
      if (toast?.error) {
        toast.error(errorMsg);
      }
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  // Regenerate QR code
  const regenerateQR = async (tableId) => {
    try {
      setError(null);
      const response = await tableService.regenerateQR(tableId);
      
      if (response?.success || response?.data) {
        if (toast?.success) {
          toast.success('QR code regenerated successfully');
        }
        
        await fetchTables();
        return response.data || response;
      }
    } catch (err) {
      const errorMsg = err.message || err.response?.data?.message || 'Failed to regenerate QR code';
      setError(errorMsg);
      
      if (toast?.error) {
        toast.error(errorMsg);
      }
      throw err;
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Change page
  const changePage = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Load data on mount and filter changes
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      fetchTables();
      fetchStats();
      return;
    }

    fetchTables();
    fetchStats();
  }, [fetchTables, fetchStats]);

  return {
    // Data
    tables,
    stats,
    pagination,
    filters,
    
    // Loading states
    loading,
    creating,
    updating,
    deleting,
    error,
    
    // Actions
    createTable,
    updateTable,
    deleteTable,
    regenerateQR,
    updateFilters,
    changePage,
    refresh: fetchTables
  };
};