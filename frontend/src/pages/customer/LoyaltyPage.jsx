// frontend/src/pages/customer/LoyaltyPage.jsx
import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LoyaltyCard from '@/components/customer/LoyaltySystem/LoyaltyCard';
import TokenProgress from '@/components/customer/LoyaltySystem/TokenProgress';
import { Gift, TrendingUp, Zap, Users } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const LoyaltyPage = () => {
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const sectionsRef = useRef(null);
  const statsRef = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      // Header animate
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      );

      // Stats cards
      tl.fromTo(
        statsRef.current?.children,
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

      // Sections
      gsap.fromTo(
        sectionsRef.current?.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionsRef.current,
            start: 'top center+=100',
          },
        }
      );
    },
    { revertOnUpdate: true }
  );

  const stats = [
    { icon: <TrendingUp size={24} />, label: 'Points Earned', value: '2,850' },
    { icon: <Gift size={24} />, label: 'Rewards Redeemed', value: '12' },
    { icon: <Zap size={24} />, label: 'Current Tier', value: 'Gold' },
    { icon: <Users size={24} />, label: 'Member Since', value: '2 Years' },
  ];

  const rewardHistory = [
    { id: 1, item: 'Free Pizza', points: 5000, date: 'Jan 15, 2025', redeemed: true },
    { id: 2, item: 'Grilled Salmon', points: 2500, date: 'Jan 20, 2025', redeemed: true },
    { id: 3, item: 'Free Dessert', points: 5000, date: 'Feb 1, 2025', redeemed: false },
  ];

  const tierBenefits = [
    {
      tier: 'Bronze',
      points: '0-999',
      benefits: ['1 point per $1', 'Birthday bonus', 'Email promotions'],
      color: 'from-yellow-600 to-red-700',
    },
    {
      tier: 'Silver',
      points: '1000-2499',
      benefits: ['1.25 points per $1', 'Exclusive deals', 'Priority support'],
      color: 'from-gray-400 to-gray-600',
    },
    {
      tier: 'Gold',
      points: '2500-4999',
      benefits: ['1.5 points per $1', 'Free items', 'VIP seating'],
      color: 'from-yellow-400 to-orange-500',
      current: true,
    },
    {
      tier: 'Platinum',
      points: '5000+',
      benefits: ['2 points per $1', 'All benefits +', 'Personal concierge'],
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-orange-50 to-white"
    >
      {/* Header */}
      <div ref={headerRef} className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12 shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Loyalty Program</h1>
          <p className="text-orange-100">
            Earn points, unlock rewards, and enjoy exclusive benefits
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Stats Cards */}
        <div
          ref={statsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="text-orange-500">{stat.icon}</div>
                <p className="text-gray-600 text-xs font-semibold uppercase">
                  {stat.label}
                </p>
              </div>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Sections */}
        <div ref={sectionsRef} className="space-y-12">
          {/* Loyalty Card and Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LoyaltyCard userId="CUST-12345" points={2850} tier="Gold" />
            <TokenProgress currentTokens={2850} targetTokens={5000} />
          </div>

          {/* Tier Benefits */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Membership Tiers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tierBenefits.map((tier) => (
                <div
                  key={tier.tier}
                  className={`bg-gradient-to-br ${tier.color} text-white rounded-xl p-6 relative overflow-hidden transform transition hover:scale-105 ${
                    tier.current ? 'ring-4 ring-white shadow-2xl' : ''
                  }`}
                >
                  {tier.current && (
                    <div className="absolute top-3 right-3 bg-yellow-300 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                      Current
                    </div>
                  )}

                  <h3 className="text-2xl font-bold mb-2">{tier.tier}</h3>
                  <p className="text-sm opacity-90 mb-4">{tier.points}</p>

                  <ul className="space-y-2 text-sm">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span>✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Reward History */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Reward History
            </h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                      Reward
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                      Points
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rewardHistory.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {item.item}
                      </td>
                      <td className="px-6 py-4 text-orange-600 font-bold">
                        {item.points}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {item.date}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.redeemed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {item.redeemed ? 'Redeemed' : 'Available'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* How to Earn */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">
              How to Earn Points
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl mb-3">💰</div>
                <h3 className="font-bold text-blue-900 mb-2">Spend</h3>
                <p className="text-sm text-blue-800">
                  Earn 1 point for every $1 spent on food
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">🎁</div>
                <h3 className="font-bold text-blue-900 mb-2">Bonus Days</h3>
                <p className="text-sm text-blue-800">
                  Double points on weekends and special promotions
                </p>
              </div>
              <div>
                <div className="text-4xl mb-3">🎂</div>
                <h3 className="font-bold text-blue-900 mb-2">Birthday</h3>
                <p className="text-sm text-blue-800">
                  50 bonus points on your birthday month
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPage;