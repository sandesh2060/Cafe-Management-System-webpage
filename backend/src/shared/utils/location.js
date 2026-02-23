// File: backend/src/shared/utils/location.js
// Production-level geolocation utilities for backend

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
 * Validate coordinates
 * @param {number} latitude
 * @param {number} longitude
 * @returns {boolean}
 */
const isValidCoordinates = (latitude, longitude) => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

/**
 * Create GeoJSON Point
 * @param {number} longitude
 * @param {number} latitude
 * @returns {Object} GeoJSON Point object
 */
const createGeoJSONPoint = (longitude, latitude) => {
  if (!isValidCoordinates(latitude, longitude)) {
    throw new Error('Invalid coordinates');
  }

  return {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
};

/**
 * Find nearest location from array of locations
 * @param {number} userLat - User latitude
 * @param {number} userLon - User longitude
 * @param {Array} locations - Array of locations with lat/lon
 * @returns {Object} Nearest location with distance
 */
const findNearest = (userLat, userLon, locations) => {
  if (!Array.isArray(locations) || locations.length === 0) {
    return null;
  }

  let nearest = null;
  let minDistance = Infinity;

  locations.forEach((location) => {
    const distance = calculateDistance(
      userLat,
      userLon,
      location.latitude || location.lat,
      location.longitude || location.lon || location.lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = {
        ...location,
        distance,
      };
    }
  });

  return nearest;
};

/**
 * Check if point is within radius of center
 * @param {number} pointLat
 * @param {number} pointLon
 * @param {number} centerLat
 * @param {number} centerLon
 * @param {number} radiusMeters
 * @returns {boolean}
 */
const isWithinRadius = (pointLat, pointLon, centerLat, centerLon, radiusMeters) => {
  const distance = calculateDistance(pointLat, pointLon, centerLat, centerLon);
  return distance <= radiusMeters;
};

/**
 * Build MongoDB geospatial query for nearby search
 * @param {number} longitude
 * @param {number} latitude
 * @param {number} maxDistanceMeters
 * @returns {Object} MongoDB query object
 */
const buildNearQuery = (longitude, latitude, maxDistanceMeters = 50) => {
  return {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistanceMeters,
      },
    },
  };
};

/**
 * Build MongoDB geospatial query for within polygon
 * @param {Array} polygon - Array of [longitude, latitude] pairs
 * @returns {Object} MongoDB query object
 */
const buildWithinPolygonQuery = (polygon) => {
  return {
    location: {
      $geoWithin: {
        $geometry: {
          type: 'Polygon',
          coordinates: [polygon],
        },
      },
    },
  };
};

/**
 * Format distance for display
 * @param {number} meters
 * @returns {string}
 */
const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * Get bearing between two points
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Bearing in degrees (0-360)
 */
const getBearing = (lat1, lon1, lat2, lon2) => {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  const bearing = ((θ * 180) / Math.PI + 360) % 360;

  return bearing;
};

/**
 * Get compass direction from bearing
 * @param {number} bearing - Bearing in degrees
 * @returns {string} Compass direction (N, NE, E, SE, S, SW, W, NW)
 */
const getCompassDirection = (bearing) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
};

module.exports = {
  calculateDistance,
  isValidCoordinates,
  createGeoJSONPoint,
  findNearest,
  isWithinRadius,
  buildNearQuery,
  buildWithinPolygonQuery,
  formatDistance,
  getBearing,
  getCompassDirection,
};