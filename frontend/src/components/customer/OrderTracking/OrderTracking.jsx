// frontend/src/components/customer/OrderTracking/OrderTracking.jsx
import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Clock, CheckCircle, ChefHat, Bell, Sparkles, Utensils } from 'lucide-react';

const OrderTracking = ({ orderId = '12345' }) => {
  const [orderData, setOrderData] = useState({
    id: orderId,
    status: 'preparing',
    timestamp: new Date(),
    items: [
      { id: 1, name: 'Margherita Pizza', qty: 2 },
      { id: 2, name: 'Grilled Salmon', qty: 1 },
    ],
    estimatedTime: '15 mins',
    currentStep: 2,
  });

  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const stepsRef = useRef([]);

  useGSAP(
    () => {
      // Container entrance
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.6)',
        }
      );
    },
    { dependencies: [] }
  );

  // Animate progress bar
  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: `${(orderData.currentStep / 4) * 100}%`,
        duration: 1,
        ease: 'power3.out',
      });
    }

    // Animate completed steps
    stepsRef.current.forEach((step, idx) => {
      if (idx <= orderData.currentStep) {
        gsap.to(step, {
          scale: 1.1,
          duration: 0.3,
          ease: 'back.out(2)',
          delay: idx * 0.1,
        });
        gsap.to(step, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
          delay: idx * 0.1 + 0.3,
        });
      }
    });
  }, [orderData.currentStep]);

  const steps = [
    {
      id: 1,
      name: 'Order Confirmed',
      icon: <CheckCircle className="w-6 h-6" />,
      description: 'Kitchen received your order',
      completed: orderData.currentStep >= 1,
      color: 'from-green-500 to-emerald-600',
    },
    {
      id: 2,
      name: 'Preparing',
      icon: <ChefHat className="w-6 h-6" />,
      description: 'Chef is cooking your food',
      completed: orderData.currentStep >= 2,
      color: 'from-orange-500 to-rose-600',
    },
    {
      id: 3,
      name: 'Ready to Serve',
      icon: <Bell className="w-6 h-6" />,
      description: 'Food is ready for serving',
      completed: orderData.currentStep >= 3,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      id: 4,
      name: 'Served',
      icon: <Sparkles className="w-6 h-6" />,
      description: 'Enjoy your meal!',
      completed: orderData.currentStep >= 4,
      color: 'from-purple-500 to-pink-600',
    },
  ];

  const statusMessages = {
    pending: '🔔 Confirming your order...',
    confirming: '👨‍🍳 Kitchen is confirming',
    preparing: '🔥 Your food is being prepared',
    ready: '✨ Ready to be served!',
    served: '🎉 Bon Appétit!',
  };

  const progressPercentage = Math.round((orderData.currentStep / 4) * 100);

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600 p-8 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-rose-100 font-semibold">Order ID</p>
                <h2 className="text-3xl font-black tracking-tight">#{orderId}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full">
              <Clock className="w-5 h-5 animate-pulse" />
              <span className="text-lg font-black">{orderData.estimatedTime}</span>
            </div>
          </div>
          <p className="text-xl font-bold text-white/90 flex items-center gap-2">
            {statusMessages[orderData.status]}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold text-gray-700">Progress</p>
            <p className="text-2xl font-black text-orange-600">{progressPercentage}%</p>
          </div>
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              ref={progressRef}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 via-rose-500 to-pink-600 rounded-full shadow-lg"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Timeline Steps */}
        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              ref={(el) => (stepsRef.current[idx] = el)}
              className="relative"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`relative flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${
                    step.completed
                      ? `bg-gradient-to-br ${step.color} text-white scale-110`
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.icon}
                  {step.completed && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <h3
                    className={`text-lg font-black mb-1 transition-colors ${
                      step.completed ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </h3>
                  <p
                    className={`text-sm transition-colors ${
                      step.completed ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>
                  {step.completed && idx === orderData.currentStep && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold animate-pulse">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      In Progress
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {idx < steps.length - 1 && (
                <div className="absolute left-8 top-20 w-0.5 h-10 -translate-x-1/2">
                  <div
                    className={`w-full h-full transition-all duration-500 ${
                      step.completed
                        ? 'bg-gradient-to-b from-orange-500 to-orange-300'
                        : 'bg-gray-300'
                    }`}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Order Items */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-600" />
            Your Items
          </h3>
          <div className="space-y-3">
            {orderData.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg group-hover:scale-110 transition-transform">
                    {item.qty}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">Quantity: {item.qty}</p>
                  </div>
                </div>
                {orderData.currentStep >= 2 && (
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Preparing
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Call Waiter Button */}
        <button className="w-full bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-black py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-lg">
          <Bell className="w-6 h-6 animate-bounce" />
          Need Help? Call Waiter
        </button>
      </div>
    </div>
  );
};

export default OrderTracking;