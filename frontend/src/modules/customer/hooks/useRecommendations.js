// File: frontend/src/modules/customer/hooks/useRecommendations.js
// 🚀 ENHANCED RECOMMENDATIONS HOOK - FIXED
// ✅ Weather-based recommendations
// ✅ Super-personalized AI recommendations
// ✅ User favorites integration

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../../../api/axios';

export const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState({
    superPersonalized: [],
    personalized: [],
    trending: [],
    timeBased: [],
    weatherBased: [],
    loading: true,
    error: null
  });
  
  const [weatherData, setWeatherData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  
  // ✅ FIX: Use ref to prevent infinite loops
  const isInitialized = useRef(false);

  /**
   * Get user's location
   */
  const getUserLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.warn('⚠️ Geolocation not supported');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          console.log('📍 User location:', location);
          setUserLocation(location);
          resolve(location);
        },
        (error) => {
          console.warn('⚠️ Location access denied:', error);
          resolve(null);
        }
      );
    });
  }, []);

  /**
   * Get customer ID from session
   */
  const getCustomerId = useCallback(() => {
    try {
      const sessionStr = localStorage.getItem('customerSession');
      if (!sessionStr) return null;
      
      const session = JSON.parse(sessionStr);
      return session.customerId || null;
    } catch (error) {
      console.error('❌ Error getting customer ID:', error);
      return null;
    }
  }, []);

  /**
   * 🎯 Fetch super-personalized recommendations
   * Combines everything: history, favorites, weather, time
   */
  const fetchSuperPersonalizedRecommendations = useCallback(async (location) => {
    const customerId = getCustomerId();
    if (!customerId) {
      console.log('⚠️ No customer ID - skipping personalized recommendations');
      return;
    }

    try {
      console.log('🎯 Fetching super-personalized recommendations...');

      // Build query params
      const params = { limit: 10 };
      if (location) {
        params.lat = location.lat;
        params.lon = location.lon;
      }

      const response = await axios.get(
        `/recommendations/super-personalized/${customerId}`,
        { params }
      );

      console.log('✅ Super-personalized recommendations received:', response.recommendations?.length);

      setRecommendations(prev => ({
        ...prev,
        superPersonalized: response.recommendations || [],
        personalized: response.recommendations || [], // For backward compatibility
        loading: false
      }));
    } catch (error) {
      console.error('❌ Failed to fetch super-personalized recommendations:', error);
      setRecommendations(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load recommendations'
      }));
    }
  }, [getCustomerId]);

  /**
   * 🌤️ Fetch weather-based recommendations
   */
  const fetchWeatherBasedRecommendations = useCallback(async (location) => {
    if (!location) {
      console.log('⚠️ No location available for weather recommendations');
      return;
    }

    try {
      console.log('🌤️ Fetching weather-based recommendations...');

      const response = await axios.get('/recommendations/weather-based', {
        params: {
          lat: location.lat,
          lon: location.lon,
          limit: 5
        }
      });

      console.log('✅ Weather-based recommendations received:', response.recommendations?.length);

      // Extract weather data if available
      if (response.recommendations && response.recommendations.length > 0) {
        const weather = response.recommendations[0].weather;
        if (weather) {
          setWeatherData(weather);
        }
      }

      setRecommendations(prev => ({
        ...prev,
        weatherBased: response.recommendations || []
      }));
    } catch (error) {
      console.error('❌ Failed to fetch weather-based recommendations:', error);
    }
  }, []);

  /**
   * Fetch trending items
   */
  const fetchTrendingItems = useCallback(async () => {
    try {
      console.log('🔥 Fetching trending items...');
      
      const response = await axios.get('/recommendations/trending', {
        params: { limit: 10, timeframe: '7d' }
      });

      console.log('✅ Trending items received:', response.trending?.length);

      setRecommendations(prev => ({
        ...prev,
        trending: response.trending || []
      }));
    } catch (error) {
      console.error('❌ Failed to fetch trending items:', error);
    }
  }, []);

  /**
   * Fetch time-based recommendations
   */
  const fetchTimeBasedRecommendations = useCallback(async () => {
    try {
      console.log('⏰ Fetching time-based recommendations...');
      
      const response = await axios.get('/recommendations/time-based', {
        params: { limit: 10 }
      });

      console.log('✅ Time-based recommendations received:', response.recommendations?.length);

      setRecommendations(prev => ({
        ...prev,
        timeBased: response.recommendations || []
      }));
    } catch (error) {
      console.error('❌ Failed to fetch time-based recommendations:', error);
    }
  }, []);

  /**
   * Get complementary items based on cart
   */
  const getComplementaryItems = useCallback(async (cartItems) => {
    if (!cartItems || cartItems.length === 0) return [];

    try {
      console.log('🛒 Fetching complementary items for cart...');
      
      const response = await axios.post('/recommendations/complementary', {
        cartItems
      }, {
        params: { limit: 5 }
      });

      console.log('✅ Complementary items received:', response.complementary?.length);

      return response.complementary || [];
    } catch (error) {
      console.error('❌ Failed to fetch complementary items:', error);
      return [];
    }
  }, []);

  /**
   * Track item view
   */
  const trackView = useCallback(async (menuItemId) => {
    try {
      await axios.post('/recommendations/track-view', {
        menuItemId
      });
    } catch (error) {
      console.error('❌ Failed to track item view:', error);
    }
  }, []);

  /**
   * Refresh all recommendations
   */
  const refreshRecommendations = useCallback(async () => {
    console.log('🔄 Refreshing all recommendations...');
    
    setRecommendations(prev => ({ ...prev, loading: true }));
    
    // Get fresh location
    const location = await getUserLocation();
    
    // Fetch all recommendation types
    await Promise.all([
      fetchSuperPersonalizedRecommendations(location),
      fetchWeatherBasedRecommendations(location),
      fetchTrendingItems(),
      fetchTimeBasedRecommendations()
    ]);
  }, [
    getUserLocation,
    fetchSuperPersonalizedRecommendations,
    fetchWeatherBasedRecommendations,
    fetchTrendingItems,
    fetchTimeBasedRecommendations
  ]);

  /**
   * ✅ FIX: Initial load - runs only once
   */
  useEffect(() => {
    if (isInitialized.current) return;
    
    console.log('🚀 Initializing recommendations...');
    isInitialized.current = true;
    
    // Get location first, then fetch recommendations
    getUserLocation().then((location) => {
      // Fetch all in parallel
      Promise.all([
        fetchSuperPersonalizedRecommendations(location),
        fetchWeatherBasedRecommendations(location),
        fetchTrendingItems(),
        fetchTimeBasedRecommendations()
      ]);
    });
  }, []); // ✅ Empty dependency array - runs once on mount

  return {
    recommendations,
    weatherData,
    userLocation,
    refreshRecommendations,
    getComplementaryItems,
    trackView,
    loading: recommendations.loading,
    error: recommendations.error
  };
};

export default useRecommendations;