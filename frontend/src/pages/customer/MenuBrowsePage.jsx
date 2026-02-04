// frontend/src/pages/customer/MenuBrowsePage.jsx
import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { 
  ArrowLeft, 
  ShoppingCart, 
  Search, 
  Star,
  Flame,
  Leaf,
  Clock
} from 'lucide-react'
import { useSession } from '../../hooks/common/useSession'

const MenuBrowsePage = () => {
  const { tableNumber, activeSession } = useSession()
  const navigate = useNavigate()
  const headerRef = useRef(null)
  const contentRef = useRef(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.fromTo(
      headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6 }
    )

    tl.fromTo(
      contentRef.current?.children || [],
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
      0.3
    )
  }, [])

  // Redirect if no session
  React.useEffect(() => {
    if (!activeSession || !tableNumber) {
      navigate('/', { replace: true })
    }
  }, [activeSession, tableNumber, navigate])

  const menuCategories = [
    { id: 1, name: 'Appetizers', count: 12, icon: '🥗', color: 'bg-green-100' },
    { id: 2, name: 'Main Course', count: 24, icon: '🍝', color: 'bg-orange-100' },
    { id: 3, name: 'Desserts', count: 15, icon: '🍰', color: 'bg-pink-100' },
    { id: 4, name: 'Beverages', count: 18, icon: '🥤', color: 'bg-blue-100' },
  ]

  const featuredItems = [
    {
      id: 1,
      name: 'Truffle Pasta',
      price: 24.99,
      image: '🍝',
      rating: 4.8,
      isVeg: true,
      isSpicy: false,
      prepTime: '15 min'
    },
    {
      id: 2,
      name: 'Grilled Salmon',
      price: 32.99,
      image: '🐟',
      rating: 4.9,
      isVeg: false,
      isSpicy: false,
      prepTime: '20 min'
    },
    {
      id: 3,
      name: 'Spicy Thai Curry',
      price: 18.99,
      image: '🍛',
      rating: 4.7,
      isVeg: true,
      isSpicy: true,
      prepTime: '18 min'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header 
        ref={headerRef}
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Menu</h1>
                <p className="text-sm text-gray-600">Table {tableNumber}</p>
              </div>
            </div>
            <button className="relative p-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition">
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                0
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search menu items..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div ref={contentRef} className="space-y-8">
          {/* Categories */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {menuCategories.map((category) => (
                <button
                  key={category.id}
                  className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition group"
                >
                  <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center text-3xl mb-3 mx-auto group-hover:scale-110 transition`}>
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.count} items</p>
                </button>
              ))}
            </div>
          </section>

          {/* Featured Items */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Featured Items</h2>
              <button className="text-orange-500 font-medium hover:text-orange-600">
                View All
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden group cursor-pointer"
                >
                  <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-6xl group-hover:scale-105 transition">
                    {item.image}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-500 transition">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {item.isVeg && (
                            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              <Leaf size={12} />
                              Veg
                            </span>
                          )}
                          {item.isSpicy && (
                            <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                              <Flame size={12} />
                              Spicy
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-900">{item.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-xl font-bold text-orange-500">${item.price}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {item.prepTime}
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default MenuBrowsePage