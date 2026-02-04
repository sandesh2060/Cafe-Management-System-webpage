// frontend/src/components/customer/TableOrder/MenuBrowse.jsx
import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Filter, Flame } from 'lucide-react';
import MenuSection from '../MenuSection/MenuSection';

gsap.registerPlugin(ScrollTrigger);

const MenuBrowse = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const categoriesRef = useRef(null);

  const categories = [
    { id: 'all', name: 'All Items', count: 45 },
    { id: 'appetizers', name: 'Appetizers', count: 12 },
    { id: 'mains', name: 'Mains', count: 18 },
    { id: 'desserts', name: 'Desserts', count: 8 },
    { id: 'beverages', name: 'Beverages', count: 7 },
  ];

  const menuItems = [
    // Appetizers
    { id: 1, name: 'Crispy Spring Rolls', category: 'appetizers', price: 4.99, image: '🥟', popular: true, desc: 'Golden and crispy' },
    { id: 2, name: 'Garlic Bread', category: 'appetizers', price: 3.99, image: '🍞', popular: false, desc: 'Fresh baked' },
    // Mains
    { id: 3, name: 'Margherita Pizza', category: 'mains', price: 12.99, image: '🍕', popular: true, desc: 'Classic favorite' },
    { id: 4, name: 'Grilled Salmon', category: 'mains', price: 18.99, image: '🐟', popular: true, desc: 'Fresh catch' },
    { id: 5, name: 'Spaghetti Carbonara', category: 'mains', price: 14.99, image: '🍝', popular: false, desc: 'Creamy pasta' },
    // Desserts
    { id: 6, name: 'Chocolate Cake', category: 'desserts', price: 6.99, image: '🍰', popular: true, desc: 'Rich & moist' },
    { id: 7, name: 'Ice Cream', category: 'desserts', price: 4.99, image: '🍦', popular: false, desc: 'Multiple flavors' },
    // Beverages
    { id: 8, name: 'Fresh Juice', category: 'beverages', price: 2.99, image: '🧃', popular: false, desc: 'Freshly squeezed' },
    { id: 9, name: 'Iced Coffee', category: 'beverages', price: 3.99, image: '☕', popular: true, desc: 'Cold brew' },
  ];

  // Smooth scroll animations
  useGSAP(
    () => {
      const tl = gsap.timeline();

      // Container fade in
      tl.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        }
      );

      // Categories slide in
      tl.fromTo(
        categoriesRef.current?.children,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out',
        },
        0.2
      );
    },
    { revertOnUpdate: true }
  );

  // ScrollTrigger for menu items
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        ScrollTrigger.create({
          trigger: contentRef.current,
          onEnter: () => {
            gsap.fromTo(
              contentRef.current.querySelectorAll('[data-animate-item]'),
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.05,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: contentRef.current,
                  start: 'top center',
                  end: 'center center',
                  scrub: 0.5,
                },
              }
            );
          },
        });
      }
    });

    return () => ctx.revert();
  }, [selectedCategory]);

  useEffect(() => {
    let filtered = menuItems;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (categoryId) => {
    gsap.to(contentRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setSelectedCategory(categoryId);
      },
    });
  };

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Our Menu</h2>

        {/* Search */}
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-3 text-white/60"
          />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:bg-white/30 transition"
          />
        </div>
      </div>

      {/* Categories */}
      <div
        ref={categoriesRef}
        className="overflow-x-auto flex gap-2 px-6 py-4 border-b border-gray-200"
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name}
            <span className="ml-2 opacity-75">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-3"
      >
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              data-animate-item
              className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer border border-gray-200 hover:border-orange-300"
            >
              {/* Image */}
              <div className="text-4xl flex-shrink-0">{item.image}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {item.name}
                  </h3>
                  {item.popular && (
                    <Flame size={14} className="text-red-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2">{item.desc}</p>
                <p className="text-orange-600 font-bold text-sm">
                  ${item.price}
                </p>
              </div>

              {/* Add Button */}
              <button className="flex-shrink-0 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:shadow-lg transition transform hover:scale-110">
                +
              </button>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-40 text-gray-500">
            <p>No items found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuBrowse;