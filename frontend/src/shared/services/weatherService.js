// File: frontend/src/shared/services/weatherService.js
// Weather Service with Kathmandu, Nepal as default location

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'demo';
const DEFAULT_LOCATION = { lat: 27.7172, lon: 85.3240 }; // ⭐ Kathmandu, Nepal
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Get user's geolocation with robust error handling
 */
export const getUserLocation = () => {
  return new Promise((resolve) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.warn('⚠️ Geolocation not supported, using Kathmandu, Nepal');
      resolve(DEFAULT_LOCATION);
      return;
    }

    // Set a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Geolocation timeout, using Kathmandu, Nepal');
      resolve(DEFAULT_LOCATION);
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        console.log('✅ Location detected:', position.coords.latitude, position.coords.longitude);
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        clearTimeout(timeoutId);
        console.warn('⚠️ Geolocation error:', error.code, error.message);
        
        // Log specific error types
        switch(error.code) {
          case error.PERMISSION_DENIED:
            console.warn('User denied location permission - using Kathmandu, Nepal');
            break;
          case error.POSITION_UNAVAILABLE:
            console.warn('Location information unavailable - using Kathmandu, Nepal');
            break;
          case error.TIMEOUT:
            console.warn('Location request timeout - using Kathmandu, Nepal');
            break;
          default:
            console.warn('Unknown location error - using Kathmandu, Nepal');
        }
        
        // Always fallback to Kathmandu, Nepal
        resolve(DEFAULT_LOCATION);
      },
      {
        timeout: 4000,
        maximumAge: CACHE_DURATION,
        enableHighAccuracy: false,
      }
    );
  });
};

/**
 * Fetch weather data from OpenWeatherMap API
 */
export const fetchWeatherData = async (lat, lon) => {
  // If using demo API key, return fallback immediately
  if (WEATHER_API_KEY === 'demo') {
    console.log('📍 Using demo weather for Kathmandu, Nepal');
    return getFallbackWeather();
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    console.log('🌤️ Fetching weather from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Weather data received:', data);
    
    return {
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main.toLowerCase(),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      city: data.name,
    };
  } catch (error) {
    console.error('❌ Weather fetch error:', error);
    return getFallbackWeather();
  }
};

/**
 * Fallback weather based on time of day and season (Kathmandu climate)
 */
const getFallbackWeather = () => {
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth(); // 0-11
  
  // Kathmandu seasons:
  // Winter: Nov-Feb (cold, dry)
  // Spring: Mar-May (warm, pleasant)
  // Monsoon: Jun-Sep (rainy, humid)
  // Autumn: Oct (cool, clear)
  
  const isWinter = month >= 10 || month <= 1; // Nov-Feb
  const isMonsoon = month >= 5 && month <= 8; // Jun-Sep
  const isSpring = month >= 2 && month <= 4; // Mar-May
  
  // Night time (6 PM - 6 AM)
  if (hour >= 18 || hour < 6) {
    return {
      temp: isWinter ? 8 : (isMonsoon ? 20 : 15),
      condition: 'clear',
      description: 'clear night sky',
      icon: '01n',
      humidity: isWinter ? 60 : 75,
      windSpeed: 2,
      city: 'Kathmandu',
    };
  }
  
  // Morning (6 AM - 12 PM)
  if (hour >= 6 && hour < 12) {
    return {
      temp: isWinter ? 12 : (isMonsoon ? 24 : 20),
      condition: isMonsoon ? 'clouds' : 'clear',
      description: isMonsoon ? 'partly cloudy' : 'clear morning sky',
      icon: isMonsoon ? '02d' : '01d',
      humidity: isMonsoon ? 80 : 65,
      windSpeed: 3,
      city: 'Kathmandu',
    };
  }
  
  // Afternoon/Evening (12 PM - 6 PM)
  return {
    temp: isWinter ? 18 : (isMonsoon ? 28 : 25),
    condition: isMonsoon ? 'rain' : 'clear',
    description: isMonsoon ? 'light rain' : 'sunny',
    icon: isMonsoon ? '10d' : '01d',
    humidity: isMonsoon ? 85 : 55,
    windSpeed: isMonsoon ? 4 : 5,
    city: 'Kathmandu',
  };
};

/**
 * Get weather theme configuration based on weather condition
 */
