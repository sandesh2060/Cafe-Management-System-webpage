// frontend/src/components/customer/Personalization/WelcomeScreen.jsx
import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Sparkles, ChefHat, TrendingUp, Clock } from 'lucide-react';

const WelcomeScreen = ({ sessionData, onStartOrdering }) => {
  const [step, setStep] = useState('welcome'); // welcome -> recommendations
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const cardsRef = useRef(null);

  const recommendations = [
    {
      id: 1,
      name: 'Crispy Spring Rolls',
      reason: 'Popular choice 🔥',
      image: '🥟',
      price: 4.99,
    },
    {
      id: 2,
      name: 'Margherita Pizza',
      reason: 'Our bestseller ⭐',
      image: '🍕',
      price: 12.99,
    },
    {
      id: 3,
      name: 'Grilled Salmon',
      reason: 'Trending today 📈',
      image: '🐟',
      price: 18.99,
    },
    {
      id: 4,
      name: 'Chocolate Cake',
      reason: 'Sweet ending 🍰',
      image: '🍰',
      price: 6.99,
    },
  ];

  useGSAP(
    () => {
      const tl = gsap.timeline();

      // Container fade in
      tl.fromTo(
        containerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      );

      // Content animate
      tl.fromTo(
        contentRef.current?.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
        },
        0.2
      );
    },
    { revertOnUpdate: true }
  );

  const handleStartOrdering = () => {
    gsap.to(contentRef.current, {
      opacity: 0,
      y: -30,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: onStartOrdering,
    });
  };

  const handleShowRecommendations = () => {
    gsap.to(contentRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => setStep('recommendations'),
    });
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4"
    >
      <div
        ref={contentRef}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {step === 'welcome' && (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={40} />
              </div>
              <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
              <p className="text-orange-100 text-lg">Table #{sessionData.tableId}</p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Welcome Message */}
              <div className="text-center">
                <p className="text-gray-700 text-lg mb-4">
                  We're excited to serve you today! Ready to explore our delicious menu?
                </p>
              </div>

              {/* Quick Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={20} className="text-blue-600" />
                    <h3 className="font-bold text-blue-900">Trending</h3>
                  </div>
                  <p className="text-sm text-blue-800">
                    Check out our most popular dishes
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={20} className="text-green-600" />
                    <h3 className="font-bold text-green-900">Quick Order</h3>
                  </div>
                  <p className="text-sm text-green-800">
                    Get your favorites in minutes
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <ChefHat size={20} className="text-purple-600" />
                    <h3 className="font-bold text-purple-900">Customize</h3>
                  </div>
                  <p className="text-sm text-purple-800">
                    Make it your way with toppings
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={20} className="text-yellow-600" />
                    <h3 className="font-bold text-yellow-900">Rewards</h3>
                  </div>
                  <p className="text-sm text-yellow-800">
                    Earn points with every order
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={handleShowRecommendations}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105"
                >
                  See Recommendations
                </button>
                <button
                  onClick={handleStartOrdering}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105"
                >
                  Start Browsing Menu
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'recommendations' && (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-center text-white">
              <h2 className="text-2xl font-bold">Recommended for You</h2>
              <p className="text-orange-100 mt-2">Based on popular choices</p>
            </div>

            {/* Recommendations Grid */}
            <div
              ref={cardsRef}
              className="p-8 grid grid-cols-2 gap-4 max-h-80 overflow-y-auto"
            >
              {recommendations.map((item) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border-2 border-orange-200 hover:border-orange-500 transition cursor-pointer group"
                >
                  <div className="text-5xl mb-3 group-hover:scale-110 transition">
                    {item.image}
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm mb-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">{item.reason}</p>
                  <p className="text-orange-600 font-bold">${item.price}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 p-8 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setStep('welcome')}
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-3 rounded-lg transition"
              >
                Back
              </button>
              <button
                onClick={handleStartOrdering}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105"
              >
                Browse Full Menu
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;