// File: frontend/src/shared/utils/soundPlayer.js
// 🔊 Sound Player Utility - Cafe Management Notifications
// ✅ Updated to map aliases and handle missing files gracefully

class SoundPlayer {
  constructor() {
    // Sound file paths (relative to public directory)
    this.sounds = {
      // Primary sounds (your existing files)
      orderReady: '/sounds/order-ready.mp3',      // Kitchen → Waiter: Order is ready for pickup
      newGuest: '/sounds/new-guest.mp3',          // Table → Host: New guest arrived
      waiterCall: '/sounds/waiter-call.mp3',      // Customer → Waiter: Assistance needed
      newOrder: '/sounds/new-order.mp3',          // Customer → Kitchen: New order received
      
      // 🆕 ALIASES - Map missing sound names to existing files
      notification: '/sounds/waiter-call.mp3',    // Generic notification → waiter-call
      bell: '/sounds/new-order.mp3',              // Bell sound → new-order
      urgent: '/sounds/order-ready.mp3',          // Urgent alert → order-ready
      ding: '/sounds/new-guest.mp3',              // Ding sound → new-guest
      
      // Additional aliases for flexibility
      alert: '/sounds/waiter-call.mp3',
      success: '/sounds/order-ready.mp3',
      request: '/sounds/waiter-call.mp3'
    };
    
    // Settings
    this.enabled = this.loadSetting('soundEnabled', true);
    this.volume = this.loadSetting('soundVolume', 0.7);
    
    // Preloaded audio objects for better performance
    this.audioCache = {};
    
    // Track which sounds have failed to load
    this.failedSounds = new Set();
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
   * Create fallback beep sound using Web Audio API
   */
  createBeepSound(duration = 200, frequency = 800) {
    if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
      console.warn('Web Audio API not supported');
      return null;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(this.volume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration / 1000);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + duration / 1000);

      return true;
    } catch (error) {
      console.error('Error creating beep sound:', error);
      return null;
    }
  }

  /**
   * Preload a sound for instant playback
   */
  preload(soundName) {
    const soundPath = this.sounds[soundName];
    if (!soundPath) {
      console.warn(`⚠️ Sound "${soundName}" not found in sound map`);
      return;
    }

    // Skip if already failed
    if (this.failedSounds.has(soundName)) {
      return;
    }

    if (!this.audioCache[soundName]) {
      try {
        const audio = new Audio(soundPath);
        audio.volume = this.volume;
        audio.preload = 'auto';
        
        // Handle loading errors
        audio.addEventListener('error', (e) => {
          console.warn(`⚠️ Sound file not found: ${soundPath}, using beep`);
          this.failedSounds.add(soundName);
        });

        this.audioCache[soundName] = audio;
      } catch (error) {
        console.error(`Error preloading sound "${soundName}":`, error);
        this.failedSounds.add(soundName);
      }
    }
  }

  /**
   * Preload all sounds
   */
  preloadAll() {
    // Only preload primary sounds (not aliases) to avoid duplicates
    const primarySounds = ['orderReady', 'newGuest', 'waiterCall', 'newOrder'];
    primarySounds.forEach(soundName => {
      this.preload(soundName);
    });
  }

  /**
   * Play a notification sound
   * @param {string} soundName - Name of the sound to play
   * @param {object} options - Optional settings
   */
  play(soundName, options = {}) {
    if (!this.enabled) return;
    
    const soundPath = this.sounds[soundName];
    if (!soundPath) {
      console.warn(`⚠️ Sound "${soundName}" not found, using beep`);
      this.createBeepSound();
      return;
    }

    // If this sound has failed before, use beep
    if (this.failedSounds.has(soundName)) {
      this.createBeepSound();
      return;
    }

    try {
      // Use cached audio if available, otherwise create new
      let audio;
      if (this.audioCache[soundName] && !options.forceNew) {
        audio = this.audioCache[soundName];
        audio.currentTime = 0; // Reset to start
      } else {
        audio = new Audio(soundPath);
        
        // Handle error - file not found
        audio.addEventListener('error', (e) => {
          console.warn(`⚠️ Sound file not found: ${soundPath}, using beep`);
          this.failedSounds.add(soundName);
          this.createBeepSound();
        }, { once: true });
      }

      // Apply volume
      audio.volume = options.volume !== undefined ? options.volume : this.volume;

      // Play with error handling
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          // File not found or other error - use beep
          if (err.name === 'NotSupportedError' || err.message.includes('DEMUXER_ERROR')) {
            console.warn(`⚠️ Sound file not found: ${soundPath}, using beep`);
            this.failedSounds.add(soundName);
            this.createBeepSound();
          } else if (err.name === 'NotAllowedError') {
            console.warn('Sound playback blocked. User interaction required.');
          } else {
            console.error(`Error playing sound "${soundName}":`, err);
            this.createBeepSound();
          }
        });
      }
    } catch (error) {
      console.error(`Error playing sound "${soundName}":`, error);
      this.createBeepSound();
    }
  }

  /**
   * Play sound multiple times (for urgent alerts)
   * @param {string} soundName - Name of the sound
   * @param {number} times - Number of times to play
   * @param {number} interval - Milliseconds between plays
   */
  playMultiple(soundName, times = 3, interval = 1000) {
    let count = 0;
    const intervalId = setInterval(() => {
      this.play(soundName, { forceNew: true });
      count++;
      if (count >= times) {
        clearInterval(intervalId);
      }
    }, interval);
  }

  /**
   * Set volume level (0.0 to 1.0)
   */
  setVolume(level) {
    this.volume = Math.max(0, Math.min(1, level));
    this.saveSetting('soundVolume', this.volume);
    
    // Update cached audio volumes
    Object.values(this.audioCache).forEach(audio => {
      audio.volume = this.volume;
    });
  }

  /**
   * Get current volume
   */
  getVolume() {
    return this.volume;
  }

  /**
   * Mute all sounds
   */
  mute() {
    this.enabled = false;
    this.saveSetting('soundEnabled', false);
  }

  /**
   * Unmute all sounds
   */
  unmute() {
    this.enabled = true;
    this.saveSetting('soundEnabled', true);
  }

  /**
   * Toggle sound on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    this.saveSetting('soundEnabled', this.enabled);
    return this.enabled;
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Test a sound (for settings UI)
   */
  test(soundName) {
    this.play(soundName);
  }

  /**
   * Get all available sounds
   */
  getAvailableSounds() {
    return Object.keys(this.sounds);
  }

  /**
   * 🆕 Get sound file status
   */
  getSoundStatus() {
    const status = {};
    Object.keys(this.sounds).forEach(soundName => {
      status[soundName] = {
        path: this.sounds[soundName],
        cached: !!this.audioCache[soundName],
        failed: this.failedSounds.has(soundName)
      };
    });
    return status;
  }
}

// Create singleton instance
const soundPlayer = new SoundPlayer();

// Preload common sounds on initialization
if (typeof window !== 'undefined') {
  // Wait for user interaction before preloading
  const preloadOnInteraction = () => {
    soundPlayer.preloadAll();
    window.removeEventListener('click', preloadOnInteraction);
    window.removeEventListener('touchstart', preloadOnInteraction);
  };
  
  window.addEventListener('click', preloadOnInteraction, { once: true });
  window.addEventListener('touchstart', preloadOnInteraction, { once: true });
}

export default soundPlayer;