export const getWeatherTheme = (weatherData) => {
  const { condition, temp, icon } = weatherData;
  const isNight = icon.endsWith('n');

  // Weather-based themes
  const themes = {
    clear: {
      gradient: isNight 
        ? 'from-indigo-900 via-purple-800 to-pink-700'
        : 'from-amber-400 via-orange-400 to-rose-400',
      emoji: isNight ? '🌙' : '☀️',
      message: isNight ? 'Beautiful starry night' : 'Beautiful sunny day',
      particleColor: isNight ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 215, 0, 0.4)',
      glowColor: isNight ? 'rgba(139, 92, 246, 0.3)' : 'rgba(251, 146, 60, 0.3)',
    },
    clouds: {
      gradient: 'from-slate-400 via-gray-400 to-zinc-400',
      emoji: '☁️',
      message: 'Cloudy and cozy',
      particleColor: 'rgba(255, 255, 255, 0.5)',
      glowColor: 'rgba(148, 163, 184, 0.3)',
    },
    rain: {
      gradient: 'from-blue-600 via-cyan-600 to-teal-600',
      emoji: '🌧️',
      message: 'Rainy day vibes',
      particleColor: 'rgba(59, 130, 246, 0.4)',
      glowColor: 'rgba(6, 182, 212, 0.3)',
    },
    drizzle: {
      gradient: 'from-sky-500 via-blue-400 to-cyan-400',
      emoji: '🌦️',
      message: 'Light drizzle outside',
      particleColor: 'rgba(56, 189, 248, 0.4)',
      glowColor: 'rgba(14, 165, 233, 0.3)',
    },
    thunderstorm: {
      gradient: 'from-purple-700 via-indigo-700 to-blue-800',
      emoji: '⛈️',
      message: 'Thunderstorm alert!',
      particleColor: 'rgba(167, 139, 250, 0.5)',
      glowColor: 'rgba(99, 102, 241, 0.4)',
    },
    snow: {
      gradient: 'from-cyan-200 via-blue-200 to-indigo-200',
      emoji: '❄️',
      message: 'Snowy wonderland',
      particleColor: 'rgba(255, 255, 255, 0.7)',
      glowColor: 'rgba(224, 242, 254, 0.5)',
    },
    mist: {
      gradient: 'from-gray-300 via-slate-300 to-zinc-300',
      emoji: '🌫️',
      message: 'Misty and mysterious',
      particleColor: 'rgba(203, 213, 225, 0.6)',
      glowColor: 'rgba(148, 163, 184, 0.3)',
    },
    haze: {
      gradient: 'from-orange-300 via-amber-300 to-yellow-300',
      emoji: '🌅',
      message: 'Hazy atmosphere',
      particleColor: 'rgba(251, 191, 36, 0.4)',
      glowColor: 'rgba(245, 158, 11, 0.3)',
    },
  };

  // Temperature-based adjustments
  let theme = themes[condition] || themes.clear;
  
  if (temp > 35) {
    theme = {
      gradient: 'from-red-500 via-orange-500 to-yellow-400',
      emoji: '🔥',
      message: 'Hot day! Stay hydrated',
      particleColor: 'rgba(239, 68, 68, 0.4)',
      glowColor: 'rgba(249, 115, 22, 0.4)',
    };
  } else if (temp < 10) {
    theme = {
      gradient: 'from-blue-400 via-cyan-300 to-sky-200',
      emoji: '🥶',
      message: 'Chilly weather ahead',
      particleColor: 'rgba(96, 165, 250, 0.5)',
      glowColor: 'rgba(14, 165, 233, 0.3)',
    };
  }

  return {
    ...theme,
    temp,
    condition,
    city: weatherData.city,
  };
};

/**
 * Main function to get weather-based theme
 */
export const getWeatherBasedTheme = async () => {
  try {
    console.log('🌍 Getting weather-based theme...');
    
    // Get user location (will fallback to Kathmandu if fails)
    const location = await getUserLocation();
    console.log('📍 Using location:', location);
    
    // Fetch weather data
    const weatherData = await fetchWeatherData(location.lat, location.lon);
    console.log('🌤️ Weather data:', weatherData);
    
    // Get theme configuration
    const theme = getWeatherTheme(weatherData);
    console.log('🎨 Theme generated:', theme);
    
    // Cache the result
    const cacheData = {
      ...theme,
      timestamp: Date.now(),
    };
    
    try {
      localStorage.setItem('weatherTheme', JSON.stringify(cacheData));
      console.log('💾 Theme cached successfully');
    } catch (err) {
      console.warn('⚠️ Failed to cache theme:', err);
    }
    
    return theme;
  } catch (error) {
    console.error('❌ Error getting weather theme:', error);
    
    // Try to use cached theme if available
    const cached = getCachedWeatherTheme();
    if (cached) {
      console.log('📦 Using cached theme');
      return cached;
    }
    
    // Final fallback to Kathmandu weather
    console.log('🔄 Using fallback theme for Kathmandu');
    return getWeatherTheme(getFallbackWeather());
  }
};

/**
 * Get cached weather theme (for immediate display)
 */
export const getCachedWeatherTheme = () => {
  try {
    const cached = localStorage.getItem('weatherTheme');
    if (!cached) {
      return null;
    }
    
    const data = JSON.parse(cached);
    
    // Use cache if less than 30 minutes old
    if (Date.now() - data.timestamp < CACHE_DURATION) {
      console.log('✅ Using valid cached theme');
      return data;
    }
    
    console.log('⏰ Cache expired');
    return null;
  } catch (error) {
    console.error('❌ Error reading cached theme:', error);
    return null;
  }
};

/**
 * Clear weather theme cache
 */
export const clearWeatherCache = () => {
  try {
    localStorage.removeItem('weatherTheme');
    console.log('🗑️ Weather cache cleared');
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
  }
};