// File: frontend/src/modules/manager/hooks/useInventory.js
// ✅ FIXED: Handle backend response structure correctly

import { useState, useCallback } from 'react';
import { managerAPI } from '@/api/managerEndpoints';

export const useInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await managerAPI.getInventory();
      
      // Backend returns: { success: true, data: { inventory: [...], stats: {...} }, message: '...' }
      const data = response.data?.data || response.data;
      
      setInventory(data.inventory || []);
      setStats(data.stats || {});
      
      console.log('📦 Inventory loaded:', { 
        items: data.inventory?.length || 0, 
        stats: data.stats 
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch inventory';
      setError(errorMsg);
      console.error('Inventory error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    inventory, 
    stats, 
    loading, 
    error, 
    fetchInventory 
  };
};