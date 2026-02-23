// File: frontend/src/modules/customer/components/MenuCard.jsx
// ✅ Full Dark Mode Support via [data-theme="dark"] CSS variables
// ✨ Shows "For You" badge on recommended items
// 💰 Currency: Nepali Rupees (Rs)
// ✅ FIX: Removed duplicate useCart() call that was causing white screen flash
//         isInCart and getItemQuantity now received as props from MenuPage

import { useState } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Heart,
  Flame,
  Leaf,
  Star,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTheme } from "../../../shared/context/ThemeContext";

const MenuCard = ({
  item,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  viewMode = "grid",
  disabled = false,
  isRecommended = false,
  // ✅ FIX: These now come from MenuPage via props instead of a local useCart() call.
  // Having useCart() inside every card created N independent hook instances,
  // each calling fetchCart() on mount → N simultaneous API calls + retryCount
  // loop → white screen.
  isInCart,
  getItemQuantity,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const itemId = item._id || item.id;

  // ✅ Use the passed-in functions (from parent's single useCart instance)
  const itemInCart = isInCart ? isInCart(itemId) : false;
  const cartQuantity = getItemQuantity ? getItemQuantity(itemId) : 0;

  const handleAddToCart = async () => {
    if (isAddingToCart || disabled || !item.available) return;
    try {
      setIsAddingToCart(true);
      const result = await onAddToCart(item, quantity);
      if (result?.success !== false) {
        toast.success(`Added ${quantity}x ${item.name} to cart!`, {
          icon: "🛒",
          position: "bottom-center",
          autoClose: 2000,
        });
        setQuantity(1);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add item to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    if (isTogglingFavorite || disabled) return;
    try {
      setIsTogglingFavorite(true);
      const result = await onToggleFavorite(itemId);
      if (result?.success !== false) {
        toast.success(
          isFavorite ? "Removed from favorites" : "Added to favorites!",
          {
            icon: isFavorite ? "💔" : "❤️",
            autoClose: 1500,
            position: "bottom-center",
          },
        );
      }
    } catch (error) {
      console.error("Toggle favorite error:", error);
      toast.error("Failed to update favorites");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleIncrement = () => {
    if (quantity >= 99) {
      toast.warning("Maximum quantity is 99");
      return;
    }
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity <= 1) return;
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  // ── Badge helpers ──────────────────────────────────────────────
  const getBadgeColor = (type) => {
    if (isDark) {
      const colors = {
        spicy: "bg-red-900/50 text-red-300 border-red-700",
        veg: "bg-emerald-900/50 text-emerald-300 border-emerald-700",
        popular: "bg-amber-900/50 text-amber-300 border-amber-700",
        new: "bg-blue-900/50 text-blue-300 border-blue-700",
      };
      return (
        colors[type] ||
        "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border-primary)]"
      );
    }
    const colors = {
      spicy: "bg-error-light text-error border-error",
      veg: "bg-success-light text-success border-success",
      popular: "bg-warning-light text-warning border-warning",
      new: "bg-info-light text-info border-info",
    };
    return colors[type] || "bg-bg-secondary text-text-secondary border-border";
  };

  const getBadgeIcon = (type) => {
    const icons = {
      spicy: <Flame className="w-3 h-3" />,
      veg: <Leaf className="w-3 h-3" />,
      popular: <Star className="w-3 h-3" />,
      new: <Sparkles className="w-3 h-3" />,
    };
    return icons[type];
  };

  // ── Shared theme tokens ────────────────────────────────────────
  const cardBase = isDark
    ? "bg-[var(--color-bg-elevated)] border-[var(--color-border-primary)]"
    : "bg-bg-elevated border-border";
  const imagePlaceholder = isDark
    ? "bg-[var(--color-bg-tertiary)]"
    : "bg-bg-secondary";
  const skeletonCls = "skeleton";
  const textPrimary = "text-[var(--color-text-primary)]";
  const textSecondary = "text-[var(--color-text-secondary)]";
  const textTertiary = "text-[var(--color-text-tertiary)]";
  const brandText = isDark ? "text-orange-400" : "text-brand";
  const brandBg = isDark ? "bg-orange-500" : "bg-brand";
  const brandBorder = isDark ? "border-orange-500" : "border-brand";
  const brandLightHover = isDark
    ? "hover:bg-orange-900/30"
    : "hover:bg-brand-light";

  const qtyWrap = isDark
    ? "bg-[var(--color-bg-primary)] border-[var(--color-border-primary)]"
    : "bg-bg-primary border-border";
  const qtyBtn = isDark
    ? "hover:bg-[var(--color-bg-tertiary)] active:bg-[var(--color-bg-secondary)]"
    : "hover:bg-bg-secondary active:bg-bg-tertiary";
  const qtyCenter = isDark
    ? "bg-[var(--color-bg-secondary)]/50"
    : "bg-bg-secondary/50";

  const favBtn = (fav) =>
    fav
      ? "bg-error text-text-inverse scale-110"
      : isDark
        ? "bg-[var(--color-bg-elevated)]/80 text-[var(--color-text-secondary)] hover:bg-error hover:text-white hover:scale-110 border border-[var(--color-border-primary)]"
        : "bg-bg-elevated text-text-secondary hover:bg-error hover:text-text-inverse hover:scale-110";

  const ratingBg = isDark
    ? "bg-[var(--color-bg-elevated)]/90 border-[var(--color-border-primary)]"
    : "bg-bg-elevated/95 border-border";

  const cartBadgeBg = isDark ? "bg-orange-600" : "bg-brand";

  const recRing = isRecommended
    ? isDark
      ? "ring-2 ring-purple-400/40 ring-offset-2 ring-offset-[var(--color-bg-primary)]"
      : "ring-2 ring-purple-500/30 ring-offset-2 ring-offset-bg-primary"
    : "";

  const shimmerVia = isDark ? "via-white/10" : "via-white/30";

  // ============================================================
  // LIST VIEW
  // ============================================================
  if (viewMode === "list") {
    return (
      <div
        className={`${cardBase} rounded-2xl p-3 sm:p-4 shadow-custom-md hover:shadow-custom-lg transition-all border touch-manipulation ${
          disabled || !item.available ? "opacity-60" : ""
        } ${recRing}`}
      >
        <div className="flex gap-3 sm:gap-4">
          {/* Image */}
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden ${imagePlaceholder} flex-shrink-0 relative`}
          >
            {!imageLoaded && (
              <div className={`absolute inset-0 ${skeletonCls}`} />
            )}
            <img
              src={item.image || "/images/placeholder-food.jpg"}
              alt={item.name}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
              }}
              loading="lazy"
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            />
            {!item.available && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Recommended badge */}
            {isRecommended && (
              <div className="absolute top-1 left-1 z-20">
                <div className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>For You</span>
                </div>
              </div>
            )}

            {/* In cart badge */}
            {itemInCart && (
              <div
                className={`absolute ${isRecommended ? "top-7" : "top-1"} left-1 ${cartBadgeBg} text-white text-xs font-bold px-2 py-0.5 rounded-full`}
              >
                {cartQuantity}x
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3
                  className={`text-base sm:text-lg font-bold ${textPrimary} truncate mb-1`}
                >
                  {item.name}
                </h3>
                <p
                  className={`text-xs sm:text-sm ${textTertiary} uppercase tracking-wide`}
                >
                  {item.category}
                </p>
              </div>

              {/* Favorite */}
              <button
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite || disabled}
                className={`p-2 rounded-lg transition-all touch-manipulation ${favBtn(isFavorite)} ${isTogglingFavorite ? "cursor-not-allowed" : ""}`}
              >
                {isTogglingFavorite ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart
                    className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`}
                  />
                )}
              </button>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-3">
              {item.badges?.slice(0, 2).map((badge, i) => (
                <span
                  key={i}
                  className={`px-2 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${getBadgeColor(badge)}`}
                >
                  {getBadgeIcon(badge)}
                  <span className="hidden sm:inline">{badge}</span>
                </span>
              ))}
            </div>

            {/* Price + Actions */}
            <div className="flex items-center justify-between gap-3">
              <span
                className={`text-xl sm:text-2xl font-extrabold ${brandText}`}
              >
                Rs {item.price.toFixed(2)}
              </span>

              <div className="flex items-center gap-2">
                {/* Quantity */}
                <div
                  className={`flex items-center border-2 ${qtyWrap} rounded-xl overflow-hidden`}
                >
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1 || disabled || !item.available}
                    className={`px-2 sm:px-3 py-1.5 ${qtyBtn} transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Minus className={`w-3 h-3 sm:w-4 sm:h-4 ${textPrimary}`} />
                  </button>
                  <span
                    className={`px-3 py-1.5 font-bold ${textPrimary} min-w-[2.5rem] text-center text-sm sm:text-base`}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= 99 || disabled || !item.available}
                    className={`px-2 sm:px-3 py-1.5 ${qtyBtn} transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Plus className={`w-3 h-3 sm:w-4 sm:h-4 ${textPrimary}`} />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || disabled || !item.available}
                  className={`p-2 sm:p-2.5 ${brandBg} text-white rounded-xl shadow-custom-md hover:shadow-custom-lg active:scale-95 transition-all touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  {isAddingToCart ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // GRID VIEW
  // ============================================================
  return (
    <div
      className={`group relative ${cardBase} rounded-2xl sm:rounded-3xl overflow-hidden shadow-custom-md hover:shadow-custom-xl transition-all duration-300 border ${
        disabled || !item.available ? "opacity-60" : ""
      } ${recRing}`}
    >
      {/* Image */}
      <div
        className={`relative aspect-[4/3] overflow-hidden ${imagePlaceholder}`}
      >
        {!imageLoaded && <div className={`absolute inset-0 ${skeletonCls}`} />}
        <img
          src={item.image || "/images/placeholder-food.jpg"}
          alt={item.name}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => (e.target.src = "/images/placeholder-food.jpg")}
          loading="lazy"
          className={`w-full h-full object-cover transition-all duration-700 ${
            imageLoaded ? "scale-100 opacity-100" : "scale-110 opacity-0"
          } group-hover:scale-110`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Out of Stock */}
        {!item.available && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20">
            <span className="text-white text-lg font-bold px-4 py-2 bg-error rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Recommended badge */}
        {isRecommended && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-30">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>For You</span>
            </div>
          </div>
        )}

        {/* In cart badge */}
        {itemInCart && (
          <div
            className={`absolute ${isRecommended ? "top-11 sm:top-12" : "top-2 sm:top-3"} left-2 sm:left-3 z-20 px-3 py-1.5 ${cartBadgeBg} text-white rounded-full text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1`}
          >
            <ShoppingCart className="w-3 h-3" />
            <span>{cartQuantity}x in cart</span>
          </div>
        )}

        {/* Badges */}
        <div
          className={`absolute ${
            isRecommended && itemInCart
              ? "top-[4.5rem] sm:top-20"
              : isRecommended
                ? "top-11 sm:top-12"
                : itemInCart
                  ? "top-11 sm:top-12"
                  : "top-2 sm:top-3"
          } left-2 sm:left-3 flex flex-wrap gap-1.5 sm:gap-2 z-10`}
        >
          {item.badges?.map((badge, i) => (
            <span
              key={i}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg flex items-center gap-1 ${getBadgeColor(badge)}`}
            >
              {getBadgeIcon(badge)}
              <span className="hidden xs:inline">
                {badge.charAt(0).toUpperCase() + badge.slice(1)}
              </span>
            </span>
          ))}
        </div>

        {/* Favorite */}
        <button
          onClick={handleToggleFavorite}
          disabled={isTogglingFavorite || disabled}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-2 sm:p-3 rounded-full backdrop-blur-md transition-all shadow-lg touch-manipulation z-20 ${favBtn(isFavorite)} ${isTogglingFavorite ? "cursor-not-allowed" : ""}`}
        >
          {isTogglingFavorite ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          ) : (
            <Heart
              className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? "fill-current" : ""}`}
            />
          )}
        </button>

        {/* Rating */}
        {item.rating && (
          <div
            className={`absolute bottom-2 left-2 sm:bottom-3 sm:left-3 px-3 sm:px-4 py-1.5 sm:py-2 ${ratingBg} backdrop-blur-md rounded-full flex items-center gap-1.5 sm:gap-2 shadow-xl border z-10`}
          >
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-warning text-warning" />
            <span className={`font-bold text-xs sm:text-sm ${textPrimary}`}>
              {item.rating}
            </span>
            <span className={`text-xs ${textTertiary} hidden xs:inline`}>
              ({item.reviews || 0})
            </span>
          </div>
        )}

        {/* Discount badge */}
        {item.originalPrice && item.originalPrice > item.price && (
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-success text-text-inverse rounded-full text-xs font-bold shadow-lg z-10">
            SAVE Rs {(item.originalPrice - item.price).toFixed(2)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 md:p-6">
        <div className="mb-2 sm:mb-3">
          <h3
            className={`text-lg sm:text-xl font-bold ${textPrimary} mb-1 line-clamp-1 ${isDark ? "group-hover:text-orange-400" : "group-hover:text-brand"} transition-colors`}
          >
            {item.name}
          </h3>
          <p
            className={`text-xs sm:text-sm ${textTertiary} uppercase tracking-wider`}
          >
            {item.category}
          </p>
        </div>

        <p
          className={`${textSecondary} text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed`}
        >
          {item.description || "Delicious menu item"}
        </p>

        {/* Price + Actions */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl sm:text-3xl font-extrabold ${brandText}`}
              >
                Rs {item.price.toFixed(2)}
              </span>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className={`text-sm ${textTertiary} line-through`}>
                  Rs {item.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quantity */}
            <div
              className={`flex items-center border-2 ${qtyWrap} rounded-xl overflow-hidden shadow-sm`}
            >
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1 || disabled || !item.available}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 ${qtyBtn} transition-colors font-bold ${textPrimary} touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                −
              </button>
              <span
                className={`px-3 sm:px-4 py-1.5 sm:py-2 font-bold ${textPrimary} min-w-[2.5rem] sm:min-w-[3rem] text-center ${qtyCenter}`}
              >
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={quantity >= 99 || disabled || !item.available}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 ${qtyBtn} transition-colors font-bold ${textPrimary} touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                +
              </button>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || disabled || !item.available}
              className={`p-2.5 sm:p-3 ${brandBg} text-white rounded-xl shadow-custom-md hover:shadow-custom-lg active:scale-95 transition-all duration-300 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {isAddingToCart ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Customize */}
        {item.customizable && item.customizations?.length > 0 && (
          <button
            disabled={disabled || !item.available}
            className={`mt-3 sm:mt-4 w-full py-2.5 sm:py-3 text-sm font-bold ${brandText} border-2 ${brandBorder} rounded-xl ${brandLightHover} active:opacity-80 transition-all touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            🎨 Customize Your Order
          </button>
        )}
      </div>

      {/* Shimmer */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-transparent ${shimmerVia} to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none`}
      />
    </div>
  );
};

export default MenuCard;