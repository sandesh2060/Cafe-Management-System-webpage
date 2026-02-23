// File: frontend/src/modules/waiter/pages/OrdersPage.jsx
// 📋 WAITER ORDERS PAGE - Real-time order management and tracking

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, RefreshCw, Filter, Search, Clock, CheckCircle,
  ChefHat, Bell, Package, XCircle, Eye, TrendingUp, AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../shared/hooks/useAuth';
import { useWaiterOrders } from '../hooks/useWaiterOrders';
import gsap from 'gsap';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableFilter = searchParams.get('table');
  
  const { user } = useAuth();
  const { 
    orders, 
    activeOrders,
    completedOrders,
    loading, 
    stats, 
    fetchOrders,
    markAsServed 
  } = useWaiterOrders(user?.id);

  const [filterStatus, setFilterStatus] = useState('active'); // 'active', 'all', 'pending', 'preparing', 'ready', 'served', 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const orderCardsRef = useRef([]);

  /**
   * Get status color and styling
   */
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-warning/10 text-warning border-warning/20',
      'confirmed': 'bg-info/10 text-info border-info/20',
      'preparing': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'ready': 'bg-success/10 text-success border-success/20',
      'served': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
      'completed': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      'cancelled': 'bg-error/10 text-error border-error/20',
    };
    return colors[status] || colors['pending'];
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
    return icons[status] || '📋';
  };

  /**
   * Manual refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Orders refreshed!', {
        position: 'top-center',
        autoClose: 2000,
      });
    }, 800);
  };

  /**
   * Filter orders based on status, search, and table
   */
  const filteredOrders = orders.filter(order => {
    // Table filter (from URL params)
    if (tableFilter && order.tableId !== tableFilter) {
      return false;
    }

    // Status filter
    if (filterStatus === 'active') {
      if (['completed', 'cancelled'].includes(order.status)) {
        return false;
      }
    } else if (filterStatus !== 'all' && order.status !== filterStatus) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.orderNumber.toString().includes(query) ||
        order.tableNumber.toString().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.items.some(item => item.name.toLowerCase().includes(query))
      );
    }

    return true;
  });

  /**
   * Handle mark as served
   */
  const handleMarkAsServed = async (orderId) => {
    const result = await markAsServed(orderId);
    if (result.success) {
      setSelectedOrder(null);
    }
  };

  /**
   * Get time ago string
   */
  const getTimeAgo = (date) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMs = now - orderDate;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return orderDate.toLocaleDateString();
  };

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

      if (statsRef.current) {
        gsap.from(statsRef.current.children, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.2,
          ease: 'back.out(1.5)',
        });
      }
    });

    return () => ctx.revert();
  }, []);

  /**
   * Animate order cards
   */
  useEffect(() => {
    if (!loading && orderCardsRef.current.length > 0) {
      const ctx = gsap.context(() => {
        gsap.from(orderCardsRef.current, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
        });
      });

      return () => ctx.revert();
    }
  }, [loading, filteredOrders.length, filterStatus]);

  // Loading state
  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header 
        ref={headerRef}
        className="sticky top-0 z-40 bg-bg-elevated/95 backdrop-blur-xl border-b border-border shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/waiter/tables')}
                className="w-10 h-10 bg-bg-secondary hover:bg-bg-tertiary rounded-xl flex items-center justify-center transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5 text-text-primary" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">
                  Orders
                </h1>
                <p className="text-sm text-text-tertiary">
                  {tableFilter ? `Table ${tableFilter}` : 'All assigned tables'}
                </p>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 bg-bg-secondary hover:bg-brand/10 rounded-xl transition-all disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-brand ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Statistics */}
        <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          <div className="p-4 bg-bg-elevated rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-brand" />
              <span className="text-xs font-medium text-text-tertiary">Total</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
          </div>

          <div className="p-4 bg-bg-elevated rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-warning" />
              <span className="text-xs font-medium text-text-tertiary">Pending</span>
            </div>
            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
          </div>

          <div className="p-4 bg-bg-elevated rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <ChefHat className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-text-tertiary">Preparing</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.preparing}</p>
          </div>

          <div className="p-4 bg-bg-elevated rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-success" />
              <span className="text-xs font-medium text-text-tertiary">Ready</span>
            </div>
            <p className="text-2xl font-bold text-success">{stats.ready}</p>
          </div>

          <div className="p-4 bg-bg-elevated rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-text-tertiary">Served</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{stats.served}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search orders, tables, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-bg-elevated border border-border rounded-xl focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-bg-elevated border border-border rounded-xl focus:ring-2 focus:ring-brand"
          >
            <option value="active">Active Orders</option>
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready to Serve</option>
            <option value="served">Served</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-text-tertiary" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              No Orders Found
            </h3>
            <p className="text-text-secondary mb-6">
              {filterStatus !== 'all' 
                ? `No ${filterStatus} orders at the moment.` 
                : 'No orders for your assigned tables yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <div
                key={order.id}
                ref={(el) => (orderCardsRef.current[index] = el)}
                className="bg-bg-elevated rounded-3xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Order Header */}
                <div className="p-5 border-b border-border bg-gradient-to-r from-brand/5 to-secondary/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-text-primary">
                          Order #{order.orderNumber}
                        </h3>
                        {!['completed', 'cancelled'].includes(order.status) && (
                          <span className="px-2 py-0.5 bg-success/10 text-success text-xs font-bold rounded-full animate-pulse">
                            LIVE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-text-tertiary">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getTimeAgo(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          Table {order.tableNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {order.customerName}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-xl font-semibold text-sm border-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 bg-bg-secondary hover:bg-brand/10 rounded-xl transition-all"
                      >
                        <Eye className="w-5 h-5 text-brand" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ChefHat className="w-4 h-4 text-brand" />
                    <h4 className="font-semibold text-text-primary">
                      Items ({order.items.length})
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {order.items.slice(0, 4).map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex justify-between items-center p-3 bg-bg-secondary rounded-xl"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold bg-brand/10 text-brand">
                            {item.quantity}×
                          </span>
                          <span className="font-medium text-text-primary text-sm">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-lg bg-bg-tertiary text-text-tertiary">
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.items.length > 4 && (
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="w-full mt-2 py-2 text-sm text-brand hover:text-secondary font-medium"
                    >
                      +{order.items.length - 4} more items
                    </button>
                  )}

                  {/* Total */}
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                    <span className="text-lg font-bold text-text-primary">Total</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleMarkAsServed(order.id)}
                      className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-success to-emerald-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all"
                    >
                      Mark as Served
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-bg-elevated rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-bg-elevated border-b border-border p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">
                  Order #{selectedOrder.orderNumber}
                </h2>
                <p className="text-sm text-text-tertiary">
                  Table {selectedOrder.tableNumber} • {selectedOrder.customerName}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 bg-bg-secondary hover:bg-bg-tertiary rounded-xl flex items-center justify-center"
              >
                <XCircle className="w-6 h-6 text-text-tertiary" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className={`p-4 rounded-2xl border-2 ${getStatusColor(selectedOrder.status)}`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getStatusIcon(selectedOrder.status)}</span>
                  <div>
                    <p className="font-semibold capitalize">{selectedOrder.status}</p>
                    <p className="text-sm opacity-80">{getTimeAgo(selectedOrder.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* All Items */}
              <div>
                <h3 className="font-semibold text-lg text-text-primary mb-3">
                  Order Items
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex justify-between items-start p-4 bg-bg-secondary rounded-xl"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center font-bold bg-brand/10 text-brand">
                          {item.quantity}×
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-text-primary">{item.name}</p>
                          {item.specialInstructions && (
                            <p className="text-sm text-text-tertiary mt-1">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-1 rounded-lg bg-bg-tertiary text-text-tertiary">
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="font-semibold text-text-primary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="p-4 bg-info/10 border border-info/20 rounded-xl">
                  <p className="text-sm text-text-primary">
                    <span className="font-semibold">Special Instructions:</span> {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="p-4 bg-bg-secondary rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-text-secondary">Subtotal</span>
                  <span className="font-medium text-text-primary">${selectedOrder.subtotal?.toFixed(2)}</span>
                </div>
                {selectedOrder.tax > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-text-secondary">Tax</span>
                    <span className="font-medium text-text-primary">${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-lg font-bold text-text-primary">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">
                    ${selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {selectedOrder.status === 'ready' && (
                <button
                  onClick={() => handleMarkAsServed(selectedOrder.id)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-success to-emerald-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all"
                >
                  Mark as Served
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;