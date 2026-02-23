// ================================================================
// FILE: frontend/src/modules/customer/pages/PaymentSuccessPage.jsx
// PAYMENT SUCCESS PAGE
// ================================================================

import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Home, Receipt } from 'lucide-react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = useRef(null);

  const { orderId, orderNumber, total, method } = location.state || {};

  // Confetti celebration
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#8b5cf6', '#10b981']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#8b5cf6', '#10b981']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  // Entrance animation
  useEffect(() => {
    if (contentRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.success-icon', {
          scale: 0,
          rotation: -180,
          duration: 0.8,
          ease: 'back.out(1.7)'
        });

        gsap.from('.success-content > *', {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.3
        });
      }, contentRef);

      return () => ctx.revert();
    }
  }, []);

  // Redirect if no order data
  useEffect(() => {
    if (!orderId || !total) {
      navigate('/customer/menu');
    }
  }, [orderId, total, navigate]);

  const paymentMethodNames = {
    esewa: 'eSewa',
    khalti: 'Khalti',
    mobile_banking: 'Mobile Banking',
    cash: 'Cash'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
      <div ref={contentRef} className="max-w-md w-full">
        {/* Success Icon */}
        <div className="success-icon w-32 h-32 bg-gradient-to-br from-success to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <CheckCircle className="w-20 h-20 text-white" />
        </div>

        {/* Content */}
        <div className="success-content bg-white rounded-3xl shadow-2xl p-8 border border-border">
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-success to-emerald-600 bg-clip-text text-transparent">
            Payment Successful!
          </h1>
          
          <p className="text-center text-text-secondary mb-8">
            Thank you for your payment. Your order is complete!
          </p>

          {/* Order Details */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-4 bg-bg-secondary rounded-xl">
              <span className="text-text-tertiary">Order Number</span>
              <span className="font-bold text-text-primary">#{orderNumber}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-bg-secondary rounded-xl">
              <span className="text-text-tertiary">Payment Method</span>
              <span className="font-semibold text-text-primary">
                {paymentMethodNames[method] || method}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-brand/10 to-secondary/10 rounded-xl border-2 border-brand/20">
              <span className="text-text-secondary font-semibold">Total Paid</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">
                Rs. {total.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-bg-secondary rounded-xl">
              <span className="text-text-tertiary">Date & Time</span>
              <span className="font-semibold text-text-primary text-sm">
                {new Date().toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/customer/menu')}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-bg-elevated border-2 border-border text-text-primary font-bold rounded-xl hover:bg-bg-secondary active:scale-95 transition-all"
            >
              <Home className="w-5 h-5" />
              Home
            </button>

            <button
              onClick={() => navigate('/customer/orders')}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-brand to-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              <Receipt className="w-5 h-5" />
              My Orders
            </button>
          </div>

          {/* Thank You Message */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-tertiary">
              🎉 Enjoy your meal! Thank you for dining with us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;