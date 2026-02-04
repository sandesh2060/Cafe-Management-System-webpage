// frontend/src/components/customer/Personalization/FavoriteItems.jsx
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Heart, ShoppingCart, TrendingUp } from 'lucide-react';

const FavoriteItems = () => {
  const containerRef = useRef(null);
  const itemsRef = useRef(null);

  const favoriteItems = [
    {
      id: 1,
      name: 'Margherita Pizza',
      image: '🍕',
      price: 12.99,
      orders: 15,
      rating: 5,
    },
    {
      id: 2,
      name: 'Grilled Salmon',
      image: '🐟',
      price: 18.99,
      orders: 8,
      rating: 5,
    },
    {
      id: 3,
      name: 'Chocolate Cake',
      image: '🍰',
      price: 6.99,
      orders: 12,
      rating: 4.5,
    },
    {
      id: 4,
      name: 'Iced Coffee',
      image: '☕',
      price: 3.99,
      orders: 20,
      rating: 4,
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart size={28} className="text-red-500 fill-red-500" />
          <h2 className="text-3xl font-bold text-gray-800">Your Favorites</h2>
        </div>
        <span className="bg-red-100 text-red-700 px-4 py-1 rounded-full font-bold">
          {favoriteItems.length}
        </span>
      </div>

      <div
        ref={itemsRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {favoriteItems.map((item) => (
          <div
            key={item.id}
            className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border-2 border-red-200 hover:border-red-500 transition group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-5xl group-hover:scale-110 transition">
                {item.image}
              </span>
              <div className="bg-white p-2 rounded-lg shadow-md">
                <Heart
                  size={20}
                  className="text-red-500 fill-red-500"
                />
              </div>
            </div>

            <h3 className="font-bold text-gray-800 mb-1 text-sm">
              {item.name}
            </h3>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-bold text-orange-600">
                ${item.price}
              </span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < Math.floor(item.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-600 mb-3 pb-3 border-b border-red-200">
              <TrendingUp size={14} />
              <span>Ordered {item.orders} times</span>
            </div>

            <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition transform hover:scale-105">
              <ShoppingCart size={18} />
              Quick Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoriteItems;