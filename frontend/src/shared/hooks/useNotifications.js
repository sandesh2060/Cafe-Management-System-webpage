// File: frontend/src/shared/hooks/useNotifications.js
// TEMPORARY FIX - Updated to handle missing backend endpoint gracefully

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';
import notificationService from '../services/notificationService';
import axios from '@/api/axios';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      
      // Try to fetch from backend
      const response = await axios.get('/notifications', {
        params: { page, limit }
      });

      // Handle response (axios interceptor returns data directly)
      const data = response;
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      
    } catch (error) {
      // TEMPORARY: Silently handle 404 - backend not ready yet
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        console.log('⚠️ Notification endpoint not ready yet. Real-time notifications will still work via Socket.IO');
        setNotifications([]);
        setUnreadCount(0);
      } else {
        console.error('Error fetching notifications:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle incoming real-time notification
   */
  const handleNewNotification = useCallback((data) => {
    console.log('📬 New notification received:', data);

    const notification = data.notification;

    // Process notification (sound, vibration, browser notification)
    notificationService.processNotification(notification);

    // Add to local state
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await axios.patch(`/notifications/${notificationId}/read`);
      
      setNotifications(prev =>
        prev.map(n => n._id === notificationId || n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      // TEMPORARY: Silently handle if backend not ready
      if (error.message?.includes('404')) {
        // Update local state only
        setNotifications(prev =>
          prev.map(n => n._id === notificationId || n.id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        console.error('Error marking notification as read:', error);
      }
    }
  }, []);

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await axios.patch('/notifications/mark-all-read');
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      // TEMPORARY: Silently handle if backend not ready
      if (error.message?.includes('404')) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      } else {
        console.error('Error marking all as read:', error);
      }
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await axios.delete(`/notifications/${notificationId}`);
      
      setNotifications(prev =>
        prev.filter(n => n._id !== notificationId && n.id !== notificationId)
      );
    } catch (error) {
      // TEMPORARY: Silently handle if backend not ready
      if (error.message?.includes('404')) {
        setNotifications(prev =>
          prev.filter(n => n._id !== notificationId && n.id !== notificationId)
        );
      } else {
        console.error('Error deleting notification:', error);
      }
    }
  }, []);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(async () => {
    try {
      await axios.delete('/notifications/clear-all');
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      // TEMPORARY: Silently handle if backend not ready
      if (error.message?.includes('404')) {
        setNotifications([]);
        setUnreadCount(0);
      } else {
        console.error('Error clearing notifications:', error);
      }
    }
  }, []);

  /**
   * Handle notification click
   */
  const handleNotificationClick = useCallback((notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification._id || notification.id);
    }

    // Navigate to action URL
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  }, [navigate, markAsRead]);

  /**
   * Initialize notification service and socket listeners
   */
  useEffect(() => {
    // Initialize notification service
    notificationService.initialize();

    // Connect socket
    if (!socketService.isSocketConnected()) {
      socketService.connect();
    }

    // Get user ID from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const userId = user._id || user.id;
        
        if (userId) {
          // Join user's notification room
          socketService.joinRoom(`user-${userId}`);
          console.log(`✅ Joined notification room: user-${userId}`);
        }
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }

    // Listen for new notifications
    socketService.on('notification:new', handleNewNotification);

    // Fetch initial notifications
    fetchNotifications();

    // Cleanup
    return () => {
      socketService.off('notification:new', handleNewNotification);
    };
  }, [fetchNotifications, handleNewNotification]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    handleNotificationClick
  };
};