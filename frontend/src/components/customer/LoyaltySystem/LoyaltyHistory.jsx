// frontend/src/components/customer/LoyaltySystem/LoyaltyHistory.jsx
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, Gift, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const LoyaltyHistory = () => {
  const containerRef = useRef(null);
  const historyRef = useRef(null);

  const transactions = [
    {
      id: 1,
      type: 'earn',
      description: 'Order completed',
      points: 50,
      detail: 'Margherita Pizza x2',
      date: 'Today at 2:30 PM',
      icon: <Plus size={20} />,
      color: 'text-green-600 bg-green-100',
    },
    {
      id: 2,
      type: 'redeem',
      description: 'Free item redeemed',
      points: -1000,
      detail: 'Grilled Salmon',
      date: 'Feb 1, 2025',
      icon: <Gift size={20} />,
      color: 'text-orange-600 bg-orange-100',
    },
    {
      id: 3,
      type: 'earn',
      description: 'Double points day',
      points: 100,
      detail: 'Order completed',
      date: 'Jan 28, 2025',
      icon: <Zap size={20} />,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      id: 4,
      type: 'earn',
      description: 'Order completed',
      points: 42,
      detail: 'Spaghetti & Beverages',
      date: 'Jan 25, 2025',
      icon: <Plus size={20} />,
      color: 'text-green-600 bg-green-100',
    },
    {
      id: 5,
      type: 'redeem',
      description: 'Free item redeemed',
      points: -2500,
      detail: 'Exclusive Meal',
      date: 'Jan 20, 2025',
      icon: <Gift size={20} />,
      color: 'text-orange-600 bg-orange-100',
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
        historyRef.current?.children,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: historyRef.current,
            start: 'top center+=100',
          },
        }
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
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Transaction History</h2>
          <p className="text-sm text-gray-600">Track your loyalty points activity</p>
        </div>
        <button className="text-orange-600 hover:text-orange-700 font-bold text-sm">
          View All →
        </button>
      </div>

      <div ref={historyRef} className="space-y-3">
        {transactions.map((tx, idx) => (
          <div
            key={tx.id}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition relative"
          >
            {/* Connector Line */}
            {idx < transactions.length - 1 && (
              <div className="absolute left-8 top-full h-3 w-0.5 bg-gradient-to-b from-orange-300 to-transparent" />
            )}

            {/* Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${tx.color}`}>
              {tx.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-gray-800">{tx.description}</h4>
                <span
                  className={`font-bold text-lg ${
                    tx.type === 'earn'
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }`}
                >
                  {tx.type === 'earn' ? '+' : ''}
                  {tx.points}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{tx.detail}</p>
              <p className="text-xs text-gray-500">{tx.date}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-6">
        <h3 className="font-bold text-gray-800 mb-4">Your Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Points Earned</p>
            <p className="text-2xl font-bold text-green-600">+3,642</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Points Redeemed</p>
            <p className="text-2xl font-bold text-orange-600">-3,500</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-gray-800">2,850</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyHistory;