// File: frontend/src/modules/waiter/hooks/useAssignmentNotifications.js
// 🔔 ASSIGNMENT NOTIFICATIONS HOOK - Real-time waiter assignment handling
// ✅ Socket integration, auto-accept/pass, queue management

import { useState, useEffect, useCallback, useRef } from 'react';
import socketService from '@/shared/services/socketService';
import { toast } from 'react-toastify';

export const useAssignmentNotifications = () => {
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const isMountedRef = useRef(true);
  const queueRef = useRef([]);

  /**
   * Get waiter ID from auth
   */
  const getWaiterId = useCallback(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || user._id;
  }, []);

  /**
   * Handle new assignment request
   */
  const handleAssignmentRequest = useCallback((data) => {
    console.log('🔔 New assignment request:', data);

    const assignment = {
      assignmentId: data.assignmentId,
      order: data.order,
      timeout: data.timeout,
      position: data.position,
      totalWaiters: data.totalWaiters,
      receivedAt: Date.now(),
    };

    // Add to queue
    queueRef.current.push(assignment);

    // If no active assignment, show this one
    if (!activeAssignment) {
      setActiveAssignment(assignment);
    }

    // Update pending list
    setPendingAssignments(prev => [...prev, assignment]);

    // Play notification sound (handled by component)
    toast.info(`New order assignment: Table ${data.order.tableNumber}`, {
      autoClose: 2000,
    });
  }, [activeAssignment]);

  /**
   * Handle assignment timeout (auto-passed)
   */
  const handleAssignmentTimeout = useCallback((data) => {
    console.log('⏰ Assignment timed out:', data);

    // Remove from pending
    setPendingAssignments(prev => 
      prev.filter(a => a.assignmentId !== data.assignmentId)
    );

    // Remove from queue
    queueRef.current = queueRef.current.filter(
      a => a.assignmentId !== data.assignmentId
    );

    // Clear active if it's this one
    if (activeAssignment?.assignmentId === data.assignmentId) {
      setActiveAssignment(null);
      
      // Show next in queue
      if (queueRef.current.length > 0) {
        setActiveAssignment(queueRef.current[0]);
      }
    }

    toast.warning(`Assignment for Order #${data.orderNumber} timed out`);
  }, [activeAssignment]);

  /**
   * Accept assignment (called from component)
   */
  const acceptAssignment = useCallback((assignmentId, order) => {
    console.log('✅ Assignment accepted:', assignmentId);

    // Remove from pending
    setPendingAssignments(prev => 
      prev.filter(a => a.assignmentId !== assignmentId)
    );

    // Remove from queue
    queueRef.current = queueRef.current.filter(
      a => a.assignmentId !== assignmentId
    );

    // Clear active
    setActiveAssignment(null);

    // Show next in queue
    if (queueRef.current.length > 0) {
      setActiveAssignment(queueRef.current[0]);
    }

    toast.success(`Order #${order.orderNumber} accepted!`);
  }, []);

  /**
   * Pass assignment (called from component)
   */
  const passAssignment = useCallback((assignmentId) => {
    console.log('👋 Assignment passed:', assignmentId);

    // Remove from pending
    setPendingAssignments(prev => 
      prev.filter(a => a.assignmentId !== assignmentId)
    );

    // Remove from queue
    queueRef.current = queueRef.current.filter(
      a => a.assignmentId !== assignmentId
    );

    // Clear active
    setActiveAssignment(null);

    // Show next in queue
    if (queueRef.current.length > 0) {
      setActiveAssignment(queueRef.current[0]);
    }

    toast.info('Assignment passed to next waiter');
  }, []);

  /**
   * Timeout assignment (called from component)
   */
  const timeoutAssignment = useCallback((assignmentId) => {
    handleAssignmentTimeout({ assignmentId });
  }, [handleAssignmentTimeout]);

  /**
   * Connect to socket and listen for assignments
   */
  useEffect(() => {
    isMountedRef.current = true;

    const waiterId = getWaiterId();
    if (!waiterId) {
      console.warn('⚠️ No waiter ID found - cannot listen for assignments');
      return;
    }

    // Connect socket
    socketService.connect();

    // Join waiter room
    socketService.joinRoom(`waiter-${waiterId}`);

    // Listen for assignment requests
    socketService.on('order:assignment-request', handleAssignmentRequest);
    socketService.on('order:assignment-timeout', handleAssignmentTimeout);

    // Track connection status
    socketService.on('connect', () => {
      console.log('✅ Connected to assignment notifications');
      setIsConnected(true);
    });

    socketService.on('disconnect', () => {
      console.log('❌ Disconnected from assignment notifications');
      setIsConnected(false);
    });

    setIsConnected(socketService.isSocketConnected());

    // Cleanup
    return () => {
      isMountedRef.current = false;
      
      socketService.off('order:assignment-request', handleAssignmentRequest);
      socketService.off('order:assignment-timeout', handleAssignmentTimeout);
      socketService.leaveRoom(`waiter-${waiterId}`);
    };
  }, [getWaiterId, handleAssignmentRequest, handleAssignmentTimeout]);

  return {
    pendingAssignments,
    activeAssignment,
    isConnected,
    acceptAssignment,
    passAssignment,
    timeoutAssignment,
    hasPendingAssignments: pendingAssignments.length > 0,
  };
};

export default useAssignmentNotifications;