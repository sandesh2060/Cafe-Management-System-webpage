// frontend/src/components/customer/OfferBanner/OfferCard.jsx
import React, { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Tag, Clock } from 'lucide-react'

const OfferCard = ({ offer, onClaim }) => {
  const cardRef = useRef(null)

  useGSAP(
    () => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          ease: 'back.out(1.5)',
        }
      )
    },
    { scope: cardRef }
  )

  const handleClaim = () => {
    gsap.timeline()
      .to(cardRef.current, {
        scale: 0.95,
        duration: 0.15,
        ease: 'power2.in',
      })
      .to(cardRef.current, {
        scale: 1,
        duration: 0.3,
        ease: 'back.out(2)',
        onComplete: () => onClaim && onClaim(offer),
      })
  }

  return (
    <div
      ref={cardRef}
      className={`bg-gradient-to-br ${offer.color} text-white rounded-xl p-4 relative overflow-hidden group cursor-pointer`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white opacity-20" />
      </div>

      <div className="relative z-10 space-y-3">
        {/* Icon and Tag */}
        <div className="flex items-center justify-between">
          <span className="text-4xl">{offer.icon}</span>
          <div className="bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
            <Tag size={12} />
            <span className="text-xs font-bold">HOT</span>
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-2xl font-black">{offer.title}</h3>
          <p className="text-sm opacity-90">{offer.subtitle}</p>
        </div>

        {/* Description and Expiry */}
        <div className="text-xs opacity-75 flex items-center gap-1">
          <Clock size={12} />
          {offer.expiry || 'Limited time'}
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          className="w-full bg-white text-gray-800 font-bold py-2 rounded-lg hover:shadow-lg transition transform hover:scale-105 text-sm"
        >
          Claim Now
        </button>
      </div>

      {/* Hover glow effect */}
      <div className="absolute -right-10 -top-10 w-20 h-20 bg-white/10 rounded-full group-hover:scale-150 transition duration-500" />
    </div>
  )
}

export default OfferCard