// File: frontend/src/modules/waiter/components/ActiveOrders.jsx
// 📋 ACTIVE ORDERS COMPONENT - Display live orders for waiter
// ✅ Real-time updates, status badges, quick actions

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, ChefHat, Bell, CheckCircle, Package, 
  Eye, TrendingUp, AlertCircle 
} from 'lucide-react';
import gsap from 'gsap';
import { getRelativeTime, formatCurrency, getStatusColor } from '@/shared/utils/formatters';

const ActiveOrders = ({ orders = [], loading, onMarkServed, onViewDetails }) => {
  const navigate = useNavigate();
  const orderCardsRef = useRef([]);

  /**
   * Get status icon
   */
  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      preparing: ChefHat,
      ready: Bell,
      served: Package,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  /**
   * Get status label
   */
  const getStatusLabel = (status) => {
    const labels = {
      pending: '⏳ Pending',
      confirmed: '✅ Confirmed',
      preparing: '👨‍🍳 Preparing',
      ready: '🔔 Ready',
      served: '🍽️ Served',
    };
    return labels[status] || status;
  };

  /**
   * Handle mark as served
   */
  const handleMarkServed = (orderId) => {
    if (onMarkServed) {
      onMarkServed(orderId);
    }
  };

  /**
   * Handle view details
   */
  const handleViewDetails = (order) => {
    if (onViewDetails) {
      onViewDetails(order);
    } else {
      navigate(`/waiter/orders?highlight=${order.id || order._id}`);
    }
  };

  /**
   * Animate order cards on mount
   */
  useEffect(() => {
    if (!loading && orderCardsRef.current.length > 0) {
      gsap.from(orderCardsRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      });
    }
  }, [loading, orders.length]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-bg-elevated rounded-2xl p-4 border border-border animate-pulse">
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-bg-tertiary rounded w-1/3"></div>
                <div className="h-3 bg-bg-tertiary rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-bg-tertiary rounded w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-bg-tertiary rounded w-full"></div>
              <div className="h-3 bg-bg-tertiary rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12 bg-bg-elevated rounded-2xl border border-border">
        <div className="w-16 h-16 bg-bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-text-tertiary" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">
          No Active Orders
        </h3>
        <p className="text-sm text-text-secondary">
          All orders have been served or completed
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order, index) => {
        const orderId = order.id || order._id;
        const isReady = order.status === 'ready';
        const isPreparing = order.status === 'preparing';

        return (
          <div
            key={orderId}
            ref={el => orderCardsRef.current[index] = el}
            className={`
              bg-bg-elevated rounded-2xl border-2 transition-all
              ${isReady 
                ? 'border-success shadow-lg shadow-success/20 animate-pulse-slow' 
                : 'border-border hover:border-brand/50'
              }
            `}
          >
            {/* Order Header */}
            <div className="p-4 border-b border-border bg-gradient-to-r from-brand/5 to-secondary/5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-text-primary">
                      Order #{order.orderNumber}
                    </h3>
                    {isReady && (
                      <span className="px-2 py-0.5 bg-success text-white text-xs font-bold rounded-full animate-pulse">
                        READY
                      </span>
                    )}
                    {isPreparing && (
                      <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full">
                        COOKING
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getRelativeTime(order.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Table {order.tableNumber}
                    </span>
                    {order.customerName && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {order.customerName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`px-3 py-1.5 rounded-xl font-semibold text-xs border-2 ${getStatusColor(order.status)}`}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ChefHat className="w-4 h-4 text-brand" />
                <h4 className="font-semibold text-sm text-text-primary">
                  Items ({order.items?.length || 0})
                </h4>
              </div>

              <div className="space-y-1.5">
                {(order.items || []).slice(0, 3).map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex justify-between items-center p-2 bg-bg-secondary rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold bg-brand/10 text-brand">
                        {item.quantity}×
                      </span>
                      <span className="font-medium text-text-primary">
                        {item.name}
                      </span>
                    </div>
                    {item.status && (
                      <span className={`px-2 py-0.5 rounded-md text-xs ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                ))}

                {(order.items?.length || 0) > 3 && (
                  <button
                    onClick={() => handleViewDetails(order)}
                    className="w-full py-1.5 text-xs text-brand hover:text-secondary font-medium transition-colors"
                  >
                    +{order.items.length - 3} more items
                  </button>
                )}
              </div>

              {/* Special Instructions */}
              {order.notes && (
                <div className="mt-3 p-2 bg-info/10 border border-info/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-text-primary">
                      <span className="font-semibold">Note:</span> {order.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                <span className="text-sm font-semibold text-text-primary">Total</span>
                <span className="text-lg font-bold bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 pt-0 flex gap-2">
              <button
                onClick={() => handleViewDetails(order)}
                className="flex-1 px-4 py-2.5 bg-bg-secondary hover:bg-bg-tertiary text-text-primary rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>

              {isReady && (
                <button
                  onClick={() => handleMarkServed(orderId)}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-success to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Served
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActiveOrders;