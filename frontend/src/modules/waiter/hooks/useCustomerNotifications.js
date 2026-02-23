// File: frontend/src/modules/waiter/hooks/useCustomerNotifications.js
// 🔔 WAITER NOTIFICATIONS HOOK
// ✅ WebSocket connection, notification management, Accept/Pass actions

import { useState, useEffect, useCallback } from 'react';
import socketService from '@/shared/services/socketService';
import { useAuth } from '@/shared/hooks/useAuth';

export const useCustomerNotifications = () => {
  const { user } = useAuth();
  const waiterId = user?._id || user?.id;

  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // ============================================
  // CONNECT TO SOCKET.IO
  // ============================================
  useEffect(() => {
    if (!waiterId) {
      console.warn('⚠️ No waiter ID, skipping socket connection');
      return;
    }

    console.log('🔌 Connecting to Socket.IO as waiter:', waiterId);

    // Connect to Socket.IO
    const socket = socketService.connect();

    if (!socket) {
      console.error('❌ Failed to connect to Socket.IO');
      return;
    }

    // Register as waiter
    socket.emit('waiter:connect', {
      waiterId,
      name: user?.name || 'Waiter'
    });

    // Listen for connection confirmation
    socket.on('waiter:connected', (data) => {
      console.log('✅ Waiter connected:', data);
      setIsConnected(true);
    });

    // Listen for customer arrival notifications
    socket.on('customer:arrived', (data) => {
      console.log('🔔 Customer arrived notification:', data);
      handleNewNotification(data);
    });

    // Listen for urgent notifications (no waiter accepted)
    socket.on('customer:arrived:urgent', (data) => {
      console.log('🚨 URGENT customer arrival:', data);
      handleNewNotification({ ...data, isUrgent: true });
    });

    // Listen for request accepted by another waiter
    socket.on('request:accepted', (data) => {
      console.log('✅ Request accepted by another waiter:', data);
      removeNotification(data.requestId);
    });

    // Listen for request passed
    socket.on('request:passed', (data) => {
      console.log('⏭️ Request passed:', data);
      // Notification will be removed automatically when new one arrives
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket connection');
      socket.off('waiter:connected');
      socket.off('customer:arrived');
      socket.off('customer:arrived:urgent');
      socket.off('request:accepted');
      socket.off('request:passed');
      socketService.disconnect();
      setIsConnected(false);
    };
  }, [waiterId, user?.name]);

  // ============================================
  // UPDATE LOCATION FOR PROXIMITY MATCHING
  // ============================================
  const updateLocation = useCallback((latitude, longitude) => {
    if (!socketService.isConnected()) return;

    socketService.emit('waiter:location', {
      waiterId,
      latitude,
      longitude
    });

    console.log('📍 Location updated:', { latitude, longitude });
  }, [waiterId]);

  // ============================================
  // GEOLOCATION TRACKING
  // ============================================
  useEffect(() => {
    if (!waiterId || !navigator.geolocation) return;

    // Get initial location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.warn('⚠️ Geolocation error:', error);
      }
    );

    // Watch location (update every 30 seconds)
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        updateLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.warn('⚠️ Geolocation watch error:', error);
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 30000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [waiterId, updateLocation]);

  // ============================================
  // HANDLE NEW NOTIFICATION
  // ============================================
  const handleNewNotification = useCallback((notification) => {
    setNotifications((prev) => {
      // Remove existing notification with same requestId
      const filtered = prev.filter(n => n.requestId !== notification.requestId);
      
      // Add new notification
      return [...filtered, notification];
    });
  }, []);

  // ============================================
  // REMOVE NOTIFICATION
  // ============================================
  const removeNotification = useCallback((requestId) => {
    setNotifications((prev) => prev.filter(n => n.requestId !== requestId));
  }, []);

  // ============================================
  // HANDLE ACCEPT
  // ============================================
  const handleAccept = useCallback((notification) => {
    console.log('✅ Accepting notification:', notification.requestId);
    
    // Remove from local state
    removeNotification(notification.requestId);

    // Emit acceptance via socket
    socketService.emit('request:accept', {
      requestId: notification.requestId,
      waiterId
    });
  }, [waiterId, removeNotification]);

  // ============================================
  // HANDLE PASS
  // ============================================
  const handlePass = useCallback((notification) => {
    console.log('⏭️ Passing notification:', notification.requestId);
    
    // Remove from local state
    removeNotification(notification.requestId);

    // Emit pass via socket
    socketService.emit('request:pass', {
      requestId: notification.requestId,
      waiterId
    });
  }, [waiterId, removeNotification]);

  // ============================================
  // HANDLE EXPIRE (AUTO-PASS)
  // ============================================
  const handleExpire = useCallback((notification) => {
    console.log('⏰ Notification expired:', notification.requestId);
    
    // Auto-pass
    handlePass(notification);
  }, [handlePass]);

  return {
    notifications,
    isConnected,
    updateLocation,
    handleAccept,
    handlePass,
    handleExpire
  };
};