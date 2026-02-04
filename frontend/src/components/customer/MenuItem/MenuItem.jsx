// frontend/src/components/customer/MenuItem/MenuItem.jsx
import React, { useState, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ShoppingCart, Heart, Flame, Star } from 'lucide-react'
import MenuItemDetails from './MenuItemDetails'

const MenuItem = ({ item, onAddToCart }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const cardRef = useRef(null)
  const imageRef = useRef(null)

  useGSAP(
    () => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'back.out(1.5)',
        }
      )
    },
    { scope: cardRef }
  )

  const handleFavorite = (e) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)

    gsap.timeline()
      .to(e.currentTarget, {
        scale: 1.3,
        duration: 0.2,
        ease: 'back.out(3)',
      })
      .to(e.currentTarget, {
        scale: 1,
        duration: 0.3,
        ease: 'elastic.out(1, 0.5)',
      })
  }

  const handleCardClick = () => {
    gsap.to(cardRef.current, {
      scale: 0.98,
      duration: 0.15,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(cardRef.current, {
          scale: 1,
          duration: 0.15,
        })
        setShowDetails(true)
      },
    })
  }

  const handleHover = () => {
    gsap.to(imageRef.current, {
      scale: 1.1,
      rotation: 5,
      duration: 0.4,
      ease: 'power2.out',
    })
  }

  const handleHoverLeave = () => {
    gsap.to(imageRef.current, {
      scale: 1,
      rotation: 0,
      duration: 0.4,
      ease: 'power2.out',
    })
  }

  return (
    <>
      <div
        ref={cardRef}
        onClick={handleCardClick}
        onMouseEnter={handleHover}
        onMouseLeave={handleHoverLeave}
        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300 cursor-pointer group border border-gray-100"
      >
        {/* Image Container */}
        <div className="relative bg-gradient-to-br from-orange-50 to-red-50 h-56 flex items-center justify-center overflow-hidden">
          <div ref={imageRef} className="transform-gpu">
            <span className="text-9xl">{item.image}</span>
          </div>

          {/* Popular Badge */}
          {item.popular && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-lg">
              <Flame size={14} />
              Popular
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm hover:bg-white p-2.5 rounded-full transition-all shadow-lg"
          >
            <Heart
              size={20}
              className={`transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
              }`}
            />
          </button>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-1">
            {item.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
            {item.desc}
          </p>

          {/* Rating */}
          {item.rating && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold text-gray-800">
                  {item.rating}
                </span>
              </div>
              <span className="text-xs text-gray-500">({item.reviews} reviews)</span>
            </div>
          )}

          {/* Price and Button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Price</p>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                ${item.price}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                gsap.timeline()
                  .to(e.currentTarget, {
                    scale: 0.9,
                    duration: 0.1,
                  })
                  .to(e.currentTarget, {
                    scale: 1,
                    duration: 0.2,
                    ease: 'back.out(3)',
                  })
                onAddToCart(item)
              }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <MenuItemDetails
          item={item}
          onClose={() => setShowDetails(false)}
          onAddToCart={onAddToCart}
        />
      )}
    </>
  )
}

export default MenuItem