// frontend/src/components/customer/DiscountSection/DiscountSection.jsx
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Percent, Clock, MapPin, Users } from 'lucide-react';
import DiscountCard from './DiscountCard';

const DiscountSection = () => {
  const containerRef = useRef(null);
  const cardsRef = useRef(null);

  const discounts = [
    {
      id: 1,
      title: '20% OFF Appetizers',
      description: 'All appetizers with code SAVE20',
      discount: '20%',
      expiresIn: '2 days',
      minOrder: '$15',
      applicable: true,
      color: 'from-blue-400 to-blue-600',
    },
    {
      id: 2,
      title: 'Buy 1 Get 1 Beverages',
      description: 'Get free beverage on every drink purchase',
      discount: '50%',
      expiresIn: '5 days',
      minOrder: 'None',
      applicable: false,
      color: 'from-purple-400 to-purple-600',
    },
    {
      id: 3,
      title: 'Free Delivery',
      description: 'Orders above $25, use code FREEDEL',
      discount: 'FREE',
      expiresIn: '7 days',
      minOrder: '$25',
      applicable: true,
      color: 'from-green-400 to-green-600',
    },
    {
      id: 4,
      title: 'Sunday Special',
      description: '30% off all main courses',
      discount: '30%',
      expiresIn: '4 days',
      minOrder: '$20',
      applicable: false,
      color: 'from-pink-400 to-pink-600',
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
        cardsRef.current?.children,
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
        <Percent size={28} className="text-blue-500" />
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Special Discounts</h2>
          <p className="text-sm text-gray-600">Exclusive offers just for you</p>
        </div>
      </div>

      <div
        ref={cardsRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {discounts.map((discount) => (
          <DiscountCard key={discount.id} discount={discount} />
        ))}
      </div>

      {/* How to Use */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
        <h3 className="font-bold text-blue-900 text-lg">How to use discounts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <div className="text-2xl">1️⃣</div>
            <div>
              <p className="font-bold text-blue-900 text-sm">Choose Offer</p>
              <p className="text-xs text-blue-800">Select a discount that suits you</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">2️⃣</div>
            <div>
              <p className="font-bold text-blue-900 text-sm">Add to Cart</p>
              <p className="text-xs text-blue-800">Add qualifying items to your cart</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">3️⃣</div>
            <div>
              <p className="font-bold text-blue-900 text-sm">Apply Code</p>
              <p className="text-xs text-blue-800">Enter promo code at checkout</p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="text-xs text-gray-600 space-y-1">
        <p>
          <span className="font-bold">Terms:</span> Discounts cannot be combined. Valid for dine-in orders only. Subject to availability.
        </p>
        <p>
          <span className="font-bold">Support:</span> Questions? Contact our customer service team.
        </p>
      </div>
    </div>
  );
};

export default DiscountSection;