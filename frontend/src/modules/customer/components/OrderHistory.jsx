// File: frontend/src/modules/customer/components/OrderHistory.jsx

import { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, XCircle, Package, ChevronDown, ChevronUp, Star, Receipt, Calendar, DollarSign } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const OrderHistory = ({ customerId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filter, setFilter] = useState('all'); // all, completed, pending, cancelled

  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const filtersRef = useRef(null);
  const ordersRef = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, [customerId]);

  // ===== INITIAL ANIMATIONS =====
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(headerRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      });

      // Filters animation
      if (filtersRef.current?.children.length) {
        gsap.from(Array.from(filtersRef.current.children), {
          x: -20,
          opacity: 0,
          duration: 0.4,
          stagger: 0.08,
          delay: 0.2,
          ease: 'power2.out'
        });
      }

      // Orders stagger animation
      if (ordersRef.current?.children.length) {
        gsap.from(Array.from(ordersRef.current.children), {
          y: 40,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.3,
          ease: 'power2.out',
          clearProps: 'all'
        });
      }

      // Scroll-triggered animations for order cards
      ScrollTrigger.batch(ordersRef.current?.children || [], {
        onEnter: batch => gsap.from(batch, {
          y: 50,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out'
        }),
        once: true
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, filter]);

  // ===== EXPAND/COLLAPSE ANIMATION =====
  const toggleOrderExpand = (orderId) => {
    const isExpanding = expandedOrder !== orderId;
    setExpandedOrder(isExpanding ? orderId : null);

    if (isExpanding) {
      const element = document.getElementById(`order-details-${orderId}`);
      if (element) {
        gsap.from(element, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/customer/${customerId}`);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      completed: {
        icon: CheckCircle,
        color: 'text-success',
        bg: 'bg-success-light',
        border: 'border-success',
        label: 'Completed'
      },
      pending: {
        icon: Clock,
        color: 'text-warning',
        bg: 'bg-warning-light',
        border: 'border-warning',
        label: 'In Progress'
      },
      preparing: {
        icon: Package,
        color: 'text-info',
        bg: 'bg-info-light',
        border: 'border-info',
        label: 'Preparing'
      },
      cancelled: {
        icon: XCircle,
        color: 'text-error',
        bg: 'bg-error-light',
        border: 'border-error',
        label: 'Cancelled'
      }
    };
    return configs[status] || configs.pending;
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const totalSpent = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-bg-elevated rounded-2xl p-5 border border-border animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 bg-bg-secondary rounded w-32"></div>
              <div className="h-8 bg-bg-secondary rounded-full w-24"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-bg-secondary rounded w-3/4"></div>
              <div className="h-4 bg-bg-secondary rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6">
      {/* Header with Stats */}
      <div ref={headerRef} className="bg-gradient-to-br from-brand/10 via-secondary/10 to-accent/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-brand/20">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Order History</h2>
            <p className="text-text-secondary text-sm sm:text-base">Track your delicious journey</p>
          </div>
          <div className="flex-shrink-0 p-3 sm:p-4 bg-brand/10 rounded-xl sm:rounded-2xl">
            <Receipt className="w-6 h-6 sm:w-7 sm:h-7 text-brand" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-bg-elevated/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border">
            <p className="text-xs sm:text-sm text-text-tertiary mb-1">Total Orders</p>
            <p className="text-xl sm:text-2xl font-bold text-text-primary">{orders.length}</p>
          </div>
          <div className="bg-bg-elevated/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border">
            <p className="text-xs sm:text-sm text-text-tertiary mb-1">Completed</p>
            <p className="text-xl sm:text-2xl font-bold text-success">
              {orders.filter(o => o.status === 'completed').length}
            </p>
          </div>
          <div className="bg-bg-elevated/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border col-span-2 sm:col-span-1">
            <p className="text-xs sm:text-sm text-text-tertiary mb-1">Total Spent</p>
            <p className="text-xl sm:text-2xl font-bold text-brand">${totalSpent.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div ref={filtersRef} className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { value: 'all', label: 'All Orders', icon: Receipt },
          { value: 'completed', label: 'Completed', icon: CheckCircle },
          { value: 'pending', label: 'In Progress', icon: Clock },
          { value: 'cancelled', label: 'Cancelled', icon: XCircle }
        ].map((filterOption) => {
          const Icon = filterOption.icon;
          return (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 touch-manipulation ${
                filter === filterOption.value
                  ? 'bg-gradient-to-r from-brand to-secondary text-text-inverse shadow-custom-lg scale-105'
                  : 'bg-bg-elevated text-text-secondary hover:bg-bg-secondary border border-border'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm sm:text-base">{filterOption.label}</span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-bg-elevated rounded-2xl sm:rounded-3xl border border-border">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-bg-secondary rounded-2xl flex items-center justify-center">
            <Package className="w-8 h-8 sm:w-10 sm:h-10 text-text-tertiary" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">No orders found</h3>
          <p className="text-text-secondary mb-6">Start ordering to see your history here</p>
        </div>
      ) : (
        <div ref={ordersRef} className="space-y-3 sm:space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedOrder === order.id;

            return (
              <div
                key={order.id}
                className="group bg-bg-elevated rounded-2xl sm:rounded-3xl border border-border shadow-custom-md hover:shadow-custom-xl transition-all duration-300 overflow-hidden"
              >
                {/* Order Header */}
                <button
                  onClick={() => toggleOrderExpand(order.id)}
                  className="w-full p-4 sm:p-5 text-left touch-manipulation"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-bold text-text-primary">
                          Order #{order.orderNumber || order.id?.slice(-6)}
                        </h3>
                        <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                          <StatusIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="hidden xs:inline">{statusConfig.label}</span>
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-text-tertiary">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="hidden xs:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="hidden xs:inline">•</span>
                        <span className="font-medium">{order.items?.length || 0} items</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <p className="text-xl sm:text-2xl font-bold text-brand mb-1">
                        ${order.total?.toFixed(2)}
                      </p>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-text-secondary ml-auto" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-text-secondary ml-auto" />
                      )}
                    </div>
                  </div>

                  {/* Quick Preview (when collapsed) */}
                  {!isExpanded && order.items?.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex-shrink-0 px-3 py-1.5 bg-bg-secondary rounded-lg text-xs font-medium text-text-secondary">
                          {item.quantity}x {item.name}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex-shrink-0 px-3 py-1.5 bg-brand/10 rounded-lg text-xs font-bold text-brand">
                          +{order.items.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div
                    id={`order-details-${order.id}`}
                    className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-border"
                  >
                    <div className="pt-4 space-y-4">
                      {/* Items List */}
                      <div>
                        <h4 className="text-sm font-bold text-text-primary mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3 p-3 bg-bg-secondary rounded-xl">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-bg-tertiary flex items-center justify-center flex-shrink-0">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                  ) : (
                                    <Package className="w-6 h-6 text-text-tertiary" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-text-primary text-sm sm:text-base truncate">{item.name}</p>
                                  <p className="text-xs text-text-tertiary">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="font-bold text-text-primary text-sm sm:text-base flex-shrink-0">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="pt-3 border-t border-border space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">Subtotal</span>
                          <span className="font-semibold text-text-primary">${order.subtotal?.toFixed(2)}</span>
                        </div>
                        {order.tax > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-secondary">Tax</span>
                            <span className="font-semibold text-text-primary">${order.tax?.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="font-bold text-text-primary">Total</span>
                          <span className="font-bold text-xl text-brand">${order.total?.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Rate Order (if completed and not rated) */}
                      {order.status === 'completed' && !order.rated && (
                        <button className="w-full py-3 bg-gradient-to-r from-warning to-accent text-text-inverse font-bold rounded-xl shadow-custom-md hover:shadow-custom-lg active:scale-95 transition-all flex items-center justify-center gap-2 touch-manipulation">
                          <Star className="w-5 h-5" />
                          Rate This Order
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default OrderHistory;