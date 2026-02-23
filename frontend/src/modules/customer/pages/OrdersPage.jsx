// File: frontend/src/modules/customer/pages/OrdersPage.jsx
// 🎯 PRODUCTION-PERFECT Orders Page with Current Order + History Toggle
// ✅ Real-time updates, waiter assignment, beautiful animations

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  ChefHat, 
  CheckCircle, 
  Bell, 
  Package, 
  RefreshCw,
  Calendar,
  DollarSign,
  Sparkles,
  AlertCircle,
  User,
  Phone,
  MessageSquare,
  TrendingUp,
  History,
  Zap,
  Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useCurrentOrder } from '../hooks/useCurrentOrder';
import { useOrders } from '../hooks/useOrders';
import gsap from 'gsap';

const OrdersPage = () => {
  const navigate = useNavigate();
  
  // Hooks
  const { 
    currentOrder,
    loading: currentLoading,
    refreshing: currentRefreshing,
    error: currentError,
    progress,
    estimatedTime,
    statusInfo,
    hasActiveOrder,
    refresh: refreshCurrent,
  } = useCurrentOrder();
  
  const { 
    orders, 
    loading: historyLoading, 
    error: historyError, 
    fetchOrders,
    getOrderStats 
  } = useOrders();
  
  // Local state
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'history'
  const [filter, setFilter] = useState('all'); // all, completed, cancelled
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  const headerRef = useRef(null);
  const tabsRef = useRef(null);
  const contentRef = useRef(null);

  // Get session data
  const session = JSON.parse(localStorage.getItem('customerSession') || '{}');

  /**
   * Auto-switch to current tab if active order exists
   */
  useEffect(() => {
    if (hasActiveOrder && activeTab === 'history') {
      setActiveTab('current');
    }
  }, [hasActiveOrder]);

  /**
   * Manual refresh
   */
  const handleRefresh = async () => {
    if (activeTab === 'current') {
      refreshCurrent();
    } else {
      await fetchOrders();
    }
    toast.success('Orders refreshed!', { autoClose: 2000 });
  };

  /**
   * Get status color and styling
   */
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      'confirmed': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'preparing': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'ready': 'bg-green-500/10 text-green-600 border-green-500/20',
      'served': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
      'completed': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      'cancelled': 'bg-red-500/10 text-red-600 border-red-500/20',
    };
    return colors[status?.toLowerCase()] || colors['pending'];
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status) => {
    const icons = {
      'pending': '⏳',
      'confirmed': '✅',
      'preparing': '👨‍🍳',
      'ready': '🔔',
      'served': '🍽️',
      'completed': '✨',
      'cancelled': '❌',
    };
    return icons[status?.toLowerCase()] || '📋';
  };

  /**
   * Get status progress steps
   */
  const getStatusSteps = (currentStatus) => {
    const steps = [
      { id: 'pending', label: 'Order Placed', icon: Package },
      { id: 'confirmed', label: 'Confirmed', icon: CheckCircle },
      { id: 'preparing', label: 'Preparing', icon: ChefHat },
      { id: 'ready', label: 'Ready', icon: Bell },
      { id: 'served', label: 'Served', icon: TrendingUp }
    ];
    
    const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus?.toLowerCase());
    
    return steps.map((step, index) => ({
      ...step,
      completed: index < currentIndex,
      active: statusOrder[currentIndex] === step.id
    }));
  };

  /**
   * Filter orders based on selected filter
   */
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'completed') return order.status === 'completed';
    if (filter === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  /**
   * Get order statistics
   */
  const stats = getOrderStats();

  /**
   * Initial animations
   */
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
        });
      }

      if (tabsRef.current) {
        gsap.from(tabsRef.current.children, {
          scale: 0.8,
          opacity: 0,
          duration: 0.4,
          stagger: 0.1,
          delay: 0.2,
          ease: 'back.out(1.5)',
        });
      }
    });

    return () => ctx.revert();
  }, []);

  /**
   * Tab change animation
   */
  useEffect(() => {
    if (contentRef.current) {
      gsap.from(contentRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  }, [activeTab, filter]);

  /**
   * Navigate to order details
   */
  const viewOrderDetails = (orderId) => {
    navigate(`/customer/orders/${orderId}`);
  };

  // ============================================
  // RENDER: CURRENT ORDER TAB
  // ============================================
  const renderCurrentOrder = () => {
    // Loading state
    if (currentLoading) {
      return (
        <div className="space-y-4">
          <div className="bg-bg-elevated rounded-3xl p-6 animate-pulse border border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-bg-tertiary rounded-full" />
              <div className="flex-1">
                <div className="h-6 bg-bg-tertiary rounded w-32 mb-2" />
                <div className="h-4 bg-bg-tertiary rounded w-48" />
              </div>
            </div>
            <div className="h-2 bg-bg-tertiary rounded-full mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-bg-tertiary rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Error state
    if (currentError) {
      return (
        <div className="text-center py-16 bg-bg-elevated rounded-3xl border border-error/20">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-text-primary mb-2">Failed to Load</h3>
          <p className="text-text-secondary mb-6">{currentError}</p>
          <button
            onClick={refreshCurrent}
            className="px-6 py-3 bg-gradient-to-r from-brand to-secondary text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
      );
    }

    // No active order
    if (!hasActiveOrder || !currentOrder) {
      return (
        <div className="text-center py-20 bg-bg-elevated rounded-3xl border border-border">
          <div className="w-20 h-20 bg-bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-text-tertiary" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">No Active Order</h3>
          <p className="text-text-secondary mb-6">Start ordering to track your food here!</p>
          <button
            onClick={() => navigate('/customer/menu')}
            className="px-8 py-3 bg-gradient-to-r from-brand to-secondary text-white font-semibold rounded-2xl hover:shadow-lg transition-all"
          >
            Browse Menu
          </button>
        </div>
      );
    }

    // Active order display
    const statusSteps = getStatusSteps(currentOrder.status);

    return (
      <div className="space-y-4">
        {/* Status Card */}
        <div className="bg-gradient-to-br from-brand/5 via-secondary/5 to-accent/5 rounded-3xl border border-border overflow-hidden shadow-custom-xl">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-16 h-16 ${statusInfo?.bgColor || 'bg-brand/10'} rounded-2xl flex items-center justify-center text-4xl shadow-custom-md ${statusInfo?.pulse ? 'animate-pulse' : ''}`}>
                {statusInfo?.icon || '🍽️'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className={`text-2xl font-bold ${statusInfo?.color || 'text-brand'}`}>
                    {statusInfo?.label || 'In Progress'}
                  </h2>
                  <span className="px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-full animate-pulse border border-success/20">
                    LIVE
                  </span>
                </div>
                <p className="text-text-secondary text-sm mb-2">
                  {statusInfo?.message || 'Your order is being processed'}
                </p>
                <p className="text-xs text-text-tertiary">
                  Order #{currentOrder.orderNumber}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-text-secondary">Progress</span>
                <span className="text-sm font-bold text-brand">{progress}%</span>
              </div>
              <div className="relative h-3 bg-bg-tertiary rounded-full overflow-hidden shadow-inner">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand to-secondary rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>

            {/* Estimated Time */}
            {estimatedTime > 0 && (
              <div className="flex items-center justify-center gap-2 p-4 bg-warning/10 rounded-xl border border-warning/20 mb-6">
                <Clock className="w-5 h-5 text-warning" />
                <p className="text-sm font-bold text-warning">
                  Estimated time: {estimatedTime} minutes
                </p>
              </div>
            )}

            {/* Timeline Steps */}
            <div className="space-y-3">
              {statusSteps.map((step, idx) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      step.completed 
                        ? 'bg-success border-success text-white scale-110'
                        : step.active
                        ? 'bg-brand border-brand text-white scale-110 animate-pulse'
                        : 'bg-bg-secondary border-border text-text-tertiary'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        step.completed || step.active ? 'text-text-primary' : 'text-text-tertiary'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                    {step.active && (
                      <Zap className="w-4 h-4 text-warning animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Waiter Info (if assigned) */}
          {currentOrder.assignedWaiter && (
            <div className="px-6 pb-6">
              <div className="p-4 bg-bg-elevated rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand to-secondary rounded-full flex items-center justify-center text-white">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-text-tertiary mb-1">Your Waiter</p>
                    <p className="font-bold text-text-primary">
                      {currentOrder.assignedWaiter.name || 'Staff Member'}
                    </p>
                  </div>
                  <button 
                    className="p-2 bg-brand/10 hover:bg-brand/20 rounded-lg transition-colors"
                    onClick={() => toast.info('Calling waiter...')}
                  >
                    <Phone className="w-5 h-5 text-brand" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-bg-elevated rounded-3xl border border-border overflow-hidden shadow-custom-lg">
          <div className="p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand" />
              Order Items ({currentOrder.items?.length || 0})
            </h3>

            <div className="space-y-3">
              {currentOrder.items?.map((item, index) => (
                <div
                  key={item._id || index}
                  className="flex gap-3 p-3 bg-bg-secondary rounded-xl border border-border hover:border-brand/30 transition-colors"
                >
                  <div className="w-16 h-16 bg-bg-tertiary rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.menuItemId?.image || item.image || '/placeholder-food.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = '/placeholder-food.jpg'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-text-primary truncate">{item.name}</h4>
                    <p className="text-sm text-text-secondary">Qty: {item.quantity}</p>
                    {item.specialInstructions && (
                      <p className="text-xs text-info mt-1 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {item.specialInstructions}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-brand">
                      ${((item.price || 0) * item.quantity).toFixed(2)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-text-tertiary">
                        ${(item.price || 0).toFixed(2)} each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-text-secondary">Total</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">
                  ${currentOrder.total?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => viewOrderDetails(currentOrder._id || currentOrder.id)}
            className="flex items-center justify-center gap-2 px-5 py-4 bg-bg-elevated border-2 border-border text-text-primary font-bold rounded-xl hover:bg-bg-secondary active:scale-95 transition-all"
          >
            <Eye className="w-5 h-5" />
            View Details
          </button>
          <button
            onClick={() => toast.info('Support chat opening...')}
            className="flex items-center justify-center gap-2 px-5 py-4 bg-gradient-to-r from-brand to-secondary text-white font-bold rounded-xl shadow-custom-md hover:shadow-custom-lg active:scale-95 transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            Need Help?
          </button>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER: ORDER HISTORY TAB
  // ============================================
  const renderOrderHistory = () => {
    // Loading state
    if (historyLoading && orders.length === 0) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-bg-elevated rounded-3xl p-6 animate-pulse border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-bg-tertiary rounded w-32" />
                <div className="h-8 bg-bg-tertiary rounded-full w-24" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-bg-tertiary rounded w-3/4" />
                <div className="h-4 bg-bg-tertiary rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Error state
    if (historyError && orders.length === 0) {
      return (
        <div className="text-center py-16 bg-bg-elevated rounded-3xl border border-error/20">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-text-primary mb-2">Failed to Load History</h3>
          <p className="text-text-secondary mb-6">{historyError}</p>
          <button
            onClick={fetchOrders}
            className="px-6 py-3 bg-gradient-to-r from-brand to-secondary text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
      );
    }

    // No orders
    if (filteredOrders.length === 0) {
      return (
        <div className="text-center py-20 bg-bg-elevated rounded-3xl border border-border">
          <div className="w-20 h-20 bg-bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <History className="w-10 h-10 text-text-tertiary" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">
            {filter === 'all' ? 'No Order History' : `No ${filter} Orders`}
          </h3>
          <p className="text-text-secondary mb-6">
            {filter === 'all' 
              ? 'Your past orders will appear here' 
              : `You don't have any ${filter} orders yet`}
          </p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="px-6 py-3 bg-brand/10 text-brand font-semibold rounded-xl hover:bg-brand/20 transition-all"
            >
              View All Orders
            </button>
          )}
        </div>
      );
    }

    // Orders list
    return (
      <div className="space-y-4">
        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { value: 'all', label: `All (${orders.length})` },
            { value: 'completed', label: `Completed (${orders.filter(o => o.status === 'completed').length})` },
            { value: 'cancelled', label: `Cancelled (${orders.filter(o => o.status === 'cancelled').length})` }
          ].map(filterOption => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                filter === filterOption.value
                  ? 'bg-gradient-to-r from-brand to-secondary text-white shadow-lg scale-105'
                  : 'bg-bg-elevated text-text-secondary hover:bg-bg-secondary border border-border'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {filteredOrders.map(order => (
          <div
            key={order.id}
            className="bg-bg-elevated rounded-3xl border border-border overflow-hidden shadow-custom-md hover:shadow-custom-xl transition-all group"
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-text-primary">
                      Order #{order.orderNumber}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-tertiary">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(order.createdAt).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-xl font-semibold text-sm border-2 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)} {order.status}
                </span>
              </div>

              {/* Items Preview */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-4">
                {order.items?.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex-shrink-0 px-3 py-1.5 bg-bg-secondary rounded-lg text-xs font-medium text-text-secondary">
                    {item.quantity}x {item.name}
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <div className="flex-shrink-0 px-3 py-1.5 bg-brand/10 rounded-lg text-xs font-bold text-brand">
                    +{order.items.length - 3} more
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-brand">${order.total?.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => viewOrderDetails(order.id)}
                  className="px-5 py-2.5 bg-brand/10 hover:bg-brand text-brand hover:text-white font-semibold rounded-xl transition-all group-hover:scale-105"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Header */}
      <header 
        ref={headerRef}
        className="sticky top-0 z-40 bg-bg-elevated/95 backdrop-blur-xl border-b border-border shadow-sm"
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/customer/menu')}
                className="w-10 h-10 bg-bg-secondary hover:bg-bg-tertiary rounded-xl flex items-center justify-center transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-text-primary" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">
                  My Orders
                </h1>
                <p className="text-sm text-text-tertiary">
                  {hasActiveOrder ? 'Track your food in real-time' : 'View your order history'}
                </p>
              </div>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={currentRefreshing}
              className="p-2.5 bg-bg-secondary hover:bg-brand/10 rounded-xl transition-all disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-brand ${currentRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Statistics Cards */}
        {stats.totalOrders > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-4 bg-bg-elevated rounded-2xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-brand" />
                <span className="text-xs font-medium text-text-tertiary">Total</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{stats.totalOrders}</p>
            </div>

            <div className="p-4 bg-bg-elevated rounded-2xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-xs font-medium text-text-tertiary">Done</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{stats.completedOrders}</p>
            </div>

            <div className="p-4 bg-bg-elevated rounded-2xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-warning" />
                <span className="text-xs font-medium text-text-tertiary">Active</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{stats.activeOrders}</p>
            </div>

            <div className="p-4 bg-bg-elevated rounded-2xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-brand" />
                <span className="text-xs font-medium text-text-tertiary">Spent</span>
              </div>
              <p className="text-2xl font-bold text-brand">${stats.totalSpent}</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div ref={tabsRef} className="flex items-center gap-2 mb-6 p-1 bg-bg-elevated rounded-2xl border border-border shadow-sm">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 px-5 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'current'
                ? 'bg-gradient-to-r from-brand to-secondary text-white shadow-lg'
                : 'text-text-secondary hover:bg-bg-secondary'
            }`}
          >
            <Zap className="w-4 h-4" />
            Current Order
            {hasActiveOrder && (
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-5 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-brand to-secondary text-white shadow-lg'
                : 'text-text-secondary hover:bg-bg-secondary'
            }`}
          >
            <History className="w-4 h-4" />
            History
            {orders.length > 0 && (
              <span className="px-2 py-0.5 bg-brand/20 text-xs rounded-full">
                {orders.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div ref={contentRef}>
          {activeTab === 'current' ? renderCurrentOrder() : renderOrderHistory()}
        </div>
      </main>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default OrdersPage;