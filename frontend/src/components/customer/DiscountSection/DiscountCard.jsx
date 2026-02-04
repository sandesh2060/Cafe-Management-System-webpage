// frontend/src/components/customer/DiscountSection/DiscountCard.jsx
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Clock, Check, Lock } from 'lucide-react';

const DiscountCard = ({ discount }) => {
  const cardRef = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'back.out',
        }
      );
    },
    { revertOnUpdate: true }
  );

  const handleApply = () => {
    gsap.to(cardRef.current, {
      scale: 0.95,
      duration: 0.2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    });
  };

  return (
    <div
      ref={cardRef}
      className={`bg-gradient-to-br ${discount.color} text-white rounded-xl p-4 relative overflow-hidden group cursor-pointer transition-all hover:shadow-lg`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white opacity-20" />
      </div>

      <div className="relative z-10 space-y-3">
        {/* Header with Discount Badge */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">{discount.title}</h3>
            <p className="text-xs opacity-90 line-clamp-2">
              {discount.description}
            </p>
          </div>

          {/* Big Discount Badge */}
          <div className="text-center bg-white/20 px-3 py-1 rounded-lg flex-shrink-0">
            <p className="font-black text-xl text-white">{discount.discount}</p>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white/20 rounded-lg p-2 space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>Expires in {discount.expiresIn}</span>
          </div>
          <div>
            <span>Min order: {discount.minOrder}</span>
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApply}
          disabled={!discount.applicable}
          className={`w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition transform hover:scale-105 ${
            discount.applicable
              ? 'bg-white text-gray-800 hover:shadow-lg'
              : 'bg-white/30 text-white cursor-not-allowed'
          }`}
        >
          {discount.applicable ? (
            <>
              <Check size={16} />
              Apply
            </>
          ) : (
            <>
              <Lock size={16} />
              Unavailable
            </>
          )}
        </button>
      </div>

      {/* Hover glow */}
      <div className="absolute -right-10 -top-10 w-20 h-20 bg-white/10 rounded-full group-hover:scale-150 transition duration-500" />
    </div>
  );
};

export default DiscountCard;