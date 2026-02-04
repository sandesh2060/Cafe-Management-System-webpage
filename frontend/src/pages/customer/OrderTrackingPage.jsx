// frontend/src/pages/customer/OrderTrackingPage.jsx
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import OrderTracking from '@/components/customer/OrderTracking/OrderTracking';
import { ChevronLeft, Phone, Clock, Utensils, Users, MessageCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const OrderTrackingPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const cardsRef = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      // Header slide down
      tl.fromTo(
        headerRef.current,
        { y: -100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        }
      );

      // Container fade in
      tl.fromTo(
        containerRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
        },
        0.2
      );

      // Content cascade
      tl.fromTo(
        contentRef.current?.children,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.12,
          ease: 'back.out(1.2)',
        },
        0.4
      );

      // Info cards with bounce
      if (cardsRef.current?.children) {
        gsap.fromTo(
          Array.from(cardsRef.current.children),
          { opacity: 0, y: 40, rotateX: -15 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.7,
            stagger: 0.15,
            ease: 'elastic.out(1, 0.6)',
            delay: 0.6,
          }
        );
      }
    },
    { dependencies: [] }
  );

  const quickActions = [
    {
      icon: <Phone className="w-5 h-5" />,
      label: 'Call Waiter',
      action: () => console.log('Call waiter'),
      color: 'from-emerald-500 to-teal-600',
      hoverColor: 'hover:from-emerald-600 hover:to-teal-700',
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: 'Send Message',
      action: () => console.log('Message'),
      color: 'from-blue-500 to-indigo-600',
      hoverColor: 'hover:from-blue-600 hover:to-indigo-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 pb-12">
      {/* Animated Header */}
      <div
        ref={headerRef}
        className="relative bg-gradient-to-br from-orange-600 via-rose-500 to-pink-600 text-white overflow-hidden shadow-2xl"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] animate-pulse"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="group hover:bg-white/20 p-3 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex-1">
              <h1 className="text-4xl font-black mb-2 tracking-tight">
                Order Tracking
              </h1>
              <p className="text-rose-100 font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Your delicious food is on its way!
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.action}
                className={`flex items-center gap-2 px-5 py-3 bg-gradient-to-r ${action.color} ${action.hoverColor} rounded-xl font-bold text-sm shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl`}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
          <svg
            className="absolute bottom-0 w-full h-8"
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,0 C150,80 350,0 600,50 C850,100 1050,20 1200,80 L1200,120 L0,120 Z"
              className="fill-orange-50"
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div ref={containerRef} className="max-w-6xl mx-auto px-6 -mt-4">
        <div ref={contentRef} className="space-y-8">
          {/* Main Tracking Component */}
          <div className="transform transition-all duration-300 hover:scale-[1.01]">
            <OrderTracking orderId="12345" />
          </div>

          {/* Info Cards Grid */}
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Estimated Time Card */}
            <div className="group relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="px-3 py-1 bg-white/20 backdrop-blur rounded-full">
                    <span className="text-xs font-bold text-white">LIVE</span>
                  </div>
                </div>
                <p className="text-amber-100 text-sm font-bold mb-2">
                  Estimated Time
                </p>
                <p className="text-5xl font-black text-white mb-1">15</p>
                <p className="text-amber-100 text-sm font-semibold">
                  minutes remaining
                </p>
              </div>
              <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Table Location Card */}
            <div className="group relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl">
                    🪑
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm font-bold mb-1">
                      Your Table
                    </p>
                    <p className="text-4xl font-black text-white">Table 8</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-blue-100 text-sm">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">Section A</span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Support Card */}
            <div className="group relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative p-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-white animate-pulse" />
                </div>
                <p className="text-emerald-100 text-sm font-bold mb-2">
                  Need Help?
                </p>
                <p className="text-white text-lg font-bold mb-4">
                  We're here for you
                </p>
                <button className="w-full bg-white text-emerald-600 font-bold py-3 rounded-xl hover:bg-emerald-50 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg">
                  Call Waiter Now
                </button>
              </div>
              <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                <Utensils className="w-6 h-6 text-orange-600" />
                Order Summary
              </h2>
            </div>

            <div className="p-8 space-y-6">
              {/* Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group relative bg-gradient-to-br from-orange-50 to-rose-50 p-6 rounded-2xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 hover:shadow-lg">
                  <div className="absolute top-4 right-4 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                  <p className="text-sm text-orange-600 font-bold mb-2">
                    PIZZA
                  </p>
                  <p className="text-xl font-black text-gray-800 mb-2">
                    Margherita Pizza
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    Classic tomato, mozzarella & basil
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">2 × $12.99</span>
                    <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                      Plating
                    </span>
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg">
                  <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                  <p className="text-sm text-blue-600 font-bold mb-2">
                    SEAFOOD
                  </p>
                  <p className="text-xl font-black text-gray-800 mb-2">
                    Grilled Salmon
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    Fresh Atlantic salmon, lemon butter
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">1 × $18.99</span>
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                      Cooking
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t-2 border-gray-200 pt-6 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold">$44.97</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="font-semibold">Tax (10%)</span>
                  <span className="font-bold">$4.50</span>
                </div>
                <div className="flex justify-between text-2xl font-black text-gray-900 pt-3 border-t-2 border-gray-200">
                  <span>Total</span>
                  <span className="text-orange-600">$49.47</span>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next Timeline */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border-2 border-blue-200 shadow-xl">
            <h3 className="text-2xl font-black text-blue-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">✨</span>
              </div>
              What's Next?
            </h3>
            <div className="space-y-4">
              {[
                { icon: '✓', text: 'Your food is being prepared with care', status: 'done' },
                { icon: '🔥', text: 'Final checks and beautiful plating', status: 'active' },
                { icon: '🚶', text: 'Your waiter will serve it immediately', status: 'pending' },
                { icon: '🍽️', text: 'Enjoy your meal! Rate us afterward', status: 'pending' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    item.status === 'done'
                      ? 'bg-green-100 border-2 border-green-300'
                      : item.status === 'active'
                      ? 'bg-orange-100 border-2 border-orange-300 animate-pulse'
                      : 'bg-white border-2 border-gray-200'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                      item.status === 'done'
                        ? 'bg-green-500 text-white'
                        : item.status === 'active'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <p
                    className={`font-bold ${
                      item.status === 'done'
                        ? 'text-green-900'
                        : item.status === 'active'
                        ? 'text-orange-900'
                        : 'text-gray-600'
                    }`}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;