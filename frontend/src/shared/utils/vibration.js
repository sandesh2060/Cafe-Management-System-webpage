// File: frontend/src/shared/utils/vibration.js
// 📳 VIBRATION UTILITY - Cross-browser haptic feedback

class VibrationManager {
  constructor() {
    // Check if vibration is supported
    this.isSupported = 'vibrate' in navigator;
    
    // Load settings from localStorage
    this.enabled = this.loadSetting('vibrationEnabled', true);
    
    // Vibration patterns
    this.patterns = {
      // Success feedback
      success: [100, 50, 100, 50, 200],
      
      // Error feedback
      error: [50, 50, 50, 50, 50],
      
      // Button tap
      tap: [10],
      
      // Long press
      longPress: [50],
      
      // Notification
      notification: [200, 100, 200],
      
      // Warning
      warning: [100, 100, 100],
      
      // Heavy impact
      heavy: [300],
      
      // Light impact
      light: [20],
      
      // Order placed (special celebration pattern)
      orderPlaced: [100, 50, 100, 50, 100, 100, 200, 50, 200],
    };
  }

  /**
   * Load setting from localStorage
   */
  loadSetting(key, defaultValue) {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error(`Error loading setting ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Save setting to localStorage
   */
  saveSetting(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving setting ${key}:`, error);
    }
  }

  /**
   * Vibrate with a specific pattern
   * @param {string|number|array} pattern - Pattern name, duration, or array
   */
  vibrate(pattern = 'tap') {
    if (!this.isSupported || !this.enabled) {
      return false;
    }

    try {
      // If pattern is a string, look up the predefined pattern
      if (typeof pattern === 'string') {
        pattern = this.patterns[pattern] || this.patterns.tap;
      }
      
      // If pattern is a number, use it as duration
      if (typeof pattern === 'number') {
        pattern = [pattern];
      }

      // Vibrate
      navigator.vibrate(pattern);
      return true;
    } catch (error) {
      console.error('Vibration error:', error);
      return false;
    }
  }

  /**
   * Stop vibration
   */
  stop() {
    if (this.isSupported) {
      navigator.vibrate(0);
    }
  }

  /**
   * Enable vibration
   */
  enable() {
    this.enabled = true;
    this.saveSetting('vibrationEnabled', true);
  }

  /**
   * Disable vibration
   */
  disable() {
    this.enabled = false;
    this.saveSetting('vibrationEnabled', false);
    this.stop(); // Stop any ongoing vibration
  }

  /**
   * Toggle vibration
   */
  toggle() {
    this.enabled = !this.enabled;
    this.saveSetting('vibrationEnabled', this.enabled);
    
    if (!this.enabled) {
      this.stop();
    } else {
      // Give feedback that vibration is now enabled
      this.vibrate('tap');
    }
    
    return this.enabled;
  }

  /**
   * Check if vibration is enabled
   */
  isEnabled() {
    return this.enabled && this.isSupported;
  }

  /**
   * Check if vibration is supported by the device
   */
  isDeviceSupported() {
    return this.isSupported;
  }

  /**
   * Test vibration (for settings UI)
   */
  test(patternName = 'success') {
    this.vibrate(patternName);
  }

  // ============================================
  // PREDEFINED FEEDBACK METHODS
  // ============================================

  /**
   * Success feedback - for successful actions
   */
  success() {
    this.vibrate('success');
  }

  /**
   * Error feedback - for errors or failed actions
   */
  error() {
    this.vibrate('error');
  }

  /**
   * Tap feedback - for button presses
   */
  tap() {
    this.vibrate('tap');
  }

  /**
   * Notification feedback
   */
  notification() {
    this.vibrate('notification');
  }

  /**
   * Warning feedback
   */
  warning() {
    this.vibrate('warning');
  }

  /**
   * Order placed celebration feedback
   */
  orderPlaced() {
    this.vibrate('orderPlaced');
  }

  /**
   * Light impact feedback
   */
  light() {
    this.vibrate('light');
  }

  /**
   * Heavy impact feedback
   */
  heavy() {
    this.vibrate('heavy');
  }
}

// Create singleton instance
const vibrationManager = new VibrationManager();

export default vibrationManager;