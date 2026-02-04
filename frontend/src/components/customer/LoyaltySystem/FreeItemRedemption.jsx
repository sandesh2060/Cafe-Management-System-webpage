// frontend/src/components/customer/LoyaltySystem/FreeItemRedemption.jsx
import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Gift, Lock, CheckCircle, ArrowRight } from 'lucide-react';

const FreeItemRedemption = ({ currentTokens = 2850 }) => {
  const [selectedReward, setSelectedReward] = useState(null);
  const containerRef = useRef(null);
  const itemsRef = useRef(null);

  const rewards = [
    {
      id: 1,
      name: 'Margherita Pizza',
      image: '🍕',
      points: 1000,
      description: 'Classic cheese pizza',
      redeemed: true,
    },
    {
      id: 2,
      name: 'Grilled Salmon',
      image: '🐟',
      points: 2500,
      description: 'Fresh grilled salmon',
      redeemed: false,
    },
    {
      id: 3,
      name: 'Chocolate Cake',
      image: '🍰',
      points: 5000,
      description: 'Rich chocolate dessert',
      redeemed: false,
    },
    {
      id: 4,
      name: 'Exclusive Meal',
      image: '👑',
      points: 7500,
      description: 'Premium tasting menu',
      redeemed: false,
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

  const handleRedeemClick = (reward) => {
    if (currentTokens >= reward.points && !reward.redeemed) {
      gsap.to(`[data-reward-id="${reward.id}"]`, {
        scale: 0.95,
        duration: 0.2,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      });
      setSelectedReward(reward);
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl shadow-lg p-8 space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Gift size={28} className="text-yellow-500" />
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Redeem Rewards</h2>
          <p className="text-sm text-gray-600">
            You have {currentTokens.toLocaleString()} points available
          </p>
        </div>
      </div>

      <div
        ref={itemsRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {rewards.map((reward) => {
          const canRedeem = currentTokens >= reward.points && !reward.redeemed;
          const isAvailable = !reward.redeemed;

          return (
            <div
              key={reward.id}
              data-reward-id={reward.id}
              className={`rounded-xl p-4 border-2 transition-all relative overflow-hidden group cursor-pointer ${
                reward.redeemed
                  ? 'bg-gray-100 border-gray-300 opacity-60'
                  : canRedeem
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-500 hover:border-yellow-700 hover:shadow-lg'
                  : 'bg-gray-50 border-gray-300'
              }`}
              onClick={() => handleRedeemClick(reward)}
            >
              {/* Redeemed Badge */}
              {reward.redeemed && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                  <CheckCircle size={14} />
                  Redeemed
                </div>
              )}

              {/* Points Requirement Badge */}
              {!reward.redeemed && !canRedeem && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                  <Lock size={14} />
                  Locked
                </div>
              )}

              {/* Image */}
              <div className="text-6xl mb-3 group-hover:scale-110 transition">
                {reward.image}
              </div>

              {/* Content */}
              <h3 className="font-bold text-gray-800 mb-1">{reward.name}</h3>
              <p className="text-xs text-gray-600 mb-3">{reward.description}</p>

              {/* Points */}
              <div className="bg-white rounded-lg p-2 mb-3 border border-yellow-200">
                <p className="text-center font-bold text-yellow-600">
                  {reward.points.toLocaleString()} pts
                </p>
              </div>

              {/* Button */}
              {reward.redeemed ? (
                <button disabled className="w-full bg-gray-400 text-white font-bold py-2 rounded-lg cursor-not-allowed text-sm">
                  Redeemed
                </button>
              ) : canRedeem ? (
                <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition transform hover:scale-105 text-sm">
                  Redeem
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-600 font-bold py-2 rounded-lg cursor-not-allowed text-sm"
                >
                  <div className="flex items-center justify-center gap-1">
                    <Lock size={14} />
                    {(reward.points - currentTokens).toLocaleString()} more
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Redemption Modal */}
      {selectedReward && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedReward(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Confirm Redemption
            </h3>

            <div className="text-center mb-6">
              <span className="text-6xl">{selectedReward.image}</span>
              <h4 className="text-xl font-bold text-gray-800 mt-4">
                {selectedReward.name}
              </h4>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <span className="font-bold">Points to redeem:</span>{' '}
                {selectedReward.points.toLocaleString()}
              </p>
              <p className="text-sm text-yellow-800 mt-2">
                <span className="font-bold">Points remaining:</span>{' '}
                {(currentTokens - selectedReward.points).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedReward(null)}
                className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-2 rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2">
                <Gift size={18} />
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeItemRedemption;