// frontend/src/components/customer/LoyaltySystem/LoyaltyCard.jsx
import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Gift, Zap, TrendingUp } from 'lucide-react';

const LoyaltyCard = ({ userId = 'CUST-12345', points = 2850, tier = 'Gold' }) => {
  const cardRef = useRef(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useGSAP(
    () => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, rotateY: -90 },
        {
          opacity: 1,
          rotateY: 0,
          duration: 0.8,
          ease: 'power2.out',
        }
      );
    },
    { revertOnUpdate: true }
  );

  const handleFlip = () => {
    gsap.to(cardRef.current, {
      rotateY: isFlipped ? 0 : 180,
      duration: 0.6,
      ease: 'back.out',
    });
    setIsFlipped(!isFlipped);
  };

  const tierColors = {
    Bronze: { bg: 'from-yellow-600 to-red-700', badge: 'bg-yellow-600' },
    Silver: { bg: 'from-gray-400 to-gray-600', badge: 'bg-gray-500' },
    Gold: { bg: 'from-yellow-400 to-orange-500', badge: 'bg-yellow-500' },
    Platinum: { bg: 'from-purple-500 to-pink-500', badge: 'bg-purple-600' },
  };

  const tierData = tierColors[tier] || tierColors.Bronze;
  const nextTierPoints = 5000;
  const progressPercent = (points / nextTierPoints) * 100;

  return (
    <div className="perspective">
      <div
        ref={cardRef}
        onClick={handleFlip}
        className={`relative w-full max-w-md h-64 rounded-2xl shadow-2xl cursor-pointer transition-all ${
          isFlipped ? 'bg-gray-800' : `bg-gradient-to-br ${tierData.bg}`
        } text-white p-6 flex flex-col justify-between overflow-hidden`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white opacity-20" />
        </div>

        {!isFlipped ? (
          <>
            {/* Front Side */}
            <div className="relative z-10 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold opacity-80">
                    Loyalty Card
                  </p>
                  <h2 className="text-2xl font-bold">Rewards Member</h2>
                </div>
                <div className={`${tierData.badge} px-3 py-1 rounded-full text-xs font-bold`}>
                  {tier}
                </div>
              </div>

              {/* Points Display */}
              <div className="space-y-2">
                <p className="text-sm opacity-80">Total Points</p>
                <p className="text-4xl font-bold">{points}</p>
              </div>

              {/* Member ID */}
              <div className="space-y-1 border-t border-white/20 pt-4">
                <p className="text-xs opacity-80">Member ID</p>
                <p className="font-mono text-sm font-bold tracking-widest">
                  {userId}
                </p>
              </div>
            </div>

            {/* Corner Badge */}
            <div className="absolute top-4 right-4 z-10">
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                <Zap size={14} />
                Active
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Back Side - Tap to see details */}
            <div className="relative z-10 space-y-4 h-full flex flex-col justify-center">
              <h3 className="text-lg font-bold">Rewards Info</h3>

              {/* Progress to next tier */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="opacity-80">Progress to Next Tier</span>
                  <span className="font-bold">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs opacity-80 mt-2">
                  {nextTierPoints - points} points to next tier
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-2 text-sm">
                <p className="font-bold opacity-80">Your Benefits:</p>
                <ul className="space-y-1 text-xs">
                  <li>✓ 1 point per $1 spent</li>
                  <li>✓ 10% bonus on special days</li>
                  <li>✓ Free item redemption</li>
                  <li>✓ Birthday rewards</li>
                </ul>
              </div>

              <p className="text-xs opacity-60 mt-auto">
                Tap to see card details
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoyaltyCard;