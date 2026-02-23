// File: frontend/src/shared/services/socketService.js
// 🔌 SOCKET SERVICE - Enhanced WebSocket real-time communication
// ✅ Auto-reconnect, room management, event handling, authentication

import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.rooms = new Set(); // Track joined rooms for auto-rejoin on reconnect
  }

  /**
   * Connect to WebSocket server with authentication
   */
  connect() {
    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      return this.socket;
    }

    try {
      // Get token for authentication (if available)
      const token = localStorage.getItem('token');
      
      // Determine socket URL
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
                         import.meta.env.VITE_API_URL?.replace('/api', '') || 
                         'http://localhost:5000';

      console.log('🔌 Connecting to WebSocket:', SOCKET_URL);

      // Initialize socket with auth
      this.socket = io(SOCKET_URL, {
        auth: token ? { token } : {},
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      // ===== CONNECTION EVENTS =====
      this.socket.on('connect', () => {
        console.log('✅ Socket.IO connected:', this.socket.id);
        this.isConnected = true;
        
        // Auto-rejoin all rooms after reconnection
        if (this.rooms.size > 0) {
          console.log(`🔄 Rejoining ${this.rooms.size} room(s)...`);
          this.rooms.forEach(room => {
            this.socket.emit('join-room', room);
            console.log(`  ↳ Rejoined: ${room}`);
          });
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket.IO disconnected:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error.message);
        this.isConnected = false;
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`✅ Socket reconnected after ${attemptNumber} attempt(s)`);
        this.isConnected = true;
      });

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 Reconnection attempt #${attemptNumber}...`);
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('❌ Reconnection error:', error.message);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('❌ Reconnection failed after all attempts');
        this.isConnected = false;
      });

      return this.socket;
    } catch (error) {
      console.error('❌ Failed to initialize socket:', error);
      return null;
    }
  }

  /**
   * Disconnect socket and cleanup
   */
  disconnect() {
    if (this.socket) {
      // Clean up all listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.off(event, callback);
        });
      });
      
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.rooms.clear();
      this.listeners.clear();
      console.log('🔌 Socket disconnected and cleaned up');
    }
  }

  /**
   * Join a room (with tracking for auto-rejoin)
   */
  joinRoom(room) {
    if (!this.socket) {
      console.warn('⚠️ Socket not initialized, cannot join room:', room);
      return;
    }

    if (!this.isConnected) {
      console.warn('⚠️ Socket not connected, queueing room join:', room);
      this.rooms.add(room); // Queue for when connection is established
      return;
    }

    this.socket.emit('join-room', room);
    this.rooms.add(room); // Track for auto-rejoin
    console.log(`📍 Joined room: ${room}`);
  }

  /**
   * Leave a room (with tracking cleanup)
   */
  leaveRoom(room) {
    if (!this.socket) {
      return;
    }

    if (this.isConnected) {
      this.socket.emit('leave-room', room);
    }
    
    this.rooms.delete(room); // Remove from tracking
    console.log(`🚪 Left room: ${room}`);
  }

  /**
   * Listen to an event (with automatic cleanup tracking)
   */
  on(event, callback) {
    if (!this.socket) {
      console.warn('⚠️ Socket not initialized, cannot listen to event:', event);
      return;
    }

    this.socket.on(event, callback);
    
    // Track listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    
    console.log(`👂 Listening to event: ${event}`);
  }

  /**
   * Stop listening to an event
   */
  off(event, callback) {
    if (!this.socket) {
      return;
    }

    if (callback) {
      // Remove specific callback
      this.socket.off(event, callback);
      
      // Update listeners map
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
          
          // Remove event from map if no callbacks left
          if (callbacks.length === 0) {
            this.listeners.delete(event);
          }
        }
      }
    } else {
      // Remove all callbacks for this event
      this.socket.off(event);
      this.listeners.delete(event);
    }

    console.log(`🔇 Stopped listening to event: ${event}`);
  }

  /**
   * Emit an event to the server
   */
  emit(event, data) {
    if (!this.socket) {
      console.warn('⚠️ Socket not initialized, cannot emit event:', event);
      return;
    }

    if (!this.isConnected) {
      console.warn('⚠️ Socket not connected, cannot emit event:', event);
      return;
    }

    this.socket.emit(event, data);
    console.log(`📡 Emitted event: ${event}`, data);
  }

  /**
   * Emit an event with acknowledgement callback
   */
  emitWithAck(event, data, callback) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, cannot emit event:', event);
      callback?.(new Error('Socket not connected'));
      return;
    }

    this.socket.emit(event, data, (response) => {
      console.log(`✅ Received acknowledgement for: ${event}`, response);
      callback?.(null, response);
    });
  }

  /**
   * Check if socket is connected
   */
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  /**
   * Get socket instance
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Get socket ID
   */
  getSocketId() {
    return this.socket?.id || null;
  }

  /**
   * Get list of joined rooms
   */
  getJoinedRooms() {
    return Array.from(this.rooms);
  }

  /**
   * Check if in a specific room
   */
  isInRoom(room) {
    return this.rooms.has(room);
  }

  /**
   * Reconnect manually
   */
  reconnect() {
    if (this.socket) {
      console.log('🔄 Manual reconnection triggered...');
      this.socket.connect();
    }
  }
}

// Export singleton instance
const socketService = new SocketService();

export default socketService;