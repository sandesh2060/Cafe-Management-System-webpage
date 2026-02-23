// File: frontend/src/shared/hooks/useToast.js
// Simple wrapper for react-toastify to provide consistent toast API

import { toast as reactToastify } from 'react-toastify';

/**
 * Custom hook for toast notifications
 * Wraps react-toastify for consistent API
 */
export const useToast = () => {
  const showToast = (message, type = 'info', options = {}) => {
    const defaultOptions = {
      position: 'bottom-center',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    };

    switch (type) {
      case 'success':
        return reactToastify.success(message, defaultOptions);
      case 'error':
        return reactToastify.error(message, defaultOptions);
      case 'warning':
        return reactToastify.warning(message, defaultOptions);
      case 'info':
        return reactToastify.info(message, defaultOptions);
      default:
        return reactToastify(message, defaultOptions);
    }
  };

  return {
    showToast,
    success: (message, options) => showToast(message, 'success', options),
    error: (message, options) => showToast(message, 'error', options),
    warning: (message, options) => showToast(message, 'warning', options),
    info: (message, options) => showToast(message, 'info', options),
  };
};

export default useToast;