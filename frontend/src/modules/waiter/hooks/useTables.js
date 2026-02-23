// File: frontend/src/modules/waiter/hooks/useTables.js
// 🪑 TABLES HOOK - Manage waiter's assigned tables
// ✅ Real-time updates, table status, customer info

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import waiterService from '../services/waiterService';
import socketService from '@/shared/services/socketService';

export const useTables = (waiterId) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    occupied: 0,
    available: 0,
    reserved: 0
  });

  const isMountedRef = useRef(true);
  const socketConnectedRef = useRef(false);

  /**
   * Fetch assigned tables
   */
  const fetchTables = useCallback(async () => {
    if (!waiterId) {
      console.warn('⚠️ No waiter ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📡 Fetching tables for waiter:', waiterId);
      const response = await waiterService.getAssignedTables(waiterId);

      if (!isMountedRef.current) return;

      // Handle different response formats
      let tablesArray = [];
      if (response.tables && Array.isArray(response.tables)) {
        tablesArray = response.tables;
      } else if (response.data?.tables && Array.isArray(response.data.tables)) {
        tablesArray = response.data.tables;
      } else if (Array.isArray(response)) {
        tablesArray = response;
      }

      console.log(`✅ Found ${tablesArray.length} assigned tables`);
      setTables(tablesArray);

      // Calculate stats
      updateStats(tablesArray);

    } catch (err) {
      if (!isMountedRef.current) return;
      
      console.error('❌ Fetch tables error:', err);
      
      // If 404, waiter might not have assigned tables yet
      if (err.response?.status === 404 || err.status === 404) {
        setTables([]);
        setError('No tables assigned yet');
      } else {
        const errorMsg = err.message || 'Failed to fetch tables';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [waiterId]);

  /**
   * Update statistics
   */
  const updateStats = useCallback((tablesArray) => {
    const stats = {
      total: tablesArray.length,
      occupied: tablesArray.filter(t => t.status === 'occupied').length,
      available: tablesArray.filter(t => t.status === 'available').length,
      reserved: tablesArray.filter(t => t.status === 'reserved').length
    };
    
    setStats(stats);
    console.log('📊 Table stats:', stats);
  }, []);

  /**
   * Get table by ID
   */
  const getTableById = useCallback(async (tableId) => {
    try {
      console.log('🔍 Fetching table details:', tableId);
      const response = await waiterService.getTableDetails(tableId);
      
      const table = response.table || response.data?.table || response;
      return table;
    } catch (err) {
      console.error('❌ Get table error:', err);
      toast.error('Failed to fetch table details');
      return null;
    }
  }, []);

  /**
   * Update table status
   */
  const updateTableStatus = useCallback(async (tableId, status) => {
    try {
      console.log('🔄 Updating table status:', { tableId, status });
      
      const response = await waiterService.updateTableStatus(tableId, status, waiterId);

      if (response.success !== false) {
        // Update local state
        setTables(prev => 
          prev.map(table => 
            table._id === tableId || table.id === tableId
              ? { ...table, status }
              : table
          )
        );

        toast.success(`Table status updated to ${status}`);
        
        // Refresh stats
        await fetchTables();
        
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('❌ Update table status error:', err);
      toast.error(err.message || 'Failed to update table status');
      return { success: false, error: err.message };
    }
  }, [waiterId, fetchTables]);

  /**
   * Get table session (active customers)
   */
  const getTableSession = useCallback(async (tableId) => {
    try {
      console.log('🔍 Fetching table session:', tableId);
      const response = await waiterService.getTableSession(tableId);
      
      const session = response.session || response.data?.session || response;
      return session;
    } catch (err) {
      console.error('❌ Get table session error:', err);
      
      // 404 means no active session - not an error
      if (err.response?.status === 404 || err.status === 404) {
        return null;
      }
      
      toast.error('Failed to fetch table session');
      return null;
    }
  }, []);

  /**
   * Setup WebSocket for real-time updates
   */
  useEffect(() => {
    if (!waiterId || socketConnectedRef.current) return;

    const socket = socketService.connect();
    if (!socket) {
      console.warn('⚠️ Socket service not available');
      return;
    }

    // Join waiter room
    socketService.joinRoom(`waiter:${waiterId}`);
    socketConnectedRef.current = true;

    // Listen for table updates
    socketService.on('table:updated', (data) => {
      console.log('📡 Table updated:', data);
      
      setTables(prev =>
        prev.map(table =>
          (table._id === data.tableId || table.id === data.tableId)
            ? { ...table, ...data.updates }
            : table
        )
      );

      // Update stats
      setTables(current => {
        updateStats(current);
        return current;
      });
    });

    // Listen for new customer session
    socketService.on('session:started', (data) => {
      console.log('📡 New session started:', data);
      toast.info(`Table ${data.tableNumber} has new customers`);
      fetchTables();
    });

    // Listen for session ended
    socketService.on('session:ended', (data) => {
      console.log('📡 Session ended:', data);
      toast.info(`Table ${data.tableNumber} is now available`);
      fetchTables();
    });

    return () => {
      if (socketConnectedRef.current) {
        socketService.leaveRoom(`waiter:${waiterId}`);
        socketService.off('table:updated');
        socketService.off('session:started');
        socketService.off('session:ended');
        socketConnectedRef.current = false;
      }
    };
  }, [waiterId, fetchTables, updateStats]);

  /**
   * Initial fetch
   */
  useEffect(() => {
    isMountedRef.current = true;
    fetchTables();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchTables]);

  /**
   * Auto-refresh every 60 seconds
   */
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing tables...');
      fetchTables();
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [fetchTables]);

  return {
    // State
    tables,
    loading,
    error,
    stats,

    // Actions
    fetchTables,
    getTableById,
    updateTableStatus,
    getTableSession,
    
    // Alias
    refetch: fetchTables,
  };
};

export default useTables;