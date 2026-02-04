// frontend/src/components/customer/Personalization/SavedCustomizations.jsx
import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Settings, Copy, Trash2, Plus } from 'lucide-react';

const SavedCustomizations = () => {
  const containerRef = useRef(null);
  const itemsRef = useRef(null);
  const [customizations] = useState([
    {
      id: 1,
      name: 'My Pizza Style',
      item: 'Margherita Pizza',
      details: 'Extra cheese, no onions, light sauce',
      used: 12,
      icon: '🍕',
    },
    {
      id: 2,
      name: 'Spicy Salmon',
      item: 'Grilled Salmon',
      details: 'Extra hot spice, lemon on side, no butter',
      used: 8,
      icon: '🐟',
    },
    {
      id: 3,
      name: 'Diet Salad',
      item: 'Caesar Salad',
      details: 'Low-fat dressing, extra veggies, no croutons',
      used: 15,
      icon: '🥗',
    },
    {
      id: 4,
      name: 'Quick Pasta',
      item: 'Spaghetti Carbonara',
      details: 'Medium heat, extra parmesan, garlic bread',
      used: 6,
      icon: '🍝',
    },
  ]);

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

  const handleCopy = (id) => {
    gsap.to(`[data-custom-id="${id}"]`, {
      scale: 0.95,
      duration: 0.2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    });
  };

  const handleDelete = (id) => {
    gsap.to(`[data-custom-id="${id}"]`, {
      opacity: 0,
      x: 100,
      duration: 0.3,
      ease: 'power2.in',
    });
  };

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl shadow-lg p-8 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings size={28} className="text-green-500" />
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Saved Customizations
            </h2>
            <p className="text-sm text-gray-600">Your favorite order configurations</p>
          </div>
        </div>
        <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg transition transform hover:scale-105">
          <Plus size={20} />
          New
        </button>
      </div>

      <div ref={itemsRef} className="space-y-3">
        {customizations.map((custom) => (
          <div
            key={custom.id}
            data-custom-id={custom.id}
            className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 hover:border-green-500 transition"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="text-4xl">{custom.icon}</div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {custom.name}
                    </h3>
                    <p className="text-sm text-gray-600">{custom.item}</p>
                  </div>
                  <span className="bg-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                    Used {custom.used}x
                  </span>
                </div>

                {/* Details */}
                <div className="bg-white rounded-lg p-3 mb-3 border border-green-100">
                  <p className="text-sm text-gray-700">{custom.details}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(custom.id)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition transform hover:scale-105"
                  >
                    <Copy size={18} />
                    Use This
                  </button>
                  <button
                    onClick={() => handleDelete(custom.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          <span className="font-bold">⚡ Quick Tip:</span> Save your favorite customization combinations to order faster next time!
        </p>
      </div>
    </div>
  );
};

export default SavedCustomizations;