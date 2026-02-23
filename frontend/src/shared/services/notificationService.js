// File: frontend/src/shared/services/notificationService.js

class NotificationService {
  constructor() {
    this.sounds = new Map();
    this.permission = 'default';
    this.initialized = false;
  }

  /**
   * Initialize notification service
   */
  async initialize() {
    if (this.initialized) return;

    // Request browser notification permission
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission();
      console.log('📢 Notification permission:', this.permission);
    }

    // Check vibration support
    if ('vibrate' in navigator) {
      console.log('📳 Vibration API supported');
    }

    // Preload sounds
    await this.preloadSounds();

    this.initialized = true;
    console.log('✅ Notification service initialized');
  }

  /**
   * Preload notification sounds
   */
  async preloadSounds() {
    const soundFiles = {
      'notification.mp3': '/sounds/notification.mp3',
      'new-order.mp3': '/sounds/new-order.mp3',
      'order-ready.mp3': '/sounds/order-ready.mp3',
      'request.mp3': '/sounds/request.mp3',
      'alert.mp3': '/sounds/alert.mp3',
      'success.mp3': '/sounds/success.mp3'
    };

    for (const [name, path] of Object.entries(soundFiles)) {
      try {
        const audio = new Audio(path);
        audio.load();
        this.sounds.set(name, audio);
        console.log(`🔊 Loaded sound: ${name}`);
      } catch (error) {
        console.warn(`⚠️ Failed to load sound: ${name}`, error);
      }
    }
  }

  /**
   * Play notification sound
   */
  playSound(soundFile = 'notification.mp3', volume = 0.7) {
    try {
      const audio = this.sounds.get(soundFile);
      
      if (!audio) {
        console.warn(`⚠️ Sound not found: ${soundFile}`);
        return;
      }

      // Clone audio to allow multiple simultaneous plays
      const audioClone = audio.cloneNode();
      audioClone.volume = volume;
      
      audioClone.play().catch(error => {
        console.warn('⚠️ Could not play sound:', error);
      });

      console.log(`🔊 Playing sound: ${soundFile}`);
    } catch (error) {
      console.error('❌ Error playing sound:', error);
    }
  }

  /**
   * Trigger vibration
   */
  vibrate(pattern = [200, 100, 200]) {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
        console.log('📳 Vibration triggered:', pattern);
      } else {
        console.warn('⚠️ Vibration API not supported');
      }
    } catch (error) {
      console.error('❌ Error triggering vibration:', error);
    }
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.warn('⚠️ Browser notifications not permitted');
      return null;
    }

    try {
      const notification = new Notification(title, {
        body: options.message || '',
        icon: options.icon || '/logo.png',
        badge: options.badge || '/badge.png',
        tag: options.tag || `notif-${Date.now()}`,
        requireInteraction: options.priority === 'urgent' || options.priority === 'high',
        vibrate: options.vibrate || [200, 100, 200],
        ...options
      });

      // Handle click
      notification.onclick = () => {
        window.focus();
        if (options.onClick) {
          options.onClick();
        }
        if (options.actionUrl) {
          window.location.href = options.actionUrl;
        }
        notification.close();
      };

      console.log('📢 Browser notification shown:', title);
      return notification;

    } catch (error) {
      console.error('❌ Error showing browser notification:', error);
      return null;
    }
  }

  /**
   * Process incoming notification
   */
  processNotification(notification) {
    console.log('📬 Processing notification:', notification);

    const {
      title,
      message,
      type,
      priority,
      sound,
      vibration,
      actionUrl,
      data
    } = notification;

    // Play sound
    if (sound?.enabled) {
      const volume = priority === 'urgent' ? 1.0 : 
                    priority === 'high' ? 0.8 : 0.7;
      this.playSound(sound.file, volume);
    }

    // Trigger vibration
    if (vibration?.enabled && vibration?.pattern) {
      this.vibrate(vibration.pattern);
    }

    // Show browser notification
    this.showBrowserNotification(title, {
      message,
      priority,
      tag: `${type}-${data?.orderId || data?.requestId || Date.now()}`,
      icon: this.getIconForType(type),
      actionUrl,
      onClick: () => {
        console.log('📍 Notification clicked');
      }
    });

    // Show in-app notification (toast)
    this.showToast(notification);
  }

  /**
   * Get icon based on notification type
   */
  getIconForType(type) {
    const icons = {
      'order_new': '/icons/new-order.png',
      'order_ready': '/icons/order-ready.png',
      'order_served': '/icons/checkmark.png',
      'order_cancelled': '/icons/cancel.png',
      'table_request': '/icons/bell.png',
      'report_generated': '/icons/document.png',
      'alert': '/icons/warning.png',
      'message': '/icons/message.png',
      'announcement': '/icons/megaphone.png'
    };

    return icons[type] || '/logo.png';
  }

  /**
   * Show in-app toast notification
   */
  showToast(notification) {
    // Dispatch custom event for toast component
    const event = new CustomEvent('show-notification-toast', {
      detail: notification
    });
    window.dispatchEvent(event);
  }

  /**
   * Test notification
   */
  testNotification() {
    this.processNotification({
      title: 'Test Notification',
      message: 'This is a test notification with sound and vibration',
      type: 'message',
      priority: 'normal',
      sound: { enabled: true, file: 'notification.mp3' },
      vibration: { enabled: true, pattern: [200, 100, 200] },
      data: {}
    });
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;