// frontend/src/components/customer/OfferBanner/OfferBanner.jsx
import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import OfferCard from './OfferCard';

const OfferBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const carouselRef = useRef(null);
  const [autoPlay, setAutoPlay] = useState(true);

  const offers = [
    {
      id: 1,
      title: '50% OFF',
      subtitle: 'on all pizzas',
      description: 'Valid till midnight',
      color: 'from-red-400 to-red-600',
      icon: '🍕',
    },
    {
      id: 2,
      title: 'BUY 1 GET 1',
      subtitle: 'on beverages',
      description: 'Limited time offer',
      color: 'from-blue-400 to-blue-600',
      icon: '☕',
    },
    {
      id: 3,
      title: '30% OFF',
      subtitle: 'on desserts',
      description: 'Every Sunday',
      color: 'from-pink-400 to-pink-600',
      icon: '🍰',
    },
    {
      id: 4,
      title: 'FREE DELIVERY',
      subtitle: 'orders above $25',
      description: 'Use code SAVE25',
      color: 'from-green-400 to-green-600',
      icon: '🚀',
    },
  ];

  useGSAP(
    () => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      );
    },
    { revertOnUpdate: true }
  );

  // Auto slide
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, currentIndex]);

  const handleNext = () => {
    gsap.to(carouselRef.current, {
      opacity: 0.5,
      x: 20,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setCurrentIndex((prev) => (prev + 1) % offers.length);
        gsap.to(carouselRef.current, {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      },
    });
  };

  const handlePrev = () => {
    gsap.to(carouselRef.current, {
      opacity: 0.5,
      x: -20,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
        gsap.to(carouselRef.current, {
          opacity: 1,
          x: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      },
    });
  };

  const currentOffer = offers[currentIndex];

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      {/* Carousel */}
      <div
        ref={carouselRef}
        className={`bg-gradient-to-r ${currentOffer.color} text-white p-8 md:p-12 relative overflow-hidden transition-all`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white opacity-20" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{currentOffer.icon}</span>
            <Zap size={24} className="text-yellow-300" />
          </div>

          <h2 className="text-4xl md:text-5xl font-black mb-2">
            {currentOffer.title}
          </h2>

          <p className="text-xl md:text-2xl font-semibold opacity-90 mb-2">
            {currentOffer.subtitle}
          </p>

          <p className="text-sm md:text-base opacity-80 mb-6">
            {currentOffer.description}
          </p>

          <button className="bg-white text-gray-800 px-6 py-2 rounded-lg font-bold hover:shadow-lg transition transform hover:scale-105">
            Claim Offer
          </button>
        </div>

        {/* Decorative shapes */}
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-6">
        {/* Left Arrow */}
        <button
          onClick={() => {
            handlePrev();
            setAutoPlay(false);
            setTimeout(() => setAutoPlay(true), 10000);
          }}
          className="bg-gray-100 hover:bg-orange-500 hover:text-white p-2 rounded-full transition transform hover:scale-110"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Indicators */}
        <div className="flex items-center gap-2">
          {offers.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setAutoPlay(false);
                setTimeout(() => setAutoPlay(true), 10000);
              }}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-orange-500 w-8'
                  : 'bg-gray-300 w-2'
              }`}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => {
            handleNext();
            setAutoPlay(false);
            setTimeout(() => setAutoPlay(true), 10000);
          }}
          className="bg-gray-100 hover:bg-orange-500 hover:text-white p-2 rounded-full transition transform hover:scale-110"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Current offer counter */}
      <div className="border-t border-gray-200 px-6 py-3 text-xs text-gray-600 text-center">
        Offer {currentIndex + 1} of {offers.length}
      </div>
    </div>
  );
};

export default OfferBanner;