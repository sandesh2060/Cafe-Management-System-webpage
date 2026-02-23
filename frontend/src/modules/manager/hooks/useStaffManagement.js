import { useState, useEffect, useCallback } from 'react';
import staffService from '../services/staffService';
import { useToast } from '@/shared/hooks/useToast';

export const useStaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasMore: false
  });

  const { showToast, success: toastSuccess, error: toastError } = useToast();

  // Fetch all staff
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await staffService.getAllStaff(filters);
      
      if (response.success) {
        setStaff(response.staff);
        setPagination(response.pagination);
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to fetch staff';
      setError(errorMsg);
      toastError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [filters]); // ✅ REMOVED toastError dependency

  // Fetch staff statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await staffService.getStaffStats();
      
      if (response.success && response.data) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch staff stats:', err);
    }
  }, []); // ✅ No dependencies - never changes

  // Create staff member
  const createStaff = async (staffData) => {
    try {
      setCreating(true);
      setError(null);
      
      const response = await staffService.createStaff(staffData);
      
      if (response.success) {
        toastSuccess(response.message || 'Staff member created successfully');
        
        fetchStaff();
        fetchStats();
        
        return response.data || response.user;
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to create staff member';
      setError(errorMsg);
      toastError(errorMsg);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  // Update staff member
  const updateStaff = async (staffId, staffData) => {
    try {
      setUpdating(true);
      setError(null);
      
      const response = await staffService.updateStaff(staffId, staffData);
      
      if (response.success) {
        toastSuccess('Staff member updated successfully');
        
        fetchStaff();
        return response.data?.user || response.user;
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to update staff member';
      setError(errorMsg);
      toastError(errorMsg);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Delete staff member
  const deleteStaff = async (staffId) => {
    try {
      setDeleting(true);
      setError(null);
      
      const response = await staffService.deleteStaff(staffId);
      
      if (response.success) {
        toastSuccess('Staff member deleted successfully');
        
        fetchStaff();
        fetchStats();
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete staff member';
      setError(errorMsg);
      toastError(errorMsg);
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  // Reset staff password
  const resetPassword = async (staffId) => {
    try {
      setError(null);
      
      const response = await staffService.resetStaffPassword(staffId);
      
      if (response.success) {
        toastSuccess('Password reset successfully');
        
        return response.data || response;
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to reset password';
      setError(errorMsg);
      toastError(errorMsg);
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

  // ✅ FIXED: Load initial data - runs only ONCE on mount
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]); // fetchStaff only changes when filters change

  // ✅ FIXED: Load stats only ONCE on mount
  useEffect(() => {
    fetchStats();
  }, []); // Empty deps = runs once on mount

  return {
    // Data
    staff,
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
    createStaff,
    updateStaff,
    deleteStaff,
    resetPassword,
    updateFilters,
    changePage,
    refresh: fetchStaff
  };
};