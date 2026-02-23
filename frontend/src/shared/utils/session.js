// File: frontend/src/shared/utils/session.js
// 🔐 Session Management Utilities

/**
 * Get customer ID from localStorage session
 * @returns {string|null} Customer ID or null if not found
 */
export const getCustomerId = () => {
  try {
    const sessionData = localStorage.getItem('customerSession');
    if (!sessionData) {
      console.log('⚠️ No customerSession found in localStorage');
      return null;
    }

    const session = JSON.parse(sessionData);
    const customerId = session?.customerId;

    if (!customerId) {
      console.log('⚠️ No customerId in session:', session);
      return null;
    }

    return customerId;
  } catch (error) {
    console.error('❌ Error reading customerSession:', error);
    return null;
  }
};

/**
 * Get full customer session from localStorage
 * @returns {object|null} Session object or null if not found
 */
export const getCustomerSession = () => {
  try {
    const sessionData = localStorage.getItem('customerSession');
    if (!sessionData) {
      return null;
    }

    return JSON.parse(sessionData);
  } catch (error) {
    console.error('❌ Error reading customerSession:', error);
    return null;
  }
};

/**
 * Save customer session to localStorage
 * @param {object} sessionData - Session data to save
 */
export const saveCustomerSession = (sessionData) => {
  try {
    localStorage.setItem('customerSession', JSON.stringify(sessionData));
    console.log('✅ Session saved:', sessionData);
  } catch (error) {
    console.error('❌ Error saving session:', error);
  }
};

/**
 * Clear customer session from localStorage
 */
export const clearCustomerSession = () => {
  try {
    localStorage.removeItem('customerSession');
    console.log('✅ Session cleared');
  } catch (error) {
    console.error('❌ Error clearing session:', error);
  }
};

/**
 * Check if customer is logged in
 * @returns {boolean} True if customer has active session
 */
export const isCustomerLoggedIn = () => {
  const customerId = getCustomerId();
  return !!customerId;
};