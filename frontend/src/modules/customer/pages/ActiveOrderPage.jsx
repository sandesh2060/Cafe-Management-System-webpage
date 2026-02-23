// ================================================================
// FILE: frontend/src/modules/customer/pages/ActiveOrderPage.jsx
// 🎯 REDESIGNED VERSION - Warm Tea Shop Aesthetic
// ✅ Matches LoginPage & MenuPage style
// ✅ Both "Pay" and "Order More" shown when order is served
// ✅ Beautiful animations and modern UI
// ✅ Mobile-first responsive design
// ================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderSession } from '../hooks/useOrderSession';
import { useSplitBill } from '../hooks/useSplitBill';
import ActiveOrderTracker from '../components/ActiveOrderTracker';
import SplitBillModal from '../components/SplitBillModal';
import { toast } from 'react-toastify';
import { 
  RefreshCw, 
  Plus, 
  CreditCard, 
  MapPin, 
  Utensils, 
  DollarSign,
  Bell,
  ChefHat,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Coffee
} from 'lucide-react';
import gsap from 'gsap';

const ActiveOrderPage = ({ customerId, tableNumber }) => {
  const navigate = useNavigate();
  const {
    session,
    loading,
    error,
    canMakePayment,
    canAddItems,
    hasActiveOrder,
    refresh
  } = useOrderSession(customerId, tableNumber);

  const { submitSplitPayment, loading: paymentLoading } = useSplitBill();

  const [showSplitModal, setShowSplitModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refs for animations
  const headerRef = useRef(null);
  const trackerRef = useRef(null);
  const actionsRef = useRef(null);
  const statsRef = useRef(null);
  const helpRef = useRef(null);

  // Auto-refresh every 5 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Initial animations
  useEffect(() => {
    if (!loading && hasActiveOrder) {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (headerRef.current)
        tl.fromTo(headerRef.current, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 });
      if (trackerRef.current)
        tl.fromTo(trackerRef.current, { y: 40, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.8 }, "-=0.4");
      if (actionsRef.current)
        tl.fromTo(actionsRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.5");
      if (statsRef.current?.children)
        tl.fromTo(Array.from(statsRef.current.children), { y: 20, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 }, "-=0.4");
      if (helpRef.current)
        tl.fromTo(helpRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.3");
    }
  }, [loading, hasActiveOrder]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleAddMoreItems = () => {
    if (!canAddItems) {
      toast.warning('Cannot add items - order is being prepared', { icon: '⚠️' });
      return;
    }
    navigate('/menu', { state: { orderId: session?.orderId, addToExisting: true } });
  };

  const handleMakePayment = () => {
    if (!canMakePayment) {
      toast.warning('Please wait for all items to be served', { icon: '⏳' });
      return;
    }
    setShowSplitModal(true);
  };

  const handlePaymentConfirm = async (paymentData) => {
    try {
      const result = await submitSplitPayment({
        orderId: session.orderId,
        paymentMethod: paymentData.splits[0]?.method || 'cash',
        splitMode: paymentData.splitMode,
        splits: paymentData.splits,
        transactionDetails: {
          customerId,
          tableNumber,
          timestamp: new Date().toISOString()
        }
      });

      if (result.success) {
        setShowSplitModal(false);
        toast.success('Payment successful! Thank you! 🎉', { autoClose: 5000 });
        setTimeout(() => {
          navigate('/order-complete', { 
            state: { order: result.order, transactions: result.transactions } 
          });
        }, 2000);
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Payment failed. Please try again.');
    }
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (loading && !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
            <Coffee className="w-10 h-10 text-white" />
          </div>
          <div className="w-16 h-16 mx-auto border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          <p className="mt-6 text-lg font-bold text-gray-900">Loading your order...</p>
          <p className="text-sm text-gray-600 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-2xl border-2 border-red-200 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-3xl flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
            <button
              onClick={handleRefresh}
              className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-orange-500/50 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── No Active Order ──────────────────────────────────────────────
  if (!hasActiveOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-2xl border-2 border-orange-200 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl flex items-center justify-center">
              <Utensils className="w-12 h-12 text-orange-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">No Active Order</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">Start ordering by browsing our delicious menu</p>
            <button
              onClick={() => navigate('/menu')}
              className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-orange-500/50 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Sparkles className="w-5 h-5" />
              <span>Browse Menu</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Derive the action state ──────────────────────────────────────
  // canMakePayment = order is served / ready for payment
  // canAddItems    = order status allows adding more items
  // Both can be true simultaneously when order is served — show both buttons.
  const orderServed    = canMakePayment;          // Order is at the table
  const stillCooking  = !canMakePayment && !canAddItems; // Kitchen hasn't finished

  // ── Main Page ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-50">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b-2 border-orange-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div ref={headerRef} className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-11 h-11 sm:w-12 sm:h-12 bg-orange-100 hover:bg-orange-200 active:scale-95 rounded-2xl transition-all flex items-center justify-center shadow-md"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-orange-700" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Your Order</h1>
                <p className="text-xs sm:text-sm text-gray-600">Table {tableNumber}</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl hover:shadow-xl hover:shadow-orange-500/50 active:scale-95 transition-all flex items-center justify-center shadow-lg ${isRefreshing ? 'animate-spin' : ''}`}
              aria-label="Refresh"
            >
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ── Order Tracker ── */}
        <div ref={trackerRef} className="mb-6">
          <ActiveOrderTracker session={session} />
        </div>

        {/* ── Action Buttons ── */}
        <div ref={actionsRef} className="mb-6">

          {/* ── STATE A: Order served → show BOTH Pay and Order More ── */}
          {orderServed && (
            <div className="space-y-4">

              {/* "Served" banner */}
              <div className="flex items-center gap-4 p-5 bg-emerald-50 rounded-3xl border-2 border-emerald-200 shadow-lg">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-emerald-900 text-lg">Your order has been served! 🎉</p>
                  <p className="text-sm text-emerald-700">Enjoy your meal or add more items below</p>
                </div>
              </div>

              {/* Pay + Order More side by side (stacked on small screens) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Make Payment — primary CTA */}
                <button
                  onClick={handleMakePayment}
                  disabled={paymentLoading}
                  className={`group relative px-6 py-5 rounded-3xl transition-all shadow-lg hover:shadow-2xl overflow-hidden ${
                    paymentLoading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-orange-500/50 active:scale-95'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                      <CreditCard className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-white text-lg">
                        {paymentLoading ? 'Processing...' : 'Pay Now'}
                      </p>
                      <p className="text-sm text-white/90">
                        Rs. {session?.totals?.total?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Order More — secondary CTA */}
                <button
                  onClick={handleAddMoreItems}
                  className="group relative px-6 py-5 bg-white hover:bg-orange-50 active:scale-95 rounded-3xl border-2 border-orange-200 hover:border-orange-400 transition-all shadow-lg hover:shadow-xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                      <Plus className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-gray-900 text-lg">Order More</p>
                      <p className="text-sm text-gray-600">Add more items</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── STATE B: Still cooking → neither button, waiting message ── */}
          {stillCooking && (
            <div className="p-6 bg-amber-50 rounded-3xl border-2 border-amber-200 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center animate-pulse flex-shrink-0">
                  <ChefHat className="w-7 h-7 text-amber-700" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-amber-900 text-lg mb-1">Preparing Your Order</p>
                  <p className="text-sm text-amber-700">Please wait while our chef works their magic...</p>
                </div>
              </div>
            </div>
          )}

          {/* ── STATE C: Can add items but not yet served ── */}
          {canAddItems && !orderServed && (
            <button
              onClick={handleAddMoreItems}
              className="group relative w-full px-6 py-5 bg-white hover:bg-orange-50 active:scale-95 rounded-3xl border-2 border-orange-200 hover:border-orange-400 transition-all shadow-lg hover:shadow-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-900 text-lg">Add More Items</p>
                  <p className="text-sm text-gray-600">Browse menu &amp; add</p>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* ── Order Stats ── */}
        <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-3xl p-6 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-7 h-7 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-1">Table Number</p>
                <p className="text-2xl font-bold text-gray-900">{tableNumber}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Utensils className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{session?.items?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-7 h-7 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs. {session?.totals?.total?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Help Section ── */}
        <div ref={helpRef} className="bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl p-6 border-2 border-orange-200 shadow-lg text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Bell className="w-6 h-6 text-orange-600" />
            <p className="text-lg font-bold text-gray-900">Need Assistance?</p>
          </div>
          <p className="text-gray-700 mb-4">Our staff is ready to help you</p>
          <button
            onClick={() => toast.info('Waiter has been notified! 🔔')}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-orange-500/50 active:scale-95 transition-all"
          >
            Call Waiter
          </button>
        </div>
      </main>

      {/* ── Split Bill Modal ── */}
      {showSplitModal && (
        <SplitBillModal
          isOpen={showSplitModal}
          onClose={() => setShowSplitModal(false)}
          onConfirm={handlePaymentConfirm}
          total={session?.totals?.total || 0}
          orderId={session?.orderId}
        />
      )}
    </div>
  );
};

export default ActiveOrderPage;