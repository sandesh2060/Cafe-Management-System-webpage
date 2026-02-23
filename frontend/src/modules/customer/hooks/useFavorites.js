// ================================================================
// FILE: frontend/src/modules/customer/hooks/useFavorites.js
// CUSTOM HOOK: useFavorites - Manage customer's favorite menu items
// ✅ FIX: Uses customerAPI.toggleFavorite() instead of addFavorite()
//         POST /customers/:id/favorites was 404 — backend only has
//         POST /customers/:id/favorites/toggle
// ✅ Syncs with backend API
// ✅ Local storage fallback
// ✅ Optimistic UI updates
// ================================================================

import { useState, useEffect, useCallback } from 'react';
import { customerAPI } from '../../../api/endpoints';
import { toast } from 'react-toastify';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const getCustomerId = () => {
    try {
      const session = JSON.parse(localStorage.getItem('customerSession') || '{}');
      return session.customerId || null;
    } catch (err) {
      console.error('❌ Error getting customer ID:', err);
      return null;
    }
  };

  // ============================================
  // FETCH FAVORITES
  // ============================================
  const fetchFavorites = useCallback(async () => {
    const customerId = getCustomerId();

    if (!customerId) {
      console.warn('⚠️ No customer ID found, using local favorites');
      loadLocalFavorites();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📡 Fetching favorites for customer:', customerId);
      const response = await customerAPI.getFavorites(customerId);

      const favoritesData = response.favorites || response.data?.favorites || [];

      if (Array.isArray(favoritesData) && favoritesData.length > 0) {
        const favoriteIds = favoritesData.map(fav => {
          if (typeof fav === 'string') return fav;
          return fav._id || fav.id;
        }).filter(Boolean);

        console.log('✅ Favorites loaded:', favoriteIds.length, 'items');
        setFavorites(favoriteIds);
        saveLocalFavorites(favoriteIds);
      } else {
        console.log('ℹ️ No favorites found, loading from local storage');
        loadLocalFavorites();
      }
    } catch (err) {
      console.error('❌ Fetch favorites error:', err);
      setError(err.message);
      loadLocalFavorites();
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // TOGGLE FAVORITE
  // ✅ FIX: Uses /favorites/toggle endpoint (POST) for both add & remove
  //         instead of separate addFavorite (POST /) which was 404
  // ============================================
  const toggleFavorite = useCallback(async (itemId) => {
    const customerId = getCustomerId();

    if (!customerId) {
      toast.error('Please log in to save favorites');
      return { success: false };
    }

    const currentlyFavorite = favorites.includes(itemId);

    // Optimistic update — instant UI feedback
    const updatedFavorites = currentlyFavorite
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId];

    setFavorites(updatedFavorites);
    saveLocalFavorites(updatedFavorites);

    try {
      setSyncing(true);
      setError(null);

      // ✅ FIX: Always use toggleFavorite endpoint
      // Backend: POST /api/customers/:id/favorites/toggle { itemId }
      // This handles both add & remove on the server side
      console.log(currentlyFavorite ? '➖ Removing favorite:' : '➕ Adding favorite:', itemId);
      const response = await customerAPI.toggleFavorite(customerId, itemId);

      if (response.success === false) {
        throw new Error(response.message || 'Failed to update favorites');
      }

      // Sync actual state from backend response if provided
      if (response.favorites) {
        const updatedIds = response.favorites.map(fav =>
          typeof fav === 'string' ? fav : (fav._id || fav.id)
        ).filter(Boolean);
        setFavorites(updatedIds);
        saveLocalFavorites(updatedIds);
      }

      console.log('✅ Favorite toggled successfully');
      toast.success(
        currentlyFavorite ? 'Removed from favorites' : 'Added to favorites',
        { autoClose: 2000 }
      );

      return { success: true, isFavorite: !currentlyFavorite };
    } catch (err) {
      console.error('❌ Toggle favorite error:', err);
      setError(err.message);

      // Revert optimistic update on error
      setFavorites(favorites);
      saveLocalFavorites(favorites);

      toast.error(err.message || 'Failed to update favorites');
      return { success: false, error: err.message };
    } finally {
      setSyncing(false);
    }
  }, [favorites]);

  // ============================================
  // CONVENIENCE METHODS
  // ============================================
  const addFavorite = useCallback(async (itemId) => {
    if (favorites.includes(itemId)) {
      return { success: true, alreadyExists: true };
    }
    return await toggleFavorite(itemId);
  }, [favorites, toggleFavorite]);

  const removeFavorite = useCallback(async (itemId) => {
    if (!favorites.includes(itemId)) {
      return { success: true, alreadyRemoved: true };
    }
    return await toggleFavorite(itemId);
  }, [favorites, toggleFavorite]);

  const isFavorite = useCallback((itemId) => {
    return favorites.includes(itemId);
  }, [favorites]);

  const getFavoriteCount = useCallback(() => {
    return favorites.length;
  }, [favorites]);

  const clearFavorites = useCallback(async () => {
    const customerId = getCustomerId();

    if (!customerId) {
      setFavorites([]);
      localStorage.removeItem('cafe_favorites');
      toast.success('Favorites cleared');
      return { success: true };
    }

    try {
      setSyncing(true);
      console.log('🗑️ Clearing all favorites...');

      // ✅ Use toggleFavorite for each item (since removeFavorite POST was 404)
      const deletePromises = favorites.map(itemId =>
        customerAPI.toggleFavorite(customerId, itemId).catch(err => {
          console.warn(`⚠️ Failed to remove favorite ${itemId}:`, err);
          return null;
        })
      );

      await Promise.all(deletePromises);

      setFavorites([]);
      localStorage.removeItem('cafe_favorites');

      toast.success('All favorites cleared');
      return { success: true };
    } catch (err) {
      console.error('❌ Clear favorites error:', err);
      toast.error('Failed to clear favorites');
      return { success: false, error: err.message };
    } finally {
      setSyncing(false);
    }
  }, [favorites]);

  const syncFavorites = useCallback(async () => {
    console.log('🔄 Syncing favorites with backend...');
    await fetchFavorites();
  }, [fetchFavorites]);

  const refreshFavorites = useCallback(async () => {
    console.log('🔄 Refreshing favorites...');
    await fetchFavorites();
  }, [fetchFavorites]);

  // ============================================
  // LOCAL STORAGE HELPERS
  // ============================================
  const loadLocalFavorites = () => {
    try {
      const saved = localStorage.getItem('cafe_favorites');
      if (saved) {
        const parsed = JSON.parse(saved);
        const validArray = Array.isArray(parsed) ? parsed : [];
        setFavorites(validArray);
        console.log('📂 Loaded', validArray.length, 'favorites from local storage');
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error('❌ Error loading local favorites:', err);
      setFavorites([]);
    }
  };

  const saveLocalFavorites = (favs) => {
    try {
      localStorage.setItem('cafe_favorites', JSON.stringify(favs));
      console.log('💾 Saved', favs.length, 'favorites to local storage');
    } catch (err) {
      console.error('❌ Error saving local favorites:', err);
    }
  };

  // ============================================
  // INIT
  // ============================================
  useEffect(() => {
    console.log('🚀 useFavorites hook initialized');
    fetchFavorites();
  }, [fetchFavorites]);

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    favorites,
    loading,
    syncing,
    error,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
    syncFavorites,
    refreshFavorites,
    isFavorite,
    getFavoriteCount,
    count: favorites.length,
    refetch: fetchFavorites,
  };
};

export default useFavorites;