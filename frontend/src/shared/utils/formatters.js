// File: frontend/src/shared/utils/formatters.js
// 🎨 UTILITY FORMATTERS - Time, Currency, Dates, Numbers
// ✅ Consistent formatting across the app

/**
 * Format currency (USD by default)
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined) return '$0.00';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error('Currency format error:', error);
    return `$${Number(amount).toFixed(2)}`;
  }
};

/**
 * Format number with commas
 */
export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return '0';
  
  try {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  } catch (error) {
    console.error('Number format error:', error);
    return String(num);
  }
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  
  try {
    return `${Number(value).toFixed(decimals)}%`;
  } catch (error) {
    console.error('Percentage format error:', error);
    return '0%';
  }
};

/**
 * Format date (full)
 */
export const formatDate = (date, locale = 'en-US') => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Date format error:', error);
    return String(date);
  }
};

/**
 * Format date (short)
 */
export const formatDateShort = (date, locale = 'en-US') => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (error) {
    console.error('Date format error:', error);
    return String(date);
  }
};

/**
 * Format time (12-hour)
 */
export const formatTime = (date, locale = 'en-US') => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('Time format error:', error);
    return String(date);
  }
};

/**
 * Format date and time
 */
export const formatDateTime = (date, locale = 'en-US') => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('DateTime format error:', error);
    return String(date);
  }
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 10) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffWeek < 4) return `${diffWeek}w ago`;
    if (diffMonth < 12) return `${diffMonth}mo ago`;
    return `${diffYear}y ago`;
  } catch (error) {
    console.error('Relative time error:', error);
    return '';
  }
};

/**
 * Format duration (e.g., "2h 30m")
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 1) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

/**
 * Format phone number (US format)
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalize each word
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Format order number with padding
 */
export const formatOrderNumber = (num) => {
  if (!num) return '#0000';
  return `#${String(num).padStart(4, '0')}`;
};

/**
 * Format table number
 */
export const formatTableNumber = (num) => {
  if (!num) return 'T00';
  return `T${String(num).padStart(2, '0')}`;
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  const colors = {
    // Order status
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
    served: 'bg-gray-100 text-gray-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
    
    // Table status
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-orange-100 text-orange-800',
    reserved: 'bg-blue-100 text-blue-800',
    cleaning: 'bg-purple-100 text-purple-800',
    maintenance: 'bg-red-100 text-red-800',
    
    // Payment status
    unpaid: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    refunded: 'bg-red-100 text-red-800',
    partial: 'bg-orange-100 text-orange-800',
  };
  
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

/**
 * Get priority badge color
 */
export const getPriorityColor = (priority) => {
  const colors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };
  
  return colors[priority?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

/**
 * Parse ISO duration (e.g., "PT15M") to minutes
 */
export const parseISODuration = (isoDuration) => {
  if (!isoDuration) return 0;
  
  try {
    const match = isoDuration.match(/PT(\d+)M/);
    return match ? parseInt(match[1], 10) : 0;
  } catch (error) {
    console.error('Parse ISO duration error:', error);
    return 0;
  }
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format distance (meters to human readable)
 */
export const formatDistance = (meters) => {
  if (!meters || meters === 0) return '0m';
  
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  
  return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Format items count (e.g., "5 items")
 */
export const formatItemsCount = (count) => {
  if (!count || count === 0) return '0 items';
  if (count === 1) return '1 item';
  return `${count} items`;
};

/**
 * Format rating (e.g., "4.5 ★")
 */
export const formatRating = (rating, maxRating = 5) => {
  if (!rating) return '0 ★';
  return `${Number(rating).toFixed(1)} ★`;
};

/**
 * Generate avatar color from name
 */
export const getAvatarColor = (name) => {
  if (!name) return 'bg-gray-500';
  
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];
  
  const charCode = name.charCodeAt(0);
  const index = charCode % colors.length;
  
  return colors[index];
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate phone number (basic)
 */
export const isValidPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Sleep/delay utility
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Debounce function
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Export all formatters
export default {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateShort,
  formatTime,
  formatDateTime,
  getRelativeTime,
  formatDuration,
  formatPhoneNumber,
  truncateText,
  capitalize,
  capitalizeWords,
  formatOrderNumber,
  formatTableNumber,
  getStatusColor,
  getPriorityColor,
  parseISODuration,
  formatFileSize,
  formatDistance,
  getInitials,
  formatItemsCount,
  formatRating,
  getAvatarColor,
  isValidEmail,
  isValidPhone,
  sleep,
  debounce,
  throttle,
};