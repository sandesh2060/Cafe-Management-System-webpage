// File: frontend/src/modules/customer/components/RecommendationsSection.jsx
// ✅ FIX: onAddToCart + onToggleFavorite props now wired from MenuPage
// ✅ FIX: Removed position prop from individual toasts (was causing white overlay)
// ✅ FIX: favorites prop now properly checked with .includes()
// ✅ UI matches MenuCard dark aesthetic exactly
// ✅ Full dark/light mode support via CSS variables
// ✅ Auto-scroll + swipe/drag navigation

import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, Heart, Star, Loader2, Sparkles,
  Flame, Leaf, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from '../../../api/axios';
import { useTheme } from '../../../shared/context/ThemeContext';

// ─────────────────────────────────────────────────────────────────────────────
// PARENT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const RecommendationsSection = ({
  onAddToCart,
  onToggleFavorite,
  favorites = [],
  disabled = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [weather, setWeather]                 = useState(null);
  const [currentSlide, setCurrentSlide]       = useState(0);
  const [isDragging, setIsDragging]           = useState(false);

  const scrollRef  = useRef(null);
  const startXRef  = useRef(0);
  const scrollLRef = useRef(0);
  const dragMoved  = useRef(false);

  const getCustomerId = () => {
    try { return JSON.parse(localStorage.getItem('customerSession'))?.customerId || null; }
    catch { return null; }
  };

  const getUserLocation = () =>
    new Promise(resolve => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        p => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
        () => resolve(null),
        { timeout: 5000, maximumAge: 300000 }
      );
    });

  useEffect(() => {
    (async () => {
      const userId = getCustomerId();
      if (!userId) { setLoading(false); return; }
      try {
        const loc    = await getUserLocation();
        const params = { limit: 10 };
        if (loc) { params.lat = loc.lat; params.lon = loc.lon; }
        const res   = await axios.get(`/recommendations/super-personalized/${userId}`, { params });
        const items = res.recommendations || [];
        if (items.length > 0 && items[0].weather) setWeather(items[0].weather);
        setRecommendations(items);
      } catch (e) {
        console.error('Recommendations fetch error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (recommendations.length <= 1) return;
    const id = setInterval(() => setCurrentSlide(p => (p + 1) % recommendations.length), 4500);
    return () => clearInterval(id);
  }, [recommendations.length]);

  useEffect(() => {
    if (!scrollRef.current || !recommendations.length) return;
    const w = scrollRef.current.scrollWidth / recommendations.length;
    scrollRef.current.scrollTo({ left: w * currentSlide, behavior: 'smooth' });
  }, [currentSlide, recommendations.length]);

  const dragStart = x => {
    setIsDragging(true);
    dragMoved.current  = false;
    startXRef.current  = x - scrollRef.current.offsetLeft;
    scrollLRef.current = scrollRef.current.scrollLeft;
  };
  const dragMove = x => {
    if (!isDragging) return;
    dragMoved.current = true;
    scrollRef.current.scrollLeft = scrollLRef.current - (x - scrollRef.current.offsetLeft - startXRef.current) * 1.5;
  };
  const dragEnd = () => setIsDragging(false);

  const trackView = async id => { try { await axios.post('/recommendations/track-view', { menuItemId: id }); } catch {} };

  const handleCardClick = item => {
    if (dragMoved.current) return;
    const id = item._id || item.id;
    const el = document.querySelector(`[data-menu-item-id="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('recommendation-highlight');
      setTimeout(() => el.classList.remove('recommendation-highlight'), 2000);
    }
    trackView(id);
  };

  if (loading || !recommendations.length) return null;

  const getTitle = () => {
    if (!weather) return 'Recommended for You';
    const { condition, temp, emoji } = weather;
    if (temp < 10)              return `${emoji} Perfect for Cold Weather`;
    if (temp > 30)              return `${emoji} Beat the Heat`;
    if (condition === 'rainy')  return `${emoji} Cozy Rainy Day Picks`;
    if (condition === 'sunny')  return `${emoji} Sunny Day Specials`;
    return `${emoji} Picked Just for You`;
  };

  const titleCls    = 'text-[var(--color-text-primary)]';
  const subCls      = 'text-[var(--color-text-secondary)]';
  const navBtnCls   = isDark
    ? 'bg-[var(--color-bg-elevated)] border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:text-orange-400 hover:border-orange-500'
    : 'bg-white border-orange-200 text-gray-500 hover:text-orange-600 hover:border-orange-400 shadow-sm';
  const dotActiveCls   = 'bg-gradient-to-r from-orange-500 to-red-600 shadow-lg shadow-orange-500/40';
  const dotInactiveCls = isDark ? 'bg-[var(--color-bg-tertiary)] hover:bg-orange-800' : 'bg-orange-200 hover:bg-orange-300';

  return (
    <div className="mb-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className={`text-xl sm:text-2xl font-bold leading-tight ${titleCls}`}>
              {getTitle()}
            </h2>
            {weather && (
              <p className={`text-xs font-semibold mt-0.5 ${subCls}`}>
                {weather.temp}°C · Tailored for today
              </p>
            )}
          </div>
        </div>

        {recommendations.length > 1 && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide(p => (p - 1 + recommendations.length) % recommendations.length)}
              className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${navBtnCls}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide(p => (p + 1) % recommendations.length)}
              className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${navBtnCls}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Cards track ── */}
      <div
        ref={scrollRef}
        onMouseDown={e => dragStart(e.pageX)}
        onMouseMove={e => dragMove(e.pageX)}
        onMouseUp={dragEnd}
        onMouseLeave={dragEnd}
        onTouchStart={e => dragStart(e.touches[0].pageX)}
        onTouchMove={e => dragMove(e.touches[0].pageX)}
        onTouchEnd={dragEnd}
        className={`flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {recommendations.map((item, i) => (
          <RecommendationCard
            key={item._id || item.id || i}
            item={item}
            isDark={isDark}
            // ✅ FIX: Check favorites array properly — favorites is an array of IDs
            isFavorite={Array.isArray(favorites) && favorites.some(
              fav => (fav === (item._id || item.id)) || (fav?._id === (item._id || item.id))
            )}
            onToggleFavorite={onToggleFavorite}
            onAddToCart={onAddToCart}
            onClick={() => handleCardClick(item)}
            disabled={disabled}
          />
        ))}
        <div className="flex-shrink-0 w-2" />
      </div>

      {/* ── Dot nav ── */}
      {recommendations.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {recommendations.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentSlide ? `w-8 h-2.5 ${dotActiveCls}` : `w-2.5 h-2.5 ${dotInactiveCls}`
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const RecommendationCard = ({ item, isDark, isFavorite, onToggleFavorite, onAddToCart, onClick, disabled }) => {
  const [quantity,       setQuantity]       = useState(1);
  const [imageLoaded,    setImageLoaded]     = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFav,  setIsTogglingFav]  = useState(false);
  const [justAdded,      setJustAdded]       = useState(false);

  const itemId = item._id || item.id;

  const handleAddToCart = async e => {
    e.stopPropagation();
    if (isAddingToCart || disabled || !item.available || !onAddToCart) return;
    try {
      setIsAddingToCart(true);
      const result = await onAddToCart(item, quantity);
      if (result?.success !== false) {
        setJustAdded(true);
        // ✅ FIX: No position prop — controlled by ToastContainer in App.jsx
        toast.success(`Added ${quantity}× ${item.name} to cart!`, {
          icon: '🛒',
          autoClose: 2000,
        });
        setQuantity(1);
        setTimeout(() => setJustAdded(false), 2000);
      }
    } catch {
      toast.error('Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleFav = async e => {
    e.stopPropagation();
    if (isTogglingFav || disabled || !onToggleFavorite) return;
    try {
      setIsTogglingFav(true);
      const result = await onToggleFavorite(itemId);
      if (result?.success !== false) {
        // ✅ FIX: No position prop — controlled by ToastContainer in App.jsx
        toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites!', {
          icon: isFavorite ? '💔' : '❤️',
          autoClose: 1500,
        });
      }
    } catch {
      toast.error('Failed to update favorites');
    } finally {
      setIsTogglingFav(false);
    }
  };

  const inc = e => { e.stopPropagation(); if (quantity < 99) setQuantity(q => q + 1); };
  const dec = e => { e.stopPropagation(); if (quantity > 1)  setQuantity(q => q - 1); };

  // ── Theme tokens ──────────────────────────────────────────────
  const cardBg      = isDark
    ? 'bg-[var(--color-bg-elevated)] border-[var(--color-border-primary)]'
    : 'bg-white border-orange-200';

  const imagePlaceholder = isDark ? 'bg-[var(--color-bg-tertiary)]' : 'bg-orange-50';
  const skeletonCls      = 'skeleton';

  const titleCls    = isDark
    ? 'text-[var(--color-text-primary)] group-hover:text-orange-400'
    : 'text-gray-900 group-hover:text-orange-600';
  const catCls      = 'text-[var(--color-text-tertiary)]';
  const descCls     = 'text-[var(--color-text-secondary)]';
  const brandText   = isDark ? 'text-orange-400' : 'text-orange-600';

  const reasonCls   = isDark
    ? 'bg-orange-900/40 text-orange-300 border-orange-800'
    : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200';

  const ratingBg    = isDark
    ? 'bg-[var(--color-bg-elevated)]/90 border-[var(--color-border-primary)]'
    : 'bg-white/95 border-orange-200';
  const ratingTxt   = 'text-[var(--color-text-primary)]';

  const favCls      = isFavorite
    ? 'bg-red-600 text-white scale-110 border-red-700'
    : isDark
      ? 'bg-[var(--color-bg-elevated)]/80 text-[var(--color-text-secondary)] hover:bg-red-600 hover:text-white hover:scale-110 border-[var(--color-border-primary)]'
      : 'bg-white text-gray-500 hover:bg-red-600 hover:text-white hover:scale-110 border-white/50';

  const qtyWrap     = isDark
    ? 'bg-[var(--color-bg-primary)] border-[var(--color-border-primary)]'
    : 'bg-white border-orange-200';
  const qtyBtn      = isDark
    ? 'hover:bg-[var(--color-bg-tertiary)] active:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]'
    : 'hover:bg-orange-50 active:bg-orange-100 text-gray-700';
  const qtyNum      = isDark
    ? 'bg-[var(--color-bg-secondary)]/50 text-[var(--color-text-primary)]'
    : 'bg-orange-50 text-gray-800';

  const cartBtnCls  = justAdded
    ? 'bg-emerald-500 shadow-emerald-500/40'
    : 'bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50';

  const getBadgeCls = type => {
    if (isDark) {
      const m = { spicy: 'bg-red-900/50 text-red-300 border-red-700', veg: 'bg-emerald-900/50 text-emerald-300 border-emerald-700', popular: 'bg-amber-900/50 text-amber-300 border-amber-700', new: 'bg-blue-900/50 text-blue-300 border-blue-700' };
      return m[type] || 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border-primary)]';
    }
    const m = { spicy: 'bg-red-50 text-red-600 border-red-200', veg: 'bg-emerald-50 text-emerald-600 border-emerald-200', popular: 'bg-amber-50 text-amber-600 border-amber-200', new: 'bg-blue-50 text-blue-600 border-blue-200' };
    return m[type] || 'bg-gray-50 text-gray-500 border-gray-200';
  };

  const getBadgeIcon = t => ({ spicy: <Flame className="w-3 h-3" />, veg: <Leaf className="w-3 h-3" />, popular: <Star className="w-3 h-3 fill-current" />, new: <Sparkles className="w-3 h-3" /> }[t]);
  const shimmerVia  = isDark ? 'via-white/10' : 'via-white/30';

  return (
    <div
      onClick={onClick}
      data-menu-item-id={itemId}
      className={`group relative flex-shrink-0 w-[300px] sm:w-[340px] rounded-2xl sm:rounded-3xl overflow-hidden border-2 shadow-custom-md hover:shadow-custom-xl transition-all duration-300 snap-start ${cardBg} ${
        disabled || !item.available ? 'opacity-60' : 'cursor-pointer hover:scale-[1.02]'
      }`}
    >
      {/* ── Image ── */}
      <div className={`relative aspect-[4/3] overflow-hidden ${imagePlaceholder}`}>
        {!imageLoaded && <div className={`absolute inset-0 ${skeletonCls}`} />}
        <img
          src={item.image || '/images/placeholder-food.jpg'}
          alt={item.name}
          onLoad={() => setImageLoaded(true)}
          onError={e => { e.target.src = '/images/placeholder-food.jpg'; setImageLoaded(true); }}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {!item.available && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20">
            <span className="text-white text-lg font-bold px-4 py-2 bg-red-600 rounded-full">Out of Stock</span>
          </div>
        )}

        {/* For You badge */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-30">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl shadow-orange-500/30">
            <Sparkles className="w-3 h-3" />
            For You
          </div>
        </div>

        {/* Badges */}
        {item.badges?.length > 0 && (
          <div className="absolute top-11 sm:top-12 left-2 sm:left-3 flex flex-wrap gap-1.5 z-10">
            {item.badges.slice(0, 2).map((b, i) => (
              <span key={i} className={`px-2 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg flex items-center gap-1 ${getBadgeCls(b)}`}>
                {getBadgeIcon(b)}
                <span className="hidden xs:inline capitalize">{b}</span>
              </span>
            ))}
          </div>
        )}

        {/* Favourite button */}
        <button
          onClick={handleFav}
          disabled={isTogglingFav || disabled}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-2.5 sm:p-3 rounded-full backdrop-blur-md transition-all shadow-lg touch-manipulation z-20 border-2 ${favCls}`}
        >
          {isTogglingFav
            ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            : <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-current' : ''}`} />}
        </button>

        {/* Rating */}
        {item.rating?.average && (
          <div className={`absolute bottom-2 left-2 sm:bottom-3 sm:left-3 px-3 sm:px-4 py-1.5 sm:py-2 ${ratingBg} backdrop-blur-md rounded-full flex items-center gap-1.5 sm:gap-2 shadow-xl border-2 z-10`}>
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-500 text-amber-500" />
            <span className={`font-bold text-xs sm:text-sm ${ratingTxt}`}>{item.rating.average.toFixed(1)}</span>
          </div>
        )}

        {/* Discount */}
        {item.originalPrice > item.price && (
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-600 text-white rounded-full text-xs font-bold shadow-lg z-10">
            SAVE Rs {(item.originalPrice - item.price).toFixed(0)}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-4 sm:p-5 md:p-6">
        <div className="mb-2 sm:mb-3">
          <h3 className={`text-lg sm:text-xl font-bold mb-1 line-clamp-1 transition-colors ${titleCls}`}>
            {item.name}
          </h3>
          <p className={`text-xs sm:text-sm uppercase tracking-wider font-bold ${catCls}`}>
            {item.category}
          </p>
        </div>

        <p className={`text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed ${descCls}`}>
          {item.description || 'A delicious choice crafted just for you'}
        </p>

        {item.recommendationReason && (
          <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold border-2 mb-4 ${reasonCls}`}>
            <Sparkles className="w-3 h-3 flex-shrink-0" />
            <span className="line-clamp-1">{item.recommendationReason.replace(/^[^\s]+\s/, '')}</span>
          </div>
        )}

        {/* Price + Controls */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div>
            <span className={`text-2xl sm:text-3xl font-extrabold ${brandText}`}>
              Rs. {item.price.toFixed(2)}
            </span>
            {item.originalPrice > item.price && (
              <span className={`block text-xs line-through mt-0.5 ${descCls}`}>
                Rs. {item.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Quantity stepper */}
            <div className={`flex items-center border-2 ${qtyWrap} rounded-xl overflow-hidden shadow-sm`}>
              <button
                onClick={dec}
                disabled={quantity <= 1 || disabled || !item.available}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 transition-colors font-bold touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${qtyBtn}`}
              >
                −
              </button>
              <span className={`px-3 sm:px-4 py-1.5 sm:py-2 font-bold min-w-[2.5rem] sm:min-w-[3rem] text-center ${qtyNum}`}>
                {quantity}
              </span>
              <button
                onClick={inc}
                disabled={quantity >= 99 || disabled || !item.available}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 transition-colors font-bold touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed ${qtyBtn}`}
              >
                +
              </button>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || disabled || !item.available}
              className={`p-2.5 sm:p-3 text-white rounded-xl transition-all duration-300 active:scale-95 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${cartBtnCls}`}
            >
              {isAddingToCart
                ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                : justAdded
                  ? <span className="text-base font-bold">✓</span>
                  : <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Shimmer sweep */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${shimmerVia} to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none`} />
    </div>
  );
};

export default RecommendationsSection;