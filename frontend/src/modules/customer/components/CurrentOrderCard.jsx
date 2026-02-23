// File: frontend/src/modules/customer/components/CurrentOrderCard.jsx
// 🎯 MINIMAL & PRO - Compact order progress card
// ✅ Just progress bar + icon to view order details
// ✅ Pay Now → PaymentPage | Order More → Menu (scrolls to items)

import { useNavigate } from 'react-router-dom';
import { ChevronRight, Clock, AlertCircle, CreditCard, Plus } from 'lucide-react';

const CurrentOrderCard = ({ 
  order, 
  statusInfo, 
  progress, 
  estimatedTime,
  loading,
  error,
  // Optional overrides from parent
  onPayClick,
  onOrderMoreClick,
}) => {
  const navigate = useNavigate();

  const isServed = progress >= 100;

  const handleCardClick = () => {
    if (order?._id) navigate(`/customer/orders/${order._id}`);
  };

  const handlePayClick = (e) => {
    e.stopPropagation();
    if (onPayClick) {
      onPayClick();
      return;
    }
    // Go to PaymentPage with all required state
    navigate('/customer/payment', {
      state: {
        orderId:     order?._id,
        orderNumber: order?.orderNumber,
        total:       order?.totals?.total ?? order?.total ?? 0,
        items:       order?.items ?? [],
      }
    });
  };

  const handleOrderMoreClick = (e) => {
    e.stopPropagation();
    if (onOrderMoreClick) {
      onOrderMoreClick();
      return;
    }
    // Go to menu page; MenuPage reads scrollToMenu from location.state
    navigate('/customer/menu', {
      state: { 
        orderId:       order?._id, 
        addToExisting: true,
        scrollToMenu:  true,
      }
    });
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mb-4 bg-bg-elevated rounded-2xl shadow-lg border border-border overflow-hidden animate-pulse">
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-bg-tertiary rounded-full" />
          <div className="flex-1">
            <div className="h-3 w-32 bg-bg-tertiary rounded mb-2" />
            <div className="h-2 bg-bg-tertiary rounded-full" />
          </div>
          <div className="w-6 h-6 bg-bg-tertiary rounded-full" />
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="mb-4 bg-error/5 rounded-2xl shadow-lg border border-error/20 overflow-hidden">
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-error" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-error truncate">Order Update Failed</p>
            <p className="text-xs text-text-tertiary truncate">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── No order ─────────────────────────────────────────────────────
  if (!order) return null;

  // ── Main card ────────────────────────────────────────────────────
  return (
    <div className="mb-4 rounded-2xl shadow-lg border border-border overflow-hidden bg-gradient-to-r from-bg-elevated to-bg-secondary">

      {/* ── Clickable top row ── */}
      <div
        onClick={handleCardClick}
        className="p-4 flex items-center gap-4 cursor-pointer group hover:bg-white/5 active:scale-[0.99] transition-all duration-200"
      >
        {/* Status icon */}
        <div
          className={`w-12 h-12 ${statusInfo?.bgColor || 'bg-brand/10'} rounded-full flex items-center justify-center flex-shrink-0 text-2xl shadow-md group-hover:scale-110 transition-transform ${
            statusInfo?.pulse && !isServed ? 'animate-pulse' : ''
          }`}
        >
          {isServed ? '🎉' : (statusInfo?.icon || '🍽️')}
        </div>

        {/* Progress info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-sm font-bold text-text-primary truncate">
                Order {order.orderNumber}
              </h3>
              <span className={`text-xs font-semibold truncate ${isServed ? 'text-emerald-500' : (statusInfo?.color || 'text-brand')}`}>
                {isServed ? 'Served ✓' : (statusInfo?.label || 'In Progress')}
              </span>
            </div>
            <span className={`text-xs font-bold flex-shrink-0 ml-2 ${isServed ? 'text-emerald-500' : 'text-brand'}`}>
              {progress}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-bg-tertiary rounded-full overflow-hidden shadow-inner">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                isServed
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  : 'bg-gradient-to-r from-brand to-secondary'
              }`}
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* Sub-label */}
          {isServed ? (
            <p className="text-xs text-emerald-500 font-semibold mt-1.5">
              ✨ Ready! Pay now or keep ordering
            </p>
          ) : estimatedTime > 0 ? (
            <div className="flex items-center gap-1 mt-1.5">
              <Clock className="w-3 h-3 text-text-tertiary" />
              <p className="text-xs text-text-tertiary">~{estimatedTime} min remaining</p>
            </div>
          ) : null}
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-brand/10 rounded-full flex items-center justify-center group-hover:bg-brand group-hover:scale-110 transition-all">
            <ChevronRight className="w-4 h-4 text-brand group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>

      {/* ── Pay + Order More — only when served ── */}
      {isServed && (
        <div className="px-4 pb-4 grid grid-cols-2 gap-3">

          {/* Pay Now → PaymentPage */}
          <button
            onClick={handlePayClick}
            className="group relative flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.97] transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            <CreditCard className="w-4 h-4 flex-shrink-0" />
            <span>Pay Now</span>
          </button>

          {/* Order More → Menu (scrolls to items) */}
          <button
            onClick={handleOrderMoreClick}
            className="group relative flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-orange-50 text-gray-800 font-bold text-sm rounded-xl border-2 border-orange-300 hover:border-orange-500 shadow-md hover:shadow-lg active:scale-[0.97] transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-100/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            <Plus className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span>Order More</span>
          </button>
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

export default CurrentOrderCard;