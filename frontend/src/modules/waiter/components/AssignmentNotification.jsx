// File: frontend/src/modules/waiter/components/AssignmentNotification.jsx
// 🔔 WAITER ASSIGNMENT NOTIFICATION - Accept or Pass with 10s countdown
// ✅ Real-time socket notifications, auto-dismiss on timeout
// ✅ FIXED: Uses soundPlayer instead of direct Audio loading

import { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Clock, User, MapPin, Package, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from '@/shared/utils/api';
import gsap from 'gsap';
import soundPlayer from '@/shared/utils/soundPlayer'; // ✅ Use soundPlayer
import vibrationManager from '@/shared/utils/vibration'; // ✅ Use vibration manager

const AssignmentNotification = ({ 
  assignment, 
  onAccept, 
  onPass, 
  onTimeout 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [accepting, setAccepting] = useState(false);
  const [passing, setPassing] = useState(false);
  
  const notificationRef = useRef(null);
  const progressRef = useRef(null);

  /**
   * Play notification sound and vibrate
   */
  useEffect(() => {
    // ✅ Play sound using soundPlayer (uses existing waiter-call.mp3)
    soundPlayer.play('waiterCall');

    // ✅ Vibrate using vibrationManager
    vibrationManager.vibrate('notification');

    // Entrance animation
    if (notificationRef.current) {
      gsap.from(notificationRef.current, {
        scale: 0.8,
        opacity: 0,
        y: -50,
        duration: 0.4,
        ease: 'back.out(1.7)',
      });
    }
  }, []);

  /**
   * Countdown timer
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Update progress bar
   */
  useEffect(() => {
    if (progressRef.current) {
      const percentage = (timeRemaining / 10) * 100;
      gsap.to(progressRef.current, {
        width: `${percentage}%`,
        duration: 1,
        ease: 'linear',
      });
    }
  }, [timeRemaining]);

  /**
   * Handle timeout
   */
  const handleTimeout = () => {
    toast.warning('Assignment timed out - passed to next waiter');
    
    // Exit animation
    if (notificationRef.current) {
      gsap.to(notificationRef.current, {
        scale: 0.8,
        opacity: 0,
        y: -50,
        duration: 0.3,
        onComplete: () => {
          if (onTimeout) onTimeout(assignment.assignmentId);
        }
      });
    }
  };

  /**
   * Handle accept
   */
  const handleAccept = async () => {
    try {
      setAccepting(true);

      const response = await axios.post(`/waiter-assignment/accept/${assignment.assignmentId}`);

      if (response.data.success) {
        // ✅ Play success sound
        soundPlayer.play('orderReady');
        vibrationManager.vibrate('success');

        toast.success(`✅ Order #${assignment.order.orderNumber} accepted!`, {
          autoClose: 3000,
        });

        // Success animation
        if (notificationRef.current) {
          gsap.to(notificationRef.current, {
            scale: 1.1,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
              gsap.to(notificationRef.current, {
                scale: 0,
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                  if (onAccept) onAccept(assignment.assignmentId, response.data.order);
                }
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('❌ Accept error:', error);
      toast.error(error.response?.data?.message || 'Failed to accept assignment');
      setAccepting(false);
    }
  };

  /**
   * Handle pass
   */
  const handlePass = async () => {
    try {
      setPassing(true);

      const response = await axios.post(`/waiter-assignment/pass/${assignment.assignmentId}`, {
        reason: 'Currently busy with another table'
      });

      if (response.data.success) {
        toast.info('Order passed to next waiter');

        // Exit animation
        if (notificationRef.current) {
          gsap.to(notificationRef.current, {
            x: 100,
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
              if (onPass) onPass(assignment.assignmentId);
            }
          });
        }
      }
    } catch (error) {
      console.error('❌ Pass error:', error);
      toast.error(error.response?.data?.message || 'Failed to pass assignment');
      setPassing(false);
    }
  };

  const progressPercentage = (timeRemaining / 10) * 100;
  const isUrgent = timeRemaining <= 3;

  return (
    <>
      {/* Notification Card */}
      <div
        ref={notificationRef}
        className={`fixed top-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] bg-bg-elevated backdrop-blur-xl rounded-2xl shadow-custom-2xl border-2 overflow-hidden ${
          isUrgent ? 'border-error animate-pulse-border' : 'border-brand'
        }`}
      >
        {/* Header */}
        <div className="relative p-5 bg-gradient-to-r from-brand to-secondary">
          <div className="flex items-start justify-between text-white mb-2">
            <div>
              <h3 className="text-lg font-bold mb-1">🔔 New Order Assignment</h3>
              <p className="text-sm opacity-90">
                You're the nearest waiter ({assignment.position}/{assignment.totalWaiters})
              </p>
            </div>
            <div className={`text-2xl font-bold ${isUrgent ? 'animate-bounce' : ''}`}>
              {timeRemaining}s
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              ref={progressRef}
              className={`absolute inset-y-0 left-0 rounded-full transition-colors ${
                isUrgent ? 'bg-error' : 'bg-white'
              }`}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Order Details */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between p-3 bg-brand/5 rounded-xl border border-brand/20">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-brand" />
              <span className="font-bold text-text-primary">
                Order #{assignment.order.orderNumber}
              </span>
            </div>
            <span className="text-xl font-bold text-brand">
              ${assignment.order.total.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <MapPin className="w-4 h-4 text-brand" />
              <span>Table {assignment.order.tableNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Package className="w-4 h-4 text-brand" />
              <span>{assignment.order.items} items</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <Clock className="w-3 h-3" />
            <span>
              Placed {new Date(assignment.order.createdAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 pt-0 grid grid-cols-2 gap-3">
          <button
            onClick={handlePass}
            disabled={passing || accepting}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-bg-secondary hover:bg-error/10 text-text-secondary hover:text-error font-semibold rounded-xl transition-all disabled:opacity-50 border border-border hover:border-error/30"
          >
            <XCircle className="w-5 h-5" />
            {passing ? 'Passing...' : 'Pass'}
          </button>

          <button
            onClick={handleAccept}
            disabled={accepting || passing}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5" />
            {accepting ? 'Accepting...' : 'Accept'}
          </button>
        </div>

        {/* Warning for urgent */}
        {isUrgent && (
          <div className="px-5 pb-5">
            <div className="flex items-center gap-2 p-3 bg-error/10 text-error text-sm font-semibold rounded-xl border border-error/20">
              <AlertCircle className="w-4 h-4" />
              <span>Hurry! Auto-passing in {timeRemaining}s...</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-border {
          0%, 100% { border-color: rgb(239, 68, 68); }
          50% { border-color: rgb(239, 68, 68, 0.3); }
        }

        .animate-pulse-border {
          animation: pulse-border 1s infinite;
        }
      `}</style>
    </>
  );
};

export default AssignmentNotification;