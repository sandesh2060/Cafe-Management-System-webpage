// File: frontend/src/modules/waiter/components/CustomerArrivalNotification.jsx
// 🔔 CUSTOMER ARRIVAL NOTIFICATION - Real-time popup for waiters
// ✅ Accept/Pass buttons, 10s countdown, sound alert, auto-dismiss
// ✅ FIXED: Uses soundPlayer and vibrationManager correctly

import { useState, useEffect, useRef } from 'react';
import { 
  User, MapPin, Clock, CheckCircle, XCircle, 
  Bell, AlertCircle 
} from 'lucide-react';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import soundPlayer from '@/shared/utils/soundPlayer'; // ✅ Correct import
import vibrationManager from '@/shared/utils/vibration'; // ✅ Correct import
import axios from '@/api/axios';

const CustomerArrivalNotification = ({ 
  notification, 
  waiterId, 
  onAccept, 
  onPass, 
  onExpire 
}) => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [accepting, setAccepting] = useState(false);
  const [passing, setPassing] = useState(false);
  
  const notificationRef = useRef(null);
  const progressRef = useRef(null);

  const {
    requestId,
    tableNumber,
    customerName,
    distance,
    isAssigned,
    isEscalated,
    previousWaiters
  } = notification;

  // ============================================
  // ENTRANCE ANIMATION + SOUND
  // ============================================
  useEffect(() => {
    if (notificationRef.current) {
      gsap.fromTo(
        notificationRef.current,
        { 
          x: 400,
          opacity: 0,
          scale: 0.8
        },
        { 
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'back.out(1.5)'
        }
      );
    }

    // ✅ Play sound using soundPlayer
    if (isEscalated) {
      soundPlayer.play('orderReady'); // Urgent → order-ready.mp3
    } else {
      soundPlayer.play('newGuest'); // Normal → new-guest.mp3
    }

    // ✅ Vibrate using vibrationManager
    vibrationManager.vibrate('notification');
  }, [isEscalated]);

  // ============================================
  // COUNTDOWN TIMER
  // ============================================
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ============================================
  // PROGRESS BAR ANIMATION
  // ============================================
  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: `${(timeLeft / 10) * 100}%`,
        duration: 1,
        ease: 'linear'
      });
    }
  }, [timeLeft]);

  // ============================================
  // HANDLE ACCEPT
  // ============================================
  const handleAccept = async () => {
    try {
      setAccepting(true);

      console.log('✅ Accepting request:', requestId);

      const response = await axios.patch(`/requests/${requestId}/accept`, {
        waiterId
      });

      console.log('✅ Accept response:', response);

      // ✅ Play success sound
      soundPlayer.play('orderReady');
      vibrationManager.vibrate('success');

      toast.success(`Table ${tableNumber} accepted!`, {
        position: 'top-center',
        autoClose: 2000
      });

      // Call parent callback
      if (onAccept) {
        onAccept(notification);
      }

    } catch (error) {
      console.error('❌ Accept request error:', error);
      toast.error('Failed to accept request');
      setAccepting(false);
    }
  };

  // ============================================
  // HANDLE PASS
  // ============================================
  const handlePass = async () => {
    try {
      setPassing(true);

      console.log('⏭️ Passing request:', requestId);

      const response = await axios.patch(`/requests/${requestId}/pass`, {
        waiterId
      });

      console.log('✅ Pass response:', response);

      toast.info('Request passed to next waiter', {
        position: 'top-center',
        autoClose: 2000
      });

      // Call parent callback
      if (onPass) {
        onPass(notification);
      }

    } catch (error) {
      console.error('❌ Pass request error:', error);
      toast.error('Failed to pass request');
      setPassing(false);
    }
  };

  // ============================================
  // HANDLE EXPIRE (AUTO-PASS)
  // ============================================
  const handleExpire = () => {
    console.log('⏰ Notification expired, auto-passing');
    
    // Auto-pass to next waiter
    handlePass();

    if (onExpire) {
      onExpire(notification);
    }
  };

  // ============================================
  // GET PRIORITY COLOR
  // ============================================
  const getPriorityColor = () => {
    if (isEscalated) return 'from-error to-warning';
    if (isAssigned) return 'from-brand to-secondary';
    return 'from-info to-brand';
  };

  const getPriorityBg = () => {
    if (isEscalated) return 'bg-error/10 border-error/30';
    if (isAssigned) return 'bg-brand/10 border-brand/30';
    return 'bg-info/10 border-info/30';
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div
      ref={notificationRef}
      className="fixed top-20 right-4 z-50 w-full max-w-md"
    >
      <div className={`bg-bg-elevated rounded-2xl shadow-2xl border-2 ${getPriorityBg()} overflow-hidden`}>
        {/* Progress Bar */}
        <div className="h-1 bg-bg-secondary">
          <div
            ref={progressRef}
            className={`h-full bg-gradient-to-r ${getPriorityColor()} transition-all`}
            style={{ width: '100%' }}
          />
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getPriorityColor()} flex items-center justify-center animate-pulse`}>
                <Bell className="w-6 h-6 text-white" />
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                  Customer Arrived
                  {isEscalated && (
                    <span className="px-2 py-0.5 bg-error text-white text-xs font-semibold rounded-full">
                      URGENT
                    </span>
                  )}
                  {isAssigned && (
                    <span className="px-2 py-0.5 bg-brand text-white text-xs font-semibold rounded-full">
                      YOUR TABLE
                    </span>
                  )}
                </h3>
                <p className="text-sm text-text-tertiary">
                  {timeLeft}s remaining
                </p>
              </div>
            </div>

            {/* Countdown Circle */}
            <div className="relative w-12 h-12">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-bg-secondary"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - timeLeft / 10)}`}
                  className={`${
                    timeLeft <= 3 ? 'text-error' :
                    timeLeft <= 5 ? 'text-warning' :
                    'text-success'
                  } transition-all duration-1000`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-text-primary">
                  {timeLeft}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-text-tertiary" />
              <span className="text-text-primary font-medium">
                {customerName || 'Guest'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-text-tertiary" />
              <span className="text-text-primary font-semibold">
                Table {tableNumber}
              </span>
              {distance !== undefined && distance !== Infinity && (
                <span className="text-sm text-text-tertiary">
                  • ~{Math.round(distance)}m away
                </span>
              )}
            </div>

            {isEscalated && previousWaiters > 0 && (
              <div className="flex items-center gap-2 text-error">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {previousWaiters} waiter{previousWaiters > 1 ? 's' : ''} couldn't respond
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Pass Button */}
            <button
              onClick={handlePass}
              disabled={passing || accepting}
              className="px-4 py-3 bg-bg-secondary hover:bg-bg-tertiary border-2 border-border rounded-xl font-semibold text-text-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {passing ? (
                <>
                  <div className="w-4 h-4 border-2 border-text-tertiary border-t-transparent rounded-full animate-spin" />
                  Passing...
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  Pass
                </>
              )}
            </button>

            {/* Accept Button */}
            <button
              onClick={handleAccept}
              disabled={accepting || passing}
              className={`px-4 py-3 bg-gradient-to-r ${getPriorityColor()} text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {accepting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Accept
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(var(--brand-rgb), 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(var(--brand-rgb), 0.6);
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerArrivalNotification;