// frontend/src/components/customer/OrderTracking/OrderStatus.jsx
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CheckCircle, Clock, AlertCircle, Sparkles } from 'lucide-react';

const OrderStatus = ({ status, estimatedTime, items }) => {
  const cardRef = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: 'back.out(1.5)',
        }
      );
    },
    { dependencies: [status] }
  );

  const statusConfig = {
    preparing: {
      color: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      icon: <Clock className="w-6 h-6" />,
      badge: 'bg-blue-500',
      label: 'Preparing',
    },
    ready: {
      color: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50',
      border: 'border-green-300',
      icon: <AlertCircle className="w-6 h-6" />,
      badge: 'bg-green-500',
      label: 'Ready to Serve',
    },
    served: {
      color: 'from-purple-500 to-pink-600',
      bg: 'bg-purple-50',
      border: 'border-purple-300',
      icon: <Sparkles className="w-6 h-6" />,
      badge: 'bg-purple-500',
      label: 'Served',
    },
    confirmed: {
      color: 'from-orange-500 to-rose-600',
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      icon: <CheckCircle className="w-6 h-6" />,
      badge: 'bg-orange-500',
      label: 'Confirmed',
    },
  };

  const config = statusConfig[status] || statusConfig.preparing;

  return (
    <div
      ref={cardRef}
      className={`relative rounded-2xl border-2 ${config.border} ${config.bg} p-6 shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300`}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 bg-gradient-to-br ${config.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
              {config.icon}
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800">{config.label}</h3>
              <p className="text-sm text-gray-600 font-semibold">
                Est. {estimatedTime}
              </p>
            </div>
          </div>
          <div className={`${config.badge} w-3 h-3 rounded-full animate-pulse`}></div>
        </div>

        {/* Items List */}
        {items && items.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-600 uppercase mb-2">Order Items</p>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 bg-gradient-to-br ${config.color} rounded-lg flex items-center justify-center text-white font-black text-sm`}>
                    {item.qty}
                  </div>
                  <span className="text-sm font-bold text-gray-800">{item.name}</span>
                </div>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;