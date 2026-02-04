// frontend/src/components/customer/MenuSection/MenuSection.jsx
import React, { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ChefHat } from 'lucide-react'
import MenuItem from '../MenuItem/MenuItem'

const MenuSection = ({ title, icon, items, onAddItem }) => {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const itemsRef = useRef(null)

  useGSAP(
    () => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      )

      // Items stagger animation
      const items = itemsRef.current?.children
      if (items) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: 'back.out(1.2)',
          }
        )
      }
    },
    { scope: sectionRef, dependencies: [items] }
  )

  return (
    <div ref={sectionRef} className="mb-16">
      {/* Section Title */}
      <div ref={titleRef} className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500">{items.length} items available</p>
        </div>
      </div>

      {/* Items Grid */}
      <div
        ref={itemsRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {items.map((item) => (
          <MenuItem key={item.id} item={item} onAddToCart={onAddItem} />
        ))}
      </div>
    </div>
  )
}

export default MenuSection