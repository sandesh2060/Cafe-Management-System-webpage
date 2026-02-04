// frontend/src/components/customer/Personalization/RecommendedItems.jsx
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Sparkles, ShoppingCart, TrendingUp } from 'lucide-react';

const RecommendedItems = () => {
  const containerRef = useRef(null);
  const itemsRef = useRef(null);

  const recommendations = [
    {
      id: 1,
      name: 'Truffle Pasta',
      image: '🍝',
      price: 16.99,
      reason: 'You love pasta dishes',
      match: 92,
    },
    {
      id: 2,
      name: 'Caesar Salad',
      image: '🥗',
      price: 9.99,
      reason: 'Trending this week',
      match: 88,
    },
    {
      id: 3,
      name: 'Lemon Cheesecake',
      image: '🍰',
      price: 7.99,
      reason: 'Similar to your favorites',
      match: 85,
    },
    {
      id: 4,
      name: 'Berry Smoothie',
      image: '🍓',
      price: 5.99,
      reason: 'You ordered drinks 8 times',
      match: 82,
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
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: 'back.out',
        },
        0.2
      );
    },
    { revertOnUpdate: true }
  );

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl shadow-lg p-8 space-y-6"
    >
      <div className="flex items-center gap-3">
        <Sparkles size={28} className="text-purple-500" />
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Recommended For You</h2>
          <p className="text-sm text-gray-600">Based on your ordering history</p>
        </div>
      </div>

      <div
        ref={itemsRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {recommendations.map((item) => (
          <div
            key={item.id}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 hover:border-purple-500 transition group relative overflow-hidden"
          >
            {/* Match Badge */}
            <div className="absolute top-3 right-3 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              {item.match}% Match
            </div>

            {/* Image */}
            <div className="text-5xl mb-3 group-hover:scale-110 transition">
              {item.image}
            </div>

            {/* Name and Price */}
            <h3 className="font-bold text-gray-800 mb-1 text-sm">
              {item.name}
            </h3>
            <p className="text-lg font-bold text-purple-600 mb-3">
              ${item.price}
            </p>

            {/* Reason */}
            <div className="flex items-start gap-1 text-xs text-gray-600 mb-3 pb-3 border-b border-purple-200">
              <TrendingUp size={12} className="flex-shrink-0 mt-0.5" />
              <span>{item.reason}</span>
            </div>

            {/* Add Button */}
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition transform hover:scale-105">
              <ShoppingCart size={18} />
              Try it
            </button>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800">
          <span className="font-bold">💡 Smart Recommendations:</span> Our AI learns your taste preferences and suggests dishes you'll love!
        </p>
      </div>
    </div>
  );
};

export default RecommendedItems;