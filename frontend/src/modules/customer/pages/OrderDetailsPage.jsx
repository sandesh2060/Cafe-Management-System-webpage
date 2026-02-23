// File: frontend/src/modules/customer/pages/OrderDetailsPage.jsx
// 🎯 ORDER DETAILS PAGE - Complete order tracking and information
// ✅ Real-time status updates, timeline, items list, and actions
// 🌓 THEME-AWARE - Supports light and dark modes

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader as LoaderIcon,
  RefreshCw,
  Calendar,
  MessageSquare,
  Timer,
} from 'lucide-react';
import axios from '@/shared/utils/api';
import { toast } from 'react-toastify';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch order details
  const fetchOrderDetails = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);
      
      setError(null);

      const response = await axios.get(`/orders/${orderId}`);
      
      if (response.data.success) {
        setOrder(response.data.data || response.data.order);
      } else {
        throw new Error(response.data.message || 'Failed to fetch order');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load order details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Auto-refresh every 10 seconds for active orders
  useEffect(() => {
    if (!order) return;
    
    const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready'];
    if (activeStatuses.includes(order.status?.toLowerCase())) {
      const interval = setInterval(() => {
        fetchOrderDetails(false);
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [order]);

  // Get status info
  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': {
        icon: '⏳',
        label: 'Order Placed',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        message: 'Your order has been received',
        progress: 25
      },
      'confirmed': {
        icon: '✅',
        label: 'Confirmed',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        message: 'Order confirmed by restaurant',
        progress: 40
      },
      'preparing': {
        icon: '👨‍🍳',
        label: 'Preparing',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        message: 'Chef is preparing your order',
        progress: 65
      },
      'ready': {
        icon: '🔔',
        label: 'Ready',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        message: 'Your order is ready!',
        progress: 90
      },
      'served': {
        icon: '🍽️',
        label: 'Served',
        color: 'text-green-600',
        bgColor: 'bg-green-600/10',
        borderColor: 'border-green-600/20',
        message: 'Order has been served',
        progress: 100
      },
      'completed': {
        icon: '✨',
        label: 'Completed',
        color: 'text-green-700',
        bgColor: 'bg-green-700/10',
        borderColor: 'border-green-700/20',
        message: 'Order completed',
        progress: 100
      },
      'cancelled': {
        icon: '❌',
        label: 'Cancelled',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        message: 'Order was cancelled',
        progress: 0
      }
    };

    return statusMap[status?.toLowerCase()] || statusMap.pending;
  };

  const statusInfo = order ? getStatusInfo(order.status) : null;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-bg-tertiary rounded-full animate-pulse" />
            <div className="h-8 w-48 bg-bg-tertiary rounded animate-pulse" />
          </div>

          {/* Status Card Skeleton */}
          <div className="bg-bg-elevated rounded-2xl p-6 mb-4 animate-pulse border border-border">
            <div className="h-6 w-32 bg-bg-tertiary rounded mb-4" />
            <div className="h-2 bg-bg-tertiary rounded-full" />
          </div>

          {/* Items Skeleton */}
          <div className="bg-bg-elevated rounded-2xl p-6 animate-pulse border border-border">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 mb-4">
                <div className="w-16 h-16 bg-bg-tertiary rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-bg-tertiary rounded mb-2" />
                  <div className="h-3 w-24 bg-bg-tertiary rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-bg-primary p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-bg-elevated backdrop-blur-lg rounded-2xl p-8 text-center border border-border shadow-custom-xl">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Order Not Found</h2>
          <p className="text-text-secondary mb-6">{error || 'Could not load order details'}</p>
          <button
            onClick={() => navigate('/customer/orders')}
            className="w-full px-6 py-3 bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const session = JSON.parse(localStorage.getItem('customerSession') || '{}');

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-2xl mx-auto p-4 pb-20">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/customer/menu')}
            className="flex items-center gap-2 px-4 py-2 bg-bg-elevated hover:bg-bg-secondary backdrop-blur-sm rounded-xl text-text-primary transition-colors border border-border shadow-custom-md"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Menu</span>
          </button>

          <button
            onClick={() => fetchOrderDetails(false)}
            disabled={refreshing}
            className="p-2 bg-bg-elevated hover:bg-bg-secondary backdrop-blur-sm rounded-xl text-text-primary transition-colors disabled:opacity-50 border border-border shadow-custom-md"
            aria-label="Refresh order"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Order Number */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Order #{order.orderNumber || orderId.slice(-6)}
          </h1>
          <div className="flex items-center gap-4 text-text-secondary text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Table {session.tableNumber || order.tableNumber || 'N/A'}
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-bg-elevated backdrop-blur-lg rounded-2xl border border-border overflow-hidden mb-4 shadow-custom-lg">
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-14 h-14 ${statusInfo.bgColor} rounded-2xl flex items-center justify-center text-3xl shadow-custom-md border ${statusInfo.borderColor}`}>
                {statusInfo.icon}
              </div>
              <div className="flex-1">
                <h2 className={`text-xl font-bold ${statusInfo.color} mb-1`}>
                  {statusInfo.label}
                </h2>
                <p className="text-text-secondary text-sm">
                  {statusInfo.message}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-bg-tertiary rounded-full overflow-hidden shadow-inner">
              <div
                className={`absolute inset-y-0 left-0 ${statusInfo.bgColor.replace('/10', '')} rounded-full transition-all duration-700`}
                style={{ width: `${statusInfo.progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="px-6 pb-6">
            <div className="space-y-3">
              {['pending', 'confirmed', 'preparing', 'ready', 'served'].map((status) => {
                const info = getStatusInfo(status);
                const isCurrent = order.status?.toLowerCase() === status;
                const isPast = statusInfo.progress > info.progress;
                const isActive = isCurrent || isPast;

                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      isActive 
                        ? `${info.bgColor} ${info.borderColor}` 
                        : 'bg-bg-secondary border-border'
                    }`}>
                      {isPast ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : isCurrent ? (
                        <LoaderIcon className="w-5 h-5 text-warning animate-spin" />
                      ) : (
                        <div className="w-2 h-2 bg-text-tertiary rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-text-primary' : 'text-text-tertiary'
                      }`}>
                        {info.label}
                      </p>
                    </div>
                    {isCurrent && (
                      <Timer className="w-4 h-4 text-warning animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-bg-elevated backdrop-blur-lg rounded-2xl border border-border overflow-hidden mb-4 shadow-custom-lg">
          <div className="p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand" />
              Order Items ({order.items?.length || 0})
            </h3>

            <div className="space-y-3">
              {order.items?.map((item, index) => {
                const menuItem = item.menuItemId || {};
                return (
                  <div
                    key={item._id || index}
                    className="flex gap-3 p-3 bg-bg-secondary rounded-xl border border-border hover:border-brand/30 transition-colors shadow-custom-sm"
                  >
                    <div className="w-16 h-16 bg-bg-tertiary rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={menuItem.image || '/placeholder-food.jpg'}
                        alt={item.name || menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-text-primary truncate">
                        {item.name || menuItem.name}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        Qty: {item.quantity}
                      </p>
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
                );
              })}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-text-secondary">Total</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">
                  ${order.total?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-bg-elevated backdrop-blur-lg rounded-2xl border border-border overflow-hidden p-6 shadow-custom-lg">
          <h3 className="text-lg font-bold text-text-primary mb-4">Order Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2">
              <span className="text-text-secondary">Payment Status</span>
              <span className={`font-semibold px-3 py-1 rounded-full ${
                order.paymentStatus === 'paid' 
                  ? 'bg-success/10 text-success' 
                  : 'bg-warning/10 text-warning'
              }`}>
                {order.paymentStatus || 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-text-secondary">Payment Method</span>
              <span className="font-semibold text-text-primary">
                {order.paymentMethod || 'Cash'}
              </span>
            </div>
            {order.specialInstructions && (
              <div className="pt-3 border-t border-border">
                <span className="text-text-secondary block mb-1">Special Instructions</span>
                <p className="text-text-primary bg-bg-secondary p-3 rounded-lg border border-border">
                  {order.specialInstructions}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;