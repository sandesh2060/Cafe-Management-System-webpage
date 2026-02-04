// frontend/src/components/common/Navbar/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Home,
  History,
  Gift,
  Bell,
  LogOut,
  Settings,
  Heart,
  Search,
} from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const menuRef = useRef(null);

  const { totalItems } = useSelector((state) => state.cart || { totalItems: 0 });
  const { user, isAuthenticated } = useSelector((state) => state.auth || { user: null, isAuthenticated: false });
  const { tableNumber } = useSelector((state) => state.session || { tableNumber: null });

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useGSAP(
    () => {
      gsap.fromTo(
        navRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
    },
    { dependencies: [] }
  );

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigationItems = [
    { name: 'Menu', path: '/customer/menu', icon: Home },
    { name: 'Tracking', path: '/customer/order-tracking', icon: Bell },
    { name: 'History', path: '/customer/order-history', icon: History },
    { name: 'Loyalty', path: '/customer/loyalty', icon: Gift },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      ref={navRef}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg'
          : 'bg-white shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            onClick={() => navigate('/customer/menu')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-white font-black text-2xl">C</span>
              </div>
              {tableNumber && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                  #{tableNumber}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-orange-600 via-rose-600 to-pink-600 bg-clip-text text-transparent">
                CafeHub
              </h1>
              {tableNumber && (
                <p className="text-xs text-gray-500 font-bold">
                  Table {tableNumber}
                </p>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`group relative flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive(item.path) ? '' : 'group-hover:scale-110'
                    }`}
                  />
                  <span>{item.name}</span>
                  {isActive(item.path) && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search (Desktop only) */}
            <button className="hidden lg:flex items-center justify-center w-11 h-11 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110">
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate('/customer/cart')}
              className="relative group flex items-center justify-center w-11 h-11 text-gray-700 hover:bg-orange-100 rounded-xl transition-all duration-300 hover:scale-110"
            >
              <ShoppingCart className="w-6 h-6 group-hover:text-orange-600 transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-rose-600 text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-sm">
                      {user?.name?.[0]?.toUpperCase() || 'G'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-bold text-gray-700">
                    {user?.name || 'Guest'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-rose-600 p-4 text-white">
                      <p className="font-black text-lg">{user?.name || 'Guest'}</p>
                      <p className="text-xs text-orange-100">{user?.email || 'guest@cafehub.com'}</p>
                    </div>
                    <div className="p-2">
                      {[
                        { icon: User, label: 'Profile', path: '/customer/profile' },
                        { icon: Heart, label: 'Favorites', path: '/customer/favorites' },
                        { icon: Settings, label: 'Settings', path: '/customer/settings' },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            navigate(item.path);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 font-semibold"
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={() => {
                          // Handle logout
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-red-600 font-semibold"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="hidden md:block px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-bold hover:scale-105"
              >
                Login
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
            {!isAuthenticated && (
              <button
                onClick={() => {
                  navigate('/login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-rose-600 text-white rounded-xl font-bold shadow-lg"
              >
                Login
              </button>
            )}
          </nav>
        </div>
      )}
    </nav>
  );
};

export default Navbar;