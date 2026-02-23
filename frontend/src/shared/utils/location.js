// File: frontend/src/shared/utils/location.js
// Production-level geolocation utilities

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Get current position with enhanced options
 * @param {Object} options - Geolocation options
 * @returns {Promise<GeolocationPosition>}
 */
export const getCurrentPosition = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options,
    };

    navigator.geolocation.getCurrentPosition(resolve, reject, defaultOptions);
  });
};

/**
 * Watch position with callback
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 * @param {Object} options - Geolocation options
 * @returns {number} Watch ID for clearing
 */
export const watchPosition = (onSuccess, onError, options = {}) => {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation is not supported'));
    return null;
  }

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    ...options,
  };

  return navigator.geolocation.watchPosition(onSuccess, onError, defaultOptions);
};

/**
 * Clear position watch
 * @param {number} watchId - Watch ID to clear
 */
export const clearWatch = (watchId) => {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Check if coordinates are within acceptable range (restaurant area)
 * @param {number} lat - User latitude
 * @param {number} lon - User longitude
 * @param {number} centerLat - Restaurant center latitude
 * @param {number} centerLon - Restaurant center longitude
 * @param {number} radius - Acceptable radius in meters (default 100m)
 * @returns {boolean}
 */
export const isWithinRestaurant = (lat, lon, centerLat, centerLon, radius = 100) => {
  const distance = calculateDistance(lat, lon, centerLat, centerLon);
  return distance <= radius;
};

/**
 * Format coordinates for display
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {string} Formatted coordinates
 */
export const formatCoordinates = (lat, lon) => {
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
};

/**
 * Get geolocation error message
 * @param {GeolocationPositionError} error
 * @returns {string} User-friendly error message
 */
export const getGeolocationErrorMessage = (error) => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location access denied. Please enable location permissions in your browser settings.';
    case error.POSITION_UNAVAILABLE:
      return 'Location information is unavailable. Please check your device settings.';
    case error.TIMEOUT:
      return 'Location request timed out. Please try again.';
    default:
      return 'An unknown error occurred while getting your location.';
  }
};

/**
 * Request location permission and get position
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
 */
export const requestLocationAccess = async () => {
  try {
    const position = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };
  } catch (error) {
    throw new Error(getGeolocationErrorMessage(error));
  }
};

/**
 * Check if location services are available
 * @returns {boolean}
 */
export const isGeolocationAvailable = () => {
  return 'geolocation' in navigator;
};

/**
 * Get location permission status (if supported)
 * @returns {Promise<string>} 'granted', 'denied', or 'prompt'
 */
export const getLocationPermissionStatus = async () => {
  if (!navigator.permissions) {
    return 'unknown';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch (error) {
    return 'unknown';
  }
};

export default {
  calculateDistance,
  getCurrentPosition,
  watchPosition,
  clearWatch,
  isWithinRestaurant,
  formatCoordinates,
  getGeolocationErrorMessage,
  requestLocationAccess,
  isGeolocationAvailable,
  getLocationPermissionStatus,
};