// ================================================================
// FILE: frontend/src/modules/customer/components/ActiveOrderTracker.jsx
// 🎯 REDESIGNED VERSION - Warm Tea Shop Aesthetic
// ✅ Matches LoginPage & MenuPage style
// ✅ Beautiful animations and modern UI
//
// BUGS FIXED:
// ✅ areAllItemsServed() was checking item.status === 'served' on each
//    item individually — but your backend sets status at the ORDER level,
//    not per-item. So it was always returning false even when served.
//    Fix: 3-layer check — per-item first, then order-level, then explicit flag.
// ✅ calculateProgress() same issue — now falls back to order-level status.
// ================================================================

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  Clock,
  ChefHat,
  CheckCircle,
  Utensils,
  DollarSign,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// ORDER-LEVEL STATUS → PROGRESS %
// Used when items don't have individual statuses
// ─────────────────────────────────────────────────────────────────
const ORDER_STATUS_PROGRESS = {
  pending:   15,
  confirmed: 35,
  preparing: 65,
  ready:     90,
  served:    100,
  completed: 100,
};

const ActiveOrderTracker = ({ session, onPaymentClick }) => {
  const navigate = useNavigate();
  const progressBarRef = useRef(null);
  const itemsRef = useRef([]);
  const paymentBtnRef = useRef(null);
  const [showPayment, setShowPayment] = useState(false);

  const statusConfig = {
    pending: {
      label: 'Ordered',
      color: 'from-orange-500 to-orange-600',
      icon: Clock,
      emoji: '📝',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-300',
      dotColor: 'bg-orange-500',
    },
    confirmed: {
      label: 'Confirmed',
      color: 'from-blue-500 to-blue-600',
      icon: CheckCircle,
      emoji: '✅',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
      dotColor: 'bg-blue-500',
    },
    preparing: {
      label: 'Preparing',
      color: 'from-amber-500 to-orange-600',
      icon: ChefHat,
      emoji: '👨‍🍳',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-100',
      borderColor: 'border-amber-300',
      dotColor: 'bg-amber-500',
    },
    ready: {
      label: 'Ready',
      color: 'from-emerald-500 to-teal-600',
      icon: CheckCircle,
      emoji: '✅',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-100',
      borderColor: 'border-emerald-300',
      dotColor: 'bg-emerald-500',
    },
    served: {
      label: 'Served',
      color: 'from-teal-500 to-cyan-600',
      icon: Utensils,
      emoji: '🍽️',
      textColor: 'text-teal-700',
      bgColor: 'bg-teal-100',
      borderColor: 'border-teal-300',
      dotColor: 'bg-teal-500',
    },
  };

  // ── Progress calculation ────────────────────────────────────────
  // Layer 1: per-item statuses (ideal)
  // Layer 2: order-level status (your current backend)
  // Layer 3: explicit session flag
  const calculateProgress = () => {
    if (!session) return 0;

    // Layer 1: per-item statuses present and meaningful
    if (Array.isArray(session.items) && session.items.length > 0) {
      const hasItemStatuses = session.items.some(item => item.status);
      if (hasItemStatuses) {
        const servedCount = session.items.filter(
          item => item.status === 'served'
        ).length;
        return (servedCount / session.items.length) * 100;
      }
    }

    // Layer 2: order-level status
    const orderStatus = (
      session.status || session.orderStatus || ''
    ).toLowerCase();
    if (orderStatus && ORDER_STATUS_PROGRESS[orderStatus] !== undefined) {
      return ORDER_STATUS_PROGRESS[orderStatus];
    }

    return 0;
  };

  // ── All-items-served check ─────────────────────────────────────
  // Same 3-layer approach as above
  const areAllItemsServed = () => {
    if (!session) return false;

    // Layer 1: per-item statuses
    if (Array.isArray(session.items) && session.items.length > 0) {
      const hasItemStatuses = session.items.some(item => item.status);
      if (hasItemStatuses) {
        return session.items.every(item => item.status === 'served');
      }
    }

    // Layer 2: explicit backend flag
    if (typeof session.allItemsServed === 'boolean') {
      return session.allItemsServed;
    }

    // Layer 3: order-level status
    const orderStatus = (
      session.status || session.orderStatus || ''
    ).toLowerCase();
    return orderStatus === 'served';
  };

  const progress       = calculateProgress();
  const allItemsServed = areAllItemsServed();

  // Animate progress bar
  useEffect(() => {
    if (progressBarRef.current) {
      gsap.to(progressBarRef.current, {
        width: `${progress}%`,
        duration: 1.2,
        ease: 'power2.out',
      });
    }
  }, [progress]);

  // Animate items on status change
  useEffect(() => {
    if (itemsRef.current.length > 0) {
      itemsRef.current.forEach((item, index) => {
        if (item) {
          gsap.fromTo(
            item,
            { x: -20, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, delay: index * 0.1, ease: 'power3.out' }
          );
        }
      });
    }
  }, [session?.items]);

  // Show payment button when all items served
  useEffect(() => {
    if (allItemsServed && !showPayment) {
      setShowPayment(true);
      if (paymentBtnRef.current) {
        gsap.fromTo(
          paymentBtnRef.current,
          { scale: 0, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)', delay: 0.3 }
        );
      }
    } else if (!allItemsServed && showPayment) {
      setShowPayment(false);
    }
  }, [allItemsServed, showPayment]);

  const handlePaymentClick = () => {
    if (onPaymentClick) {
      onPaymentClick();
    } else {
      navigate('/customer/payment', {
        state: {
          orderId:     session._id || session.id,
          orderNumber: session.orderNumber,
          total:       session.totals?.total || session.total,
          items:       session.items,
        },
      });
    }
  };

  // ── Resolve item display status ─────────────────────────────────
  // If items don't have their own status, inherit the order status
  const resolveItemStatus = (item) => {
    if (item.status && statusConfig[item.status]) return item.status;
    const orderStatus = (session?.status || '').toLowerCase();
    return statusConfig[orderStatus] ? orderStatus : 'pending';
  };

  // ── No session guard ───────────────────────────────────────────
  if (!session) {
    return (
      <div className="bg-white rounded-[32px] p-8 shadow-2xl border-2 border-orange-200">
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 rounded-3xl flex items-center justify-center">
            <Utensils className="w-12 h-12 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Active Order</h3>
          <p className="text-gray-600 text-lg">Start ordering to see your items here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-2xl border-2 border-orange-200">

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8 pb-6 border-b-2 border-orange-100">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Your Order
          </h2>
          <p className="text-gray-600">Track your delicious items</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <span className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-bold rounded-2xl shadow-lg">
            Table {session.tableNumber}
          </span>
          <span className="px-5 py-2.5 bg-orange-100 text-orange-700 text-sm font-bold rounded-2xl border-2 border-orange-200">
            {session.items?.length || 0} items
          </span>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-gray-700">Order Progress</span>
          <span className="text-sm font-bold text-orange-600">
            {progress.toFixed(0)}% Complete
          </span>
        </div>
        <div className="h-4 bg-orange-100 rounded-full overflow-hidden relative shadow-inner border-2 border-orange-200">
          <div
            ref={progressBarRef}
            className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full relative shadow-lg"
            style={{ width: '0%' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          </div>
        </div>
        {progress === 100 && (
          <div className="mt-3 flex items-center justify-center gap-2 text-emerald-600 font-bold">
            <Sparkles className="w-5 h-5" />
            <span>All items served!</span>
            <Sparkles className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* ── Items List ── */}
      <div className="mb-8 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items</h3>
        {session.items && session.items.length > 0 ? (
          session.items.map((item, index) => {
            const resolvedStatus = resolveItemStatus(item);
            const status = statusConfig[resolvedStatus] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <div
                key={item._id || index}
                ref={el => itemsRef.current[index] = el}
                className="group flex gap-4 p-5 bg-orange-50 rounded-3xl border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-white rounded-2xl shadow-md text-4xl group-hover:scale-110 transition-transform">
                  {status.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 mb-2 text-lg truncate">
                    {item.name}
                  </h4>
                  <div className="flex flex-wrap gap-4 text-sm mb-2">
                    <span className="text-gray-600 font-semibold">Qty: {item.quantity}</span>
                    <span className="text-orange-600 font-bold">Rs. {item.subtotal?.toFixed(2)}</span>
                  </div>
                  {item.specialInstructions && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border-2 border-amber-200 rounded-xl mt-2">
                      <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 font-medium">{item.specialInstructions}</p>
                    </div>
                  )}
                </div>

                <div className={`flex flex-col items-center justify-center gap-2 px-4 py-3 ${status.bgColor} rounded-2xl border-2 ${status.borderColor} min-w-[100px]`}>
                  <StatusIcon className={`w-6 h-6 ${status.textColor}`} />
                  <span className={`text-xs font-bold ${status.textColor} uppercase tracking-wide`}>
                    {status.label}
                  </span>
                  <div className={`w-2 h-2 ${status.dotColor} rounded-full ${
                    resolvedStatus === 'preparing' ? 'animate-pulse' : ''
                  }`} />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center py-10 text-gray-500">No items in order</p>
        )}
      </div>

      {/* ── Totals ── */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-3xl mb-8 border-2 border-orange-200 shadow-lg">
        <div className="flex justify-between py-3 text-gray-700 font-semibold">
          <span>Subtotal:</span>
          <span>Rs. {(session.totals?.subtotal ?? session.subtotal)?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between py-3 text-gray-700 font-semibold">
          <span>Tax (13%):</span>
          <span>Rs. {(session.totals?.tax ?? session.tax)?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="flex justify-between pt-5 mt-4 border-t-2 border-orange-300 text-2xl font-bold">
          <span className="text-gray-900">Total:</span>
          <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Rs. {(session.totals?.total ?? session.total)?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>

      {/* ── Payment Section — shown when all items served ── */}
      {showPayment && allItemsServed && (
        <div ref={paymentBtnRef} className="pt-8 border-t-2 border-dashed border-orange-300">
          <div className="flex items-center justify-center gap-3 p-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl mb-6 shadow-2xl">
            <span className="text-4xl animate-bounce">✨</span>
            <div>
              <p className="font-bold text-lg">All items served!</p>
              <p className="text-sm text-white/90">Ready for payment</p>
            </div>
          </div>

          <button
            onClick={handlePaymentClick}
            className="w-full flex items-center justify-between gap-4 px-8 py-6 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-xl rounded-3xl shadow-2xl hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <DollarSign className="w-7 h-7" />
              </div>
              <span>Proceed to Payment</span>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <span className="text-2xl font-black px-5 py-2.5 bg-white/20 rounded-2xl backdrop-blur-sm">
                Rs. {(session.totals?.total ?? session.total)?.toFixed(2)}
              </span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      )}

      {/* ── Waiting message — only when not all served ── */}
      {!allItemsServed && progress > 0 && (
        <div className="flex items-center justify-center gap-3 p-5 bg-amber-50 border-2 border-amber-200 rounded-3xl text-amber-700 font-bold shadow-md">
          <ChefHat className="w-6 h-6 animate-pulse" />
          <div>
            <p className="text-base">Your order is being prepared...</p>
            <p className="text-sm text-amber-600 font-normal">Our chefs are working their magic ✨</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer { animation: shimmer 2s infinite; }
      `}</style>
    </div>
  );
};

export default ActiveOrderTracker;