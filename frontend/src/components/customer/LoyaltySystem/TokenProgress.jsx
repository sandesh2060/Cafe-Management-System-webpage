// frontend/src/components/customer/LoyaltySystem/TokenProgress.jsx
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { TrendingUp, Gift, Target } from 'lucide-react';

const TokenProgress = ({ currentTokens = 2850, targetTokens = 5000 }) => {
  const progressRef = useRef(null);
  const containerRef = useRef(null);

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

      // Animate progress bar on mount
      gsap.to(progressRef.current, {
        width: `${(currentTokens / targetTokens) * 100}%`,
        duration: 1.2,
        ease: 'power2.out',
      });
    },
    { revertOnUpdate: true }
  );

  const percentage = (currentTokens / targetTokens) * 100;
  const remaining = targetTokens - currentTokens;

  const milestones = [
    { tokens: 1000, reward: '🍕 Free Pizza', reached: currentTokens >= 1000 },
    { tokens: 2500, reward: '🐟 Grilled Salmon', reached: currentTokens >= 2500 },
    { tokens: 5000, reward: '🍰 Free Dessert', reached: currentTokens >= 5000 },
    { tokens: 7500, reward: '💎 Exclusive Meal', reached: currentTokens >= 7500 },
  ];

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp size={20} className="text-orange-500" />
            Token Progress
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            You're {percentage.toFixed(1)}% towards your reward
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-orange-600">{currentTokens}</p>
          <p className="text-xs text-gray-600">/{targetTokens} tokens</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-semibold text-gray-700">
          <span>Progress</span>
          <span>{remaining} tokens to go</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            ref={progressRef}
            className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500 shadow-lg"
            style={{
              boxShadow: '0 0 10px rgba(249, 115, 22, 0.5)',
            }}
          />
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-3">
        <h4 className="font-bold text-gray-800 flex items-center gap-2">
          <Gift size={18} className="text-green-500" />
          Reward Milestones
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {milestones.map((milestone, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border-2 transition-all ${
                milestone.reached
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-sm font-bold text-gray-800">
                  {milestone.tokens}
                </span>
                {milestone.reached && (
                  <span className="text-xs font-bold text-green-600">✓</span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {milestone.reward}
              </p>
              {!milestone.reached && (
                <p className="text-xs text-gray-600 mt-1">
                  {milestone.tokens - currentTokens} away
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* How to earn */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <h4 className="font-bold text-blue-900 text-sm flex items-center gap-2">
          <Target size={16} />
          How to Earn Tokens
        </h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• 1 token = $1 spent</li>
          <li>• Bonus tokens on weekends</li>
          <li>• Double points on special promotions</li>
          <li>• Birthday bonus: 50 extra tokens</li>
        </ul>
      </div>
    </div>
  );
};

export default TokenProgress;