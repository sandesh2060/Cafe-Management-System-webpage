// File: frontend/src/shared/components/SuccessAnimation.jsx
// ✅ FIXED: GREEN TICK ANIMATION + CELEBRATION
// ⏱️ Shows for 5 SECONDS
// 🎨 NO SPARKLES - Clean version

import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';

const SuccessAnimation = ({ isVisible, onComplete, message = "Order Placed Successfully!" }) => {
  const [show, setShow] = useState(false);
  const animationRef = useRef(null);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  useLayoutEffect(() => {
    if (show && animationRef.current) {
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            // ⏱️ Show for 5 seconds
            setTimeout(() => {
              handleClose();
            }, 5000); // ✅ 5 SECONDS
          }
        });

        // Overlay fade in
        tl.to('.success-overlay', {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });

        // Scale in the circle
        tl.fromTo('.success-circle',
          { scale: 0, opacity: 0 },
          { 
            scale: 1, 
            opacity: 1, 
            duration: 0.5,
            ease: 'back.out(2)'
          },
          '-=0.1'
        );

        // Draw checkmark
        tl.fromTo('.checkmark-path',
          { strokeDashoffset: 100 },
          { 
            strokeDashoffset: 0,
            duration: 0.6,
            ease: 'power2.out'
          },
          '-=0.2'
        );

        // Pulse effect (repeat more times for 5 second display)
        tl.to('.success-circle', {
          scale: 1.1,
          duration: 0.2,
          yoyo: true,
          repeat: 3, // More pulses for longer display
          ease: 'power2.inOut'
        });

        // Message fade in
        tl.fromTo('.success-message',
          { opacity: 0, y: 20 },
          { 
            opacity: 1, 
            y: 0,
            duration: 0.4,
            ease: 'power2.out'
          },
          '-=0.3'
        );
      });
    }
  }, [show]);

  const handleClose = () => {
    const overlay = document.querySelector('.success-overlay');
    if (overlay) {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          setShow(false);
          if (onComplete) onComplete();
        }
      });
    } else {
      setShow(false);
      if (onComplete) onComplete();
    }
  };

  if (!show) return null;

  return (
    <div 
      ref={animationRef}
      className="success-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0"
      onClick={handleClose}
    >
      <div 
        className="relative flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Circle with Checkmark */}
        <div className="success-circle relative">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" style={{ animationDuration: '1.5s' }}></div>
          
          {/* Main circle */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 shadow-2xl flex items-center justify-center">
            {/* Checkmark SVG */}
            <svg 
              className="w-20 h-20 sm:w-24 sm:h-24" 
              viewBox="0 0 52 52"
            >
              <circle 
                className="checkmark-circle"
                cx="26" 
                cy="26" 
                r="25" 
                fill="none" 
                stroke="white" 
                strokeWidth="2"
              />
              <path 
                className="checkmark-path"
                fill="none" 
                stroke="white" 
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="100"
                strokeDashoffset="100"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <div className="success-message mt-6 text-center opacity-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {message}
          </h2>
          <p className="text-white/80 text-sm sm:text-base">
            Your order is being prepared 🍽️
          </p>
        </div>

        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" style={{ animationDuration: '2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default SuccessAnimation;