// frontend/src/pages/customer/OrderHistoryPage.jsx
import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Repeat2,
  Star,
  Download,
  Search,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([
    {
      id: '#ORD-12345',
      date: 'Feb 1, 2025',
      time: '2:30 PM',
      items: ['Margherita Pizza x2', 'Grilled Salmon x1', 'Iced Coffee x2'],
      total: 49.97,
      status: 'delivered',
      rating: 5,
      table: 8,
    },
    {
      id: '#ORD-12344',
      date: 'Jan 28, 2025',
      time: '7:15 PM',
      items: ['Spring Rolls x3', 'Chocolate Cake x2'],
      total: 24.95,
      status: 'delivered',
      rating: 4,
      table: 3,
    },
    {
      id: '#ORD-12343',
      date: 'Jan 25, 2025',
      time: '12:45 PM',
      items: ['Spaghetti Carbonara x1', 'Fresh Juice x2'],
      total: 18.97,
      status: 'delivered',
      rating: 5,
      table: 12,
    },
    {
      id: '#ORD-12342',
      date: 'Jan 20, 2025',
      time: '6:00 PM',
      items: ['Grilled Salmon x2', 'Garlic Bread x1'],
      total: 42.97,
      status: 'delivered',
      rating: 4,
      table: 5,
    },
  ]);

  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const containerRef = useRef(null);
  const ordersRef = useRef(null);

  useGSAP(
    () => {
      // Container fade in
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      );

      // Orders stagger
      gsap.fromTo(
        ordersRef.current?.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ordersRef.current,
            start: 'top center+=100',
          },
        }
      );
    },
    { revertOnUpdate: true }
  );

  const handleExpandOrder = (id) => {
    gsap.to(`[data-order-id="${id}"] [data-expand-content]`, {
      height: 'auto',
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out',
    });
    setExpandedId(id === expandedId ? null : id);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesFilter =
      filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: '📦' },
    { label: 'Total Spent', value: `$${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}`, icon: '💰' },
    { label: 'Avg Rating', value: '4.5', icon: '⭐' },
    { label: 'Member Since', value: '2 Years', icon: '👑' },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-orange-50 to-white"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12 shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold">Order History</h1>
          <p className="text-orange-100 mt-2">Track and manage your past orders</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-600 text-sm font-semibold uppercase">
                  {stat.label}
                </p>
                <span className="text-3xl">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div className="flex items-center gap-2 relative">
            <Search size={20} className="absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            {['all', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Orders' : 'Delivered'}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div ref={ordersRef} className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                data-order-id={order.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border-l-4 border-orange-500 hover:shadow-xl transition"
              >
                {/* Order Header */}
                <button
                  onClick={() => handleExpandOrder(order.id)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-6 flex-1">
                    {/* Order Number and Date */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {order.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {order.date} at {order.time}
                      </p>
                    </div>

                    {/* Items Preview */}
                    <div className="hidden md:block">
                      <p className="text-sm text-gray-700">
                        {order.items.length} items • Table #{order.table}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="hidden lg:flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < order.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {order.rating}/5
                      </span>
                    </div>
                  </div>

                  {/* Total and Expand */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">
                        ${order.total}
                      </p>
                      <p className="text-xs text-green-600 font-semibold">
                        Delivered
                      </p>
                    </div>
                    {expandedId === order.id ? (
                      <ChevronUp size={24} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={24} className="text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedId === order.id && (
                  <div
                    data-expand-content
                    className="px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-4"
                  >
                    {/* Items Detail */}
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3">
                        Items Ordered
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center p-2 bg-white rounded-lg border border-gray-200"
                          >
                            <span className="text-gray-700">{item}</span>
                            <span className="text-sm text-gray-600">
                              ${(order.total / order.items.length).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button className="flex-1 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition">
                        <Repeat2 size={18} />
                        Reorder
                      </button>
                      <button className="flex-1 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition">
                        <Download size={18} />
                        Receipt
                      </button>
                      <button className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-bold py-2 rounded-lg transition">
                        Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-2xl text-gray-600 mb-2">No orders found</p>
              <p className="text-gray-500">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Start ordering to build your history'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryPage;