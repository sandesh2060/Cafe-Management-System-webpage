// frontend/src/components/customer/Personalization/ReorderPrevious.jsx
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { RotateCcw, Clock, DollarSign, Check } from 'lucide-react';

const ReorderPrevious = () => {
  const containerRef = useRef(null);
  const itemsRef = useRef(null);

  const previousOrders = [
    {
      id: 1,
      date: 'Feb 1, 2025',
      items: ['Margherita Pizza x2', 'Iced Coffee x2'],
      total: 33.96,
      time: '15 mins',
    },
    {
      id: 2,
      date: 'Jan 25, 2025',
      items: ['Spaghetti Carbonara x1', 'Fresh Juice x2'],
      total: 18.97,
      time: '20 mins',
    },
    {
      id: 3,
      date: 'Jan 20, 2025',
      items: ['Grilled Salmon x2', 'Garlic Bread x1'],
      total: 42.97,
      time: '25 mins',
    },
  ];

  useGSAP(
    () => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      );

      gsap.fromTo(
        itemsRef.current?.children,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
        },
        0.2
      );
    },
    { revertOnUpdate: true }
  );

  const handleReorder = (id) => {
    gsap.to(`[data-order-id="${id}"]`, {
      scale: 0.95,
      duration: 0.2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    });
  };

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl shadow-lg p-8 space-y-6"
    >
      <div className="flex items-center gap-3">
        <RotateCcw size={28} className="text-blue-500" />
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Reorder Previous</h2>
          <p className="text-sm text-gray-600">Your most recent orders</p>
        </div>
      </div>

      <div ref={itemsRef} className="space-y-3">
        {previousOrders.map((order) => (
          <div
            key={order.id}
            data-order-id={order.id}
            className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200 hover:border-blue-500 transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-gray-800">{order.date}</p>
                <p className="text-xs text-gray-600">
                  {order.items.length} items
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600 text-lg">
                  ${order.total}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 mb-3">
              {order.items.map((item, idx) => (
                <p key={idx} className="text-sm text-gray-700">
                  • {item}
                </p>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Clock size={14} />
                <span>{order.time} prep time</span>
              </div>

              <button
                onClick={() => handleReorder(order.id)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition transform hover:scale-105"
              >
                <RotateCcw size={18} />
                Reorder Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReorderPrevious;