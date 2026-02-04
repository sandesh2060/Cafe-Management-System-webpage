// frontend/src/components/customer/TokenEarnAlert/TokenEarnAlert.jsx
import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Zap, X, CheckCircle } from 'lucide-react';

const TokenEarnAlert = ({ isVisible = true, points = 50, message = 'You earned 50 points!' }) => {
  const alertRef = useRef(null);
  const [show, setShow] = useState(isVisible);

  useGSAP(
    () => {
      if (show && alertRef.current) {
        // Slide in from right
        gsap.fromTo(
          alertRef.current,
          {
            opacity: 0,
            x: 400,
            scale: 0.8,
          },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.5,
            ease: 'back.out',
          }
        );

        // Auto dismiss after 5 seconds
        const timeout = setTimeout(() => {
          gsap.to(alertRef.current, {
            opacity: 0,
            x: 400,
            scale: 0.8,
            duration: 0.4,
            ease: 'back.in',
            onComplete: () => setShow(false),
          });
        }, 5000);

        return () => clearTimeout(timeout);
      }
    },
    { dependencies: [show] }
  );

  const handleClose = () => {
    gsap.to(alertRef.current, {
      opacity: 0,
      x: 400,
      scale: 0.8,
      duration: 0.3,
      ease: 'back.in',
      onComplete: () => setShow(false),
    });
  };

  if (!show) return null;

  return (
    <div
      ref={alertRef}
      className="fixed bottom-4 right-4 z-50 max-w-sm w-full md:max-w-md"
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-2xl overflow-hidden border-2 border-yellow-300">
        {/* Progress Bar */}
        <div className="h-1 bg-white/30">
          <div
            className="h-full bg-white animate-pulse"
            style={{
              animation: 'shrink 5s linear forwards',
            }}
          />
        </div>

        {/* Content */}
        <div className="p-4 flex items-start gap-4">
          {/* Icon with animation */}
          <div className="flex-shrink-0 relative">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
            <div className="relative bg-white/30 p-2 rounded-full">
              <Zap size={24} className="text-white" />
            </div>
          </div>

          {/* Message and Points */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg text-white mb-1">{message}</p>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <CheckCircle size={16} />
              <span>
                Great! You now have{' '}
                <span className="font-bold">2,850 points</span>
              </span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-white hover:text-white/80 transition p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Bottom highlight */}
        <div className="h-1 bg-white/20" />
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default TokenEarnAlert;