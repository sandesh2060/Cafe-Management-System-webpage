// File: frontend/src/modules/customer/hooks/useLoyalty.js
// 🎁 LOYALTY HOOK - Production Ready
// ✅ FIXED: Compatible with axios interceptor (returns response.data)

import { useState, useCallback, useEffect } from 'react';
import { loyaltyAPI } from '../../../api/endpoints';
import { toast } from 'react-toastify';

export const useLoyalty = () => {
  const [loyaltyData, setLoyaltyData] = useState({
    visits: 0,
    totalVisits: 0,
    loyaltyPoints: 0,
    availableRewards: [],
    rewardHistory: [],
    currentProgress: 0,
    nextRewardAt: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const maxVisits = 10;

  // Get customer ID from session
  const getCustomerId = useCallback(() => {
    try {
      const session = localStorage.getItem('customerSession');
      if (session) {
        const parsed = JSON.parse(session);
        return parsed.customerId;
      }
    } catch (err) {
      console.error('❌ Error getting customer ID:', err);
    }
    return null;
  }, []);

  /**
   * Fetch loyalty data for current customer
   * ✅ FIXED: Handles new axios response structure correctly
   */
  const fetchLoyaltyData = useCallback(async () => {
    const customerId = getCustomerId();
    
    if (!customerId) {
      console.warn('⚠️ No customer ID found in session');
      setLoyaltyData({
        visits: 0,
        totalVisits: 0,
        loyaltyPoints: 0,
        availableRewards: [],
        rewardHistory: [],
        currentProgress: 0,
        nextRewardAt: maxVisits,
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 Fetching loyalty data for customer:', customerId);
      const response = await loyaltyAPI.getCustomerLoyalty(customerId);
      console.log('📦 Loyalty API response:', response);
      
      // ✅ CRITICAL FIX: After axios interceptor change
      // Backend sends: { success: true, loyalty: { currentVisits: 5, ... } }
      // Axios returns: { success: true, loyalty: { currentVisits: 5, ... } } (no nesting)
      const data = response?.loyalty || response?.data?.loyalty;
      
      if (!data) {
        console.warn('⚠️ No loyalty data in response:', response);
        throw new Error('No loyalty data found');
      }
      
      console.log('✅ Setting loyalty data:', {
        visits: data.currentVisits,
        totalVisits: data.totalVisits,
        points: data.loyaltyPoints,
        rewards: data.availableRewards?.length || 0,
      });

      setLoyaltyData({
        visits: data.currentVisits ?? 0,
        totalVisits: data.totalVisits ?? 0,
        loyaltyPoints: data.loyaltyPoints ?? 0,
        availableRewards: data.availableRewards || [],
        rewardHistory: data.rewardHistory || [],
        currentProgress: ((data.currentVisits ?? 0) / maxVisits) * 100,
        nextRewardAt: data.nextRewardAt ?? maxVisits,
      });
    } catch (err) {
      console.error('❌ Fetch loyalty error:', err);
      setError(err.message || 'Failed to fetch loyalty data');
      
      // Set empty state on error
      setLoyaltyData({
        visits: 0,
        totalVisits: 0,
        loyaltyPoints: 0,
        availableRewards: [],
        rewardHistory: [],
        currentProgress: 0,
        nextRewardAt: maxVisits,
      });
    } finally {
      setLoading(false);
    }
  }, [getCustomerId]);

  /**
   * Add a visit (called when order is completed)
   * ✅ FIXED: Access response data directly at top level
   */
  const addVisit = useCallback(async () => {
    const customerId = getCustomerId();
    
    if (!customerId) {
      console.warn('⚠️ No customer ID found');
      return { success: false, error: 'No active session' };
    }

    try {
      console.log('➕ Adding visit for customer:', customerId);
      const response = await loyaltyAPI.addVisit(customerId);
      console.log('📦 Add visit response:', response);

      // ✅ CRITICAL FIX: Response data is at top level after axios change
      // Backend sends: { success: true, currentVisits: 5, totalVisits: 15, rewardEarned: false }
      // Axios returns: { success: true, currentVisits: 5, totalVisits: 15, rewardEarned: false }
      if (response.success) {
        const newVisits = response.currentVisits ?? 0;
        const rewardEarned = response.rewardEarned || false;
        const totalVisits = response.totalVisits ?? 0;
        const loyaltyPoints = response.loyaltyPoints ?? 0;
        
        console.log('✅ Visit added:', {
          newVisits,
          totalVisits,
          rewardEarned,
        });
        
        // Update local state
        setLoyaltyData(prev => ({
          ...prev,
          visits: newVisits,
          totalVisits: totalVisits,
          loyaltyPoints: loyaltyPoints,
          currentProgress: (newVisits / maxVisits) * 100,
          nextRewardAt: response.nextRewardAt ?? (maxVisits - newVisits),
        }));

        // Show reward notification
        if (rewardEarned) {
          toast.success('🎉 Congratulations! You earned a free item!', {
            autoClose: 5000,
            position: 'top-center',
          });
          
          // Refresh loyalty data to get the new reward details
          setTimeout(() => fetchLoyaltyData(), 500);
        } else {
          const remaining = maxVisits - newVisits;
          const message = remaining === 1 
            ? 'Just 1 more visit to your next reward! 🎯'
            : `${remaining} more visits to your next reward! 🎯`;
          
          toast.info(message, {
            autoClose: 3000,
          });
        }

        return { 
          success: true, 
          visits: newVisits,
          rewardEarned,
        };
      }
      
      throw new Error(response.message || 'Failed to add visit');
    } catch (err) {
      console.error('❌ Add visit error:', err);
      toast.error('Failed to add visit', { autoClose: 2000 });
      return { success: false, error: err.message };
    }
  }, [getCustomerId, fetchLoyaltyData]);

  /**
   * Claim a reward
   * ✅ FIXED: Access reward directly from response
   */
  const claimReward = useCallback(async (rewardItemId) => {
    const customerId = getCustomerId();
    
    if (!customerId) {
      toast.error('No active session found');
      return { success: false, error: 'No active session' };
    }

    if (loyaltyData.availableRewards.length === 0) {
      toast.error('No rewards available to claim');
      return { success: false, error: 'No rewards available' };
    }

    setLoading(true);
    
    try {
      console.log('🎁 Claiming reward:', rewardItemId);
      const response = await loyaltyAPI.claimReward(customerId, rewardItemId);
      console.log('📦 Claim reward response:', response);

      // ✅ CRITICAL FIX: Response data is at top level
      // Backend sends: { success: true, reward: { ... }, message: "Reward claimed" }
      // Axios returns: { success: true, reward: { ... }, message: "Reward claimed" }
      if (response.success && response.reward) {
        toast.success('✨ Reward claimed successfully!', {
          autoClose: 3000,
        });
        
        console.log('✅ Reward claimed:', response.reward);
        
        // Refresh loyalty data to update available rewards
        await fetchLoyaltyData();

        return { success: true, reward: response.reward };
      }
      
      throw new Error(response.message || 'Failed to claim reward');
    } catch (err) {
      console.error('❌ Claim reward error:', err);
      toast.error(err.message || 'Failed to claim reward');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [getCustomerId, loyaltyData.availableRewards, fetchLoyaltyData]);

  /**
   * Get available free items
   * ✅ FIXED: Access items directly from response
   */
  const getAvailableFreeItems = useCallback(async () => {
    try {
      console.log('🔍 Fetching available free items...');
      const response = await loyaltyAPI.getFreeItems();
      console.log('📦 Free items response:', response);

      // ✅ CRITICAL FIX: Items are at top level after axios change
      // Backend sends: { success: true, items: [...] }
      // Axios returns: { success: true, items: [...] }
      if (response.success && response.items) {
        console.log('✅ Found', response.items.length, 'free items');
        return response.items;
      }
      
      console.warn('⚠️ No free items found in response');
      return [];
    } catch (err) {
      console.error('❌ Get free items error:', err);
      return [];
    }
  }, []);

  /**
   * Check if customer can claim reward
   */
  const canClaimReward = useCallback(() => {
    const canClaim = loyaltyData.availableRewards.length > 0;
    console.log('🎁 Can claim reward:', canClaim);
    return canClaim;
  }, [loyaltyData.availableRewards]);

  /**
   * Get visits remaining for next reward
   */
  const getVisitsRemaining = useCallback(() => {
    const remaining = loyaltyData.nextRewardAt ?? Math.max(0, maxVisits - loyaltyData.visits);
    return remaining;
  }, [loyaltyData.visits, loyaltyData.nextRewardAt]);

  /**
   * Get progress percentage
   */
  const getProgressPercentage = useCallback(() => {
    const percentage = (loyaltyData.visits / maxVisits) * 100;
    return Math.min(100, Math.max(0, percentage));
  }, [loyaltyData.visits]);

  /**
   * Get reward status message
   */
  const getRewardStatusMessage = useCallback(() => {
    const remaining = getVisitsRemaining();
    
    if (loyaltyData.availableRewards.length > 0) {
      const count = loyaltyData.availableRewards.length;
      return `You have ${count} reward${count !== 1 ? 's' : ''} to claim! 🎉`;
    }
    
    if (remaining === 0) {
      return 'One more visit to earn a reward! 🎯';
    }
    
    if (remaining === 1) {
      return 'Just 1 more visit to your next reward! 🎯';
    }
    
    return `${remaining} more visits to your next reward! 🎯`;
  }, [loyaltyData.availableRewards, getVisitsRemaining]);

  // ============================================
  // INITIALIZATION
  // ============================================

  useEffect(() => {
    console.log('🚀 useLoyalty hook initialized');
    fetchLoyaltyData();
  }, [fetchLoyaltyData]);

  // ============================================
  // RETURN PUBLIC API
  // ============================================

  return {
    // State
    loyaltyData,
    loading,
    error,
    maxVisits,

    // Actions
    fetchLoyaltyData,
    addVisit,
    claimReward,
    getAvailableFreeItems,

    // Computed
    canClaimReward,
    getVisitsRemaining,
    getProgressPercentage,
    getRewardStatusMessage,

    // Aliases for compatibility
    refetch: fetchLoyaltyData,
  };
};

export default useLoyalty;