// File: frontend/src/modules/customer/hooks/useTableSession.js
// 🪑 TABLE SESSION MANAGEMENT WITH QR CODE & WEBSOCKET

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import tableSessionService from '../services/tableSessionService';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useTableSession = () => {
  const [tableNumber, setTableNumber] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('tableSession');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setTableNumber(parsed.tableNumber);
        setSessionData(parsed);
      } catch (error) {
        console.error('Failed to parse saved session:', error);
        localStorage.removeItem('tableSession');
      }
    }
  }, []);

  // WebSocket connection
  useEffect(() => {
    if (sessionData?.id) {
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      newSocket.on('connect', () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        newSocket.emit('joinTableSession', { sessionId: sessionData.id });
      });

      newSocket.on('disconnect', () => {
        console.log('❌ WebSocket disconnected');
        setIsConnected(false);
      });

      // Listen for session updates
      newSocket.on('sessionUpdated', (updatedSession) => {
        console.log('📊 Session updated:', updatedSession);
        setSessionData(updatedSession);
        localStorage.setItem('tableSession', JSON.stringify(updatedSession));
      });

      // Listen for order status updates
      newSocket.on('orderStatusChanged', (orderUpdate) => {
        console.log('📦 Order status changed:', orderUpdate);
        toast.info(`Order ${orderUpdate.status}!`, {
          icon: orderUpdate.status === 'ready' ? '✅' : '🍳'
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [sessionData?.id]);

  // Scan QR code and create/join session
  const scanQRCode = useCallback(async (qrData) => {
    try {
      setLoading(true);

      // Extract table number from QR code
      // Expected format: "TABLE-{tableNumber}" or just the number
      let extractedTableNumber;
      if (typeof qrData === 'string') {
        const match = qrData.match(/TABLE-(\d+)/i) || qrData.match(/(\d+)/);
        extractedTableNumber = match ? parseInt(match[1]) : null;
      } else if (typeof qrData === 'number') {
        extractedTableNumber = qrData;
      }

      if (!extractedTableNumber) {
        throw new Error('Invalid QR code format');
      }

      // Create or join session
      const response = await tableSessionService.createOrJoinSession(extractedTableNumber);

      if (response.success) {
        setTableNumber(extractedTableNumber);
        setSessionData(response.session);
        localStorage.setItem('tableSession', JSON.stringify({
          tableNumber: extractedTableNumber,
          ...response.session
        }));
        toast.success(`Welcome to Table ${extractedTableNumber}! 🪑`);
        return { success: true, session: response.session };
      } else {
        throw new Error(response.error || 'Failed to create session');
      }
    } catch (error) {
      console.error('QR scan error:', error);
      toast.error(error.message || 'Failed to scan QR code');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Manually set table number (for testing/demo)
  const setTableManually = useCallback(async (number) => {
    return await scanQRCode(number);
  }, [scanQRCode]);

  // Update session cart
  const updateSessionCart = useCallback(async (cart) => {
    if (!sessionData?.id) {
      console.warn('No active session to update');
      return { success: false, error: 'No active session' };
    }

    try {
      const response = await tableSessionService.updateCart(sessionData.id, cart);
      
      if (response.success) {
        setSessionData(response.session);
        localStorage.setItem('tableSession', JSON.stringify(response.session));
        
        // Emit WebSocket event for real-time sync
        if (socket && isConnected) {
          socket.emit('cartUpdated', {
            sessionId: sessionData.id,
            cart: response.session.cart
          });
        }

        return { success: true, session: response.session };
      } else {
        throw new Error(response.error || 'Failed to update cart');
      }
    } catch (error) {
      console.error('Cart update error:', error);
      return { success: false, error: error.message };
    }
  }, [sessionData, socket, isConnected]);

  // Get active session
  const getActiveSession = useCallback(async () => {
    if (!tableNumber) {
      return { success: false, error: 'No table number set' };
    }

    try {
      setLoading(true);
      const response = await tableSessionService.getActiveSession(tableNumber);
      
      if (response.success) {
        setSessionData(response.session);
        localStorage.setItem('tableSession', JSON.stringify(response.session));
        return { success: true, session: response.session };
      } else {
        throw new Error(response.error || 'No active session found');
      }
    } catch (error) {
      console.error('Get session error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [tableNumber]);

  // End session (when customer leaves)
  const endSession = useCallback(async () => {
    if (!sessionData?.id) {
      return { success: false, error: 'No active session' };
    }

    try {
      setLoading(true);
      const response = await tableSessionService.endSession(sessionData.id);
      
      if (response.success) {
        setTableNumber(null);
        setSessionData(null);
        localStorage.removeItem('tableSession');
        
        if (socket) {
          socket.emit('leaveTableSession', { sessionId: sessionData.id });
          socket.close();
        }
        
        toast.success('Session ended. Thank you! 👋');
        return { success: true };
      } else {
        throw new Error(response.error || 'Failed to end session');
      }
    } catch (error) {
      console.error('End session error:', error);
      toast.error(error.message || 'Failed to end session');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [sessionData, socket]);

  return {
    tableNumber,
    sessionData,
    loading,
    isConnected,
    scanQRCode,
    setTableManually,
    updateSessionCart,
    getActiveSession,
    endSession
  };
};