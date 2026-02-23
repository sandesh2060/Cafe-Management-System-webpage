// File: frontend/src/modules/customer/components/OrderTracking.jsx

import { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, Package, ChefHat, Utensils, TruckIcon, MapPin, Phone, MessageSquare } from 'lucide-react';
import gsap from 'gsap';

const OrderTracking = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const timelineRef = useRef(null);
  const detailsRef = useRef(null);
  const actionsRef = useRef(null);

  const orderSteps = [
    {
      id: 'placed',
      label: 'Order Placed',
      icon: CheckCircle,
      color: 'from-success to-success',
      description: 'Your order has been received'
    },
    {
      id: 'confirmed',
      label: 'Confirmed',
      icon: Package,
      color: 'from-info to-info',
      description: 'Restaurant confirmed your order'
    },
    {
      id: 'preparing',
      label: 'Preparing',
      icon: ChefHat,
      color: 'from-warning to-warning',
      description: 'Our chefs are cooking your meal'
    },
    {
      id: 'ready',
      label: 'Ready to Serve',
      icon: Utensils,
      color: 'from-brand to-secondary',
      description: 'Your food is ready!'
    }
  ];

  useEffect(() => {
    fetchOrderDetails();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateOrderStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  // ===== INITIAL LOAD ANIMATIONS =====
  useEffect(() => {
    if (loading || !order) return;

    const ctx = gsap.context(() => {
      // Header entrance
      gsap.from(headerRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      });

      // Timeline animation
      if (timelineRef.current?.children.length) {
        gsap.from(Array.from(timelineRef.current.children), {
          x: -40,
          opacity: 0,
          duration: 0.5,
          stagger: 0.15,
          delay: 0.2,
          ease: 'back.out(1.2)'
        });
      }

      // Details slide up
      if (detailsRef.current) {
        gsap.from(detailsRef.current, {
          y: 50,
          opacity: 0,
          duration: 0.6,
          delay: 0.4,
          ease: 'power2.out'
        });
      }

      // Actions buttons
      if (actionsRef.current?.children.length) {
        gsap.from(Array.from(actionsRef.current.children), {
          scale: 0,
          opacity: 0,
          duration: 0.4,
          stagger: 0.1,
          delay: 0.6,
          ease: 'back.out(1.7)'
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [loading, order]);

  // ===== STEP PROGRESS ANIMATION =====
  useEffect(() => {
    if (!order) return;

    const newStep = orderSteps.findIndex(step => step.id === order.status);
    if (newStep !== currentStep && newStep > currentStep) {
      // Animate step completion
      const stepElement = document.getElementById(`step-${newStep}`);
      if (stepElement) {
        gsap.fromTo(stepElement,
          { scale: 1 },
          {
            scale: 1.1,
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
            onComplete: () => setCurrentStep(newStep)
          }
        );

        // Pulse animation for active step
        gsap.to(stepElement, {
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.6)',
          duration: 0.8,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        });
      }
    }
  }, [order?.status]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.order);
        const stepIndex = orderSteps.findIndex(step => step.id === data.order.status);
        setCurrentStep(stepIndex >= 0 ? stepIndex : 0);
      }
    } catch (err) {
      console.error('Failed to fetch order:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`);
      const data = await response.json();
      
      if (data.success && data.order.status !== order?.status) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const getEstimatedTime = () => {
    if (!order) return null;
    
    const times = {
      placed: 25,
      confirmed: 20,
      preparing: 15,
      ready: 0
    };
    
    return times[order.status] || 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-bg-elevated rounded-3xl p-6 border border-border animate-pulse">
          <div className="h-8 bg-bg-secondary rounded w-48 mb-4"></div>
          <div className="h-6 bg-bg-secondary rounded w-32"></div>
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bg-secondary rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-bg-secondary rounded w-32"></div>
                <div className="h-4 bg-bg-secondary rounded w-48"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 bg-bg-elevated rounded-3xl border border-border">
        <div className="w-20 h-20 mx-auto mb-4 bg-bg-secondary rounded-2xl flex items-center justify-center">
          <Package className="w-10 h-10 text-text-tertiary" />
        </div>
        <h3 className="text-2xl font-bold text-text-primary mb-2">Order not found</h3>
        <p className="text-text-secondary">Please check your order ID</p>
      </div>
    );
  }

  const estimatedTime = getEstimatedTime();

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6">
      {/* Header with Estimated Time */}
      <div ref={headerRef} className="relative overflow-hidden bg-gradient-to-br from-brand/10 via-secondary/10 to-accent/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-brand/20">
        <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-brand/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Order Tracking</h2>
              <p className="text-text-secondary text-sm sm:text-base">
                Order #{order.orderNumber || order.id?.slice(-6)}
              </p>
            </div>
            <div className="flex-shrink-0 p-3 sm:p-4 bg-brand/10 rounded-xl sm:rounded-2xl">
              <Package className="w-6 h-6 sm:w-7 sm:h-7 text-brand" />
            </div>
          </div>

          {estimatedTime > 0 && (
            <div className="flex items-center gap-3 p-4 bg-bg-elevated/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-border">
              <div className="p-3 bg-warning/10 rounded-xl flex-shrink-0">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-text-tertiary mb-1">Estimated Time</p>
                <p className="text-xl sm:text-2xl font-bold text-text-primary">
                  {estimatedTime} minutes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div ref={timelineRef} className="space-y-0 bg-bg-elevated rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-border">
        {orderSteps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index <= currentStep;
          const isActive = index === currentStep;
          const isLast = index === orderSteps.length - 1;

          return (
            <div key={step.id} className="relative">
              <div
                id={`step-${index}`}
                className="flex items-start gap-4 pb-8 last:pb-0"
              >
                {/* Icon */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isCompleted
                        ? `bg-gradient-to-br ${step.color} text-text-inverse shadow-custom-lg`
                        : 'bg-bg-secondary text-text-tertiary border-2 border-border'
                    }`}
                  >
                    <StepIcon className={`w-6 h-6 sm:w-7 sm:h-7 ${isActive ? 'animate-bounce-slow' : ''}`} />
                  </div>
                  
                  {/* Connecting Line */}
                  {!isLast && (
                    <div className="absolute top-14 left-1/2 -translate-x-1/2 w-0.5 h-full">
                      <div
                        className={`w-full transition-all duration-700 ${
                          isCompleted ? 'bg-gradient-to-b from-success to-success' : 'bg-border'
                        }`}
                        style={{
                          height: isCompleted ? '100%' : '0%'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <h3
                    className={`text-base sm:text-lg font-bold mb-1 transition-colors ${
                      isCompleted ? 'text-text-primary' : 'text-text-tertiary'
                    }`}
                  >
                    {step.label}
                  </h3>
                  <p
                    className={`text-sm transition-colors ${
                      isCompleted ? 'text-text-secondary' : 'text-text-tertiary'
                    }`}
                  >
                    {step.description}
                  </p>
                  
                  {isCompleted && order.timestamps?.[step.id] && (
                    <p className="text-xs text-text-tertiary mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.timestamps[step.id]).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  
                  {isActive && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-warning/10 text-warning rounded-full text-xs font-bold border border-warning/20 animate-pulse-slow">
                      <div className="w-2 h-2 bg-warning rounded-full animate-ping"></div>
                      In Progress
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Details */}
      <div ref={detailsRef} className="bg-bg-elevated rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-border">
        <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-4">Order Details</h3>
        
        <div className="space-y-3">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-bg-secondary rounded-xl">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-bg-tertiary flex items-center justify-center flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Utensils className="w-6 h-6 text-text-tertiary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary text-sm sm:text-base truncate">{item.name}</p>
                <p className="text-xs text-text-tertiary">Quantity: {item.quantity}</p>
              </div>
              <p className="font-bold text-text-primary text-sm sm:text-base flex-shrink-0">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="font-bold text-text-primary">Total</span>
            <span className="font-bold text-xl sm:text-2xl text-brand">${order.total?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div ref={actionsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 px-5 py-4 bg-bg-elevated border-2 border-border text-text-primary font-bold rounded-xl sm:rounded-2xl hover:bg-bg-secondary active:scale-95 transition-all touch-manipulation">
          <Phone className="w-5 h-5" />
          Call Restaurant
        </button>
        <button className="flex items-center justify-center gap-2 px-5 py-4 bg-gradient-to-r from-brand to-secondary text-text-inverse font-bold rounded-xl sm:rounded-2xl shadow-custom-md hover:shadow-custom-lg active:scale-95 transition-all touch-manipulation">
          <MessageSquare className="w-5 h-5" />
          Chat Support
        </button>
      </div>

      {/* Live Updates Indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-text-tertiary">
        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
        <span>Live updates enabled</span>
      </div>
    </div>
  );
};

export default OrderTracking;