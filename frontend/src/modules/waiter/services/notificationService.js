// File: frontend/src/modules/waiter/services/notificationService.js
// 🔔 NOTIFICATION SERVICE - Sound alerts, vibration, browser notifications
// ✅ New orders, order ready, customer requests

class NotificationService {
  constructor() {
    this.soundEnabled = localStorage.getItem('waiter_sound_enabled') !== 'false';
    this.notificationPermission = 'default';
    this.audioContext = null;
    this.sounds = {};
    
    this.init();
  }

  /**
   * Initialize notification service
   */
  async init() {
    // Request notification permission
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
      console.log('🔔 Notification permission:', this.notificationPermission);
    }

    // Initialize audio context
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Preload notification sounds
    this.loadSounds();
  }

  /**
   * Load notification sounds
   */
  loadSounds() {
    // Define sound URLs (you can replace with your own)
    const soundUrls = {
      newOrder: '/sounds/notification.mp3',
      orderReady: '/sounds/order-ready.mp3',
      customerRequest: '/sounds/bell.mp3',
      urgent: '/sounds/urgent.mp3',
    };

    // Create Audio objects
    Object.keys(soundUrls).forEach(key => {
      const audio = new Audio(soundUrls[key]);
      audio.preload = 'auto';
      
      // Fallback: generate sound if file doesn't exist
      audio.onerror = () => {
        console.warn(`⚠️ Sound file not found: ${soundUrls[key]}, using beep`);
        this.sounds[key] = 'beep';
      };
      
      this.sounds[key] = audio;
    });
  }

  /**
   * Play notification sound
   */
  playSound(soundType = 'newOrder') {
    if (!this.soundEnabled) {
      console.log('🔇 Sound disabled');
      return;
    }

    try {
      const sound = this.sounds[soundType];
      
      if (!sound || sound === 'beep') {
        // Generate beep using Web Audio API
        this.playBeep();
        return;
      }

      // Play audio file
      sound.currentTime = 0;
      sound.volume = 0.7;
      
      const playPromise = sound.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('🔊 Sound played:', soundType);
          })
          .catch(error => {
            console.warn('⚠️ Sound play error:', error);
            // Fallback to beep
            this.playBeep();
          });
      }
    } catch (error) {
      console.error('❌ Sound error:', error);
      this.playBeep();
    }
  }

  /**
   * Generate beep sound using Web Audio API
   */
  playBeep(frequency = 800, duration = 200) {
    if (!this.audioContext || !this.soundEnabled) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration / 1000
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);

      console.log('🔊 Beep played');
    } catch (error) {
      console.error('❌ Beep error:', error);
    }
  }

  /**
   * Show browser notification
   */
  showNotification(title, options = {}) {
    if (!('Notification' in window)) {
      console.warn('⚠️ Browser notifications not supported');
      return;
    }

    if (this.notificationPermission !== 'granted') {
      console.warn('⚠️ Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/icon.png',
        badge: '/badge.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        if (options.onClick) {
          options.onClick();
        }
      };

      console.log('📬 Notification shown:', title);
    } catch (error) {
      console.error('❌ Notification error:', error);
    }
  }

  /**
   * Vibrate device (mobile)
   */
  vibrate(pattern = [200, 100, 200]) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
      console.log('📳 Vibration triggered');
    }
  }

  /**
   * Notify new order
   */
  notifyNewOrder(order, tableNumber) {
    console.log('🆕 New order notification:', order);

    // Play sound
    this.playSound('newOrder');

    // Show browser notification
    this.showNotification('🆕 New Order!', {
      body: `Table ${tableNumber} - Order #${order.orderNumber}\n${order.items?.length || 0} items`,
      tag: `order-${order._id}`,
      onClick: () => {
        // Navigate to order details
        window.location.href = `/waiter/orders?highlight=${order._id}`;
      },
    });

    // Vibrate
    this.vibrate([200, 100, 200, 100, 200]);
  }

  /**
   * Notify order ready
   */
  notifyOrderReady(order, tableNumber) {
    console.log('✅ Order ready notification:', order);

    // Play sound
    this.playSound('orderReady');

    // Show browser notification
    this.showNotification('✅ Order Ready!', {
      body: `Table ${tableNumber} - Order #${order.orderNumber} is ready to serve`,
      tag: `order-ready-${order._id}`,
      onClick: () => {
        window.location.href = `/waiter/orders?highlight=${order._id}`;
      },
    });

    // Vibrate
    this.vibrate([400, 200, 400]);
  }

  /**
   * Notify customer request
   */
  notifyCustomerRequest(request, tableNumber) {
    console.log('🔔 Customer request notification:', request);

    // Play sound
    this.playSound('customerRequest');

    // Show browser notification
    this.showNotification('🔔 Customer Request', {
      body: `Table ${tableNumber} needs assistance:\n${request.message || 'General assistance'}`,
      tag: `request-${request._id}`,
      requireInteraction: true,
      onClick: () => {
        window.location.href = `/waiter/tables?table=${request.tableId}`;
      },
    });

    // Vibrate
    this.vibrate([300, 100, 300, 100, 300]);
  }

  /**
   * Notify urgent request
   */
  notifyUrgent(message, tableNumber) {
    console.log('🚨 Urgent notification:', message);

    // Play urgent sound
    this.playSound('urgent');

    // Show browser notification
    this.showNotification('🚨 URGENT!', {
      body: `Table ${tableNumber}: ${message}`,
      tag: 'urgent',
      requireInteraction: true,
    });

    // Vibrate urgently
    this.vibrate([500, 200, 500, 200, 500]);
  }

  /**
   * Toggle sound on/off
   */
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('waiter_sound_enabled', this.soundEnabled);
    console.log('🔊 Sound:', this.soundEnabled ? 'enabled' : 'disabled');
    
    // Play test beep
    if (this.soundEnabled) {
      this.playBeep(600, 100);
    }
    
    return this.soundEnabled;
  }

  /**
   * Check if sound is enabled
   */
  isSoundEnabled() {
    return this.soundEnabled;
  }

  /**
   * Test notification
   */
  testNotification() {
    this.playBeep();
    this.showNotification('🧪 Test Notification', {
      body: 'Notifications are working correctly!',
    });
    this.vibrate([200, 100, 200]);
  }
}

// Export singleton instance
const notificationService = new NotificationService();
export default notificationService;