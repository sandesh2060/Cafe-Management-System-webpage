// ================================================================
// FILE: frontend/src/modules/customer/pages/MenuPage.jsx
// 🎯 REDESIGNED VERSION - Warm Tea Shop Aesthetic
// ✅ Full Dark Mode Support via [data-theme="dark"] CSS variables
// ✅ Theme toggle button in navbar
// ✅ All hardcoded colors replaced with theme-aware classes
// ✅ FIX: isInCart + getItemQuantity passed as props to MenuCard
//         (prevents N duplicate useCart() instances → no more white screen)
// ================================================================

import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Grid,
  List,
  SlidersHorizontal,
  X,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  ArrowUp,
  Sparkles,
  Command,
  TrendingUp,
  ChevronDown,
  Utensils,
  Clock,
  Star,
  TrendingUp as Trending,
  Zap,
  Coffee,
  Heart,
} from "lucide-react";
import MenuCard from "../components/MenuCard";
import LoyaltyCard from "../components/LoyaltyCard";
import CurrentOrderCard from "../components/CurrentOrderCard";
import RecommendationsSection from "../components/RecommendationsSection";
import { useMenu } from "../hooks/useMenu";
import { useCart } from "../hooks/useCart";
import { useFavorites } from "../hooks/useFavorites";
import { useCurrentOrder } from "../hooks/useCurrentOrder";
import { useRecommendations } from "../hooks/useRecommendations";
import { useTheme } from "../../../shared/context/ThemeContext";
import gsap from "gsap";

// ── Main Component ───────────────────────────────────────────────
const MenuPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isReturning,
    loyaltyPoints,
    scrollToMenu: shouldScrollToMenu,
  } = location.state || {};
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { menuItems, categories, loading, fetchMenu } = useMenu();

  // ✅ FIX: Destructure isInCart and getItemQuantity here so we can
  //         pass them as props to MenuCard — preventing MenuCard from
  //         calling useCart() itself (which created N hook instances,
  //         each firing fetchCart on mount → infinite loop → white screen)
  const { cart, addToCart, cartItemCount, isInCart, getItemQuantity } =
    useCart();

  const {
    favorites,
    toggleFavorite,
    isFavorite,
    syncing: favoriteSyncing,
  } = useFavorites();

  const {
    currentOrder,
    loading: orderLoading,
    refreshing: orderRefreshing,
    error: orderError,
    retryCount: orderRetryCount,
    hasActiveOrder,
    progress,
    estimatedTime,
    statusInfo,
    refresh: refreshOrder,
  } = useCurrentOrder();

  const { recommendations } = useRecommendations();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    veg: false,
    spicy: false,
    popular: false,
    priceRange: "all",
  });
  const [showWelcome, setShowWelcome] = useState(isReturning);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const headerRef = useRef(null);
  const headerInnerRef = useRef(null);
  const greetingIconRef = useRef(null);
  const greetingTextRef = useRef(null);
  const subtitleRef = useRef(null);
  const profileBtnRef = useRef(null);
  const cartBtnRef = useRef(null);
  const searchIconBtnRef = useRef(null);
  const searchBarRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchInputFieldRef = useRef(null);
  const clearBtnRef = useRef(null);
  const welcomeRef = useRef(null);
  const loyaltyRef = useRef(null);
  const currentOrderRef = useRef(null);
  const orderNowHeroRef = useRef(null);
  const recommendationsRef = useRef(null);
  const categoriesRef = useRef(null);
  const categoriesContainerRef = useRef(null);
  const filtersRef = useRef(null);
  const menuGridRef = useRef(null);
  const scrollButtonRef = useRef(null);
  const searchGlowRef = useRef(null);
  const menuSectionRef = useRef(null);

  const session = JSON.parse(localStorage.getItem("customerSession") || "{}");
  const displayName = session.customerName || session.username || "Guest";

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return {
        greeting: "Good Morning",
        message: "Start your day right",
        icon: Sunrise,
        gradient: "from-orange-500 to-red-500",
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: "Good Afternoon",
        message: "Time for a break",
        icon: Sun,
        gradient: "from-orange-600 to-red-600",
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        greeting: "Good Evening",
        message: "Dinner awaits",
        icon: Sunset,
        gradient: "from-red-500 to-rose-500",
      };
    } else {
      return {
        greeting: "Good Night",
        message: "Late night cravings",
        icon: Moon,
        gradient: "from-purple-500 to-indigo-500",
      };
    }
  };

  const timeGreeting = getTimeBasedGreeting();
  const GreetingIcon = timeGreeting.icon;

  const recommendedItemIds = useMemo(() => {
    const allRecommended = [
      ...(recommendations.superPersonalized || []),
      ...(recommendations.weatherBased || []),
      ...(recommendations.trending || []),
      ...(recommendations.timeBased || []),
    ];
    return [...new Set(allRecommended.map((item) => item._id || item.id))];
  }, [recommendations]);

  const filteredItems = useMemo(() => {
    const filtered = menuItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesVeg =
        !filters.veg || item.badges?.includes("veg") || item.isVeg;
      const matchesSpicy =
        !filters.spicy || item.badges?.includes("spicy") || item.isSpicy;
      const matchesPopular =
        !filters.popular || item.badges?.includes("popular") || item.isPopular;

      let matchesPrice = true;
      if (filters.priceRange === "low") matchesPrice = item.price < 10;
      if (filters.priceRange === "medium")
        matchesPrice = item.price >= 10 && item.price < 20;
      if (filters.priceRange === "high") matchesPrice = item.price >= 20;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesVeg &&
        matchesSpicy &&
        matchesPopular &&
        matchesPrice
      );
    });

    return filtered.sort((a, b) => {
      const aRec = recommendedItemIds.includes(a._id || a.id);
      const bRec = recommendedItemIds.includes(b._id || b.id);
      if (aRec && !bRec) return -1;
      if (!aRec && bRec) return 1;
      return 0;
    });
  }, [menuItems, searchQuery, selectedCategory, filters, recommendedItemIds]);

  const activeFiltersCount =
    Object.values(filters).filter((v) => v === true).length +
    (filters.priceRange !== "all" ? 1 : 0);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const scrollToMenu = () => {
    if (menuSectionRef.current) {
      window.scrollTo({
        top: menuSectionRef.current.offsetTop - 84,
        behavior: "smooth",
      });
      gsap.fromTo(
        menuSectionRef.current,
        { backgroundColor: "rgba(251, 146, 60, 0.1)" },
        {
          backgroundColor: "rgba(251, 146, 60, 0)",
          duration: 2,
          ease: "power2.out",
        },
      );
    }
  };

  useEffect(() => {
    if (
      !hasActiveOrder &&
      orderNowHeroRef.current &&
      !isSearchExpanded &&
      !orderLoading
    ) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          orderNowHeroRef.current,
          { y: 40, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            delay: 0.5,
            ease: "power3.out",
          },
        );
      });
      return () => ctx.revert();
    }
  }, [hasActiveOrder, isSearchExpanded, orderLoading]);

  useEffect(() => {
    if (
      hasActiveOrder &&
      currentOrderRef.current &&
      !isSearchExpanded &&
      !orderLoading
    ) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          currentOrderRef.current,
          { y: 30, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            delay: 0.5,
            ease: "back.out(1.5)",
          },
        );
      });
      return () => ctx.revert();
    }
  }, [hasActiveOrder, isSearchExpanded, orderLoading]);

  useEffect(() => {
    if (recommendationsRef.current && !isSearchExpanded && !loading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          recommendationsRef.current,
          { y: 30, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            delay: hasActiveOrder ? 0.7 : 0.5,
            ease: "power3.out",
          },
        );
      });
      return () => ctx.revert();
    }
  }, [isSearchExpanded, loading, hasActiveOrder]);

  const toggleSearch = () => {
    if (!isSearchExpanded) {
      setIsSearchExpanded(true);
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(
        [
          greetingIconRef.current,
          greetingTextRef.current,
          subtitleRef.current,
          profileBtnRef.current,
        ],
        { opacity: 0, y: -10, duration: 0.3, stagger: 0.03 },
        0,
      );
      tl.to(
        searchBarRef.current,
        {
          height: "auto",
          paddingTop: 16,
          paddingBottom: 16,
          opacity: 1,
          duration: 0.5,
        },
        0.15,
      );
      tl.fromTo(
        searchInputRef.current,
        { width: 48, opacity: 0, scale: 0.95 },
        {
          width: "100%",
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
          onComplete: () => searchInputFieldRef.current?.focus(),
        },
        0.25,
      );
      if (searchGlowRef.current) {
        tl.fromTo(
          searchGlowRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.8 },
          0.3,
        );
      }
      [
        loyaltyRef,
        currentOrderRef,
        orderNowHeroRef,
        recommendationsRef,
        categoriesContainerRef,
      ].forEach((ref) => {
        if (
          ref.current &&
          (ref !== currentOrderRef || hasActiveOrder) &&
          (ref !== orderNowHeroRef || !hasActiveOrder)
        ) {
          tl.to(
            ref.current,
            { opacity: 0, y: -20, height: 0, marginBottom: 0, duration: 0.3 },
            0,
          );
        }
      });
      if (showFilters) setShowFilters(false);
    } else {
      if (!searchQuery) {
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          onComplete: () => setIsSearchExpanded(false),
        });
        tl.to(
          searchInputRef.current,
          {
            width: 48,
            opacity: 0,
            scale: 0.95,
            duration: 0.3,
            ease: "power2.in",
          },
          0,
        );
        tl.to(
          searchBarRef.current,
          {
            height: 0,
            paddingTop: 0,
            paddingBottom: 0,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
          },
          0.1,
        );
        tl.to(
          [
            greetingIconRef.current,
            greetingTextRef.current,
            subtitleRef.current,
            profileBtnRef.current,
          ],
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.05,
            ease: "power3.out",
          },
          0.3,
        );
        [
          { ref: loyaltyRef, delay: 0.5 },
          {
            ref: hasActiveOrder ? currentOrderRef : orderNowHeroRef,
            delay: 0.6,
          },
          { ref: recommendationsRef, delay: 0.7 },
          { ref: categoriesContainerRef, delay: 0.8 },
        ].forEach(({ ref, delay }) => {
          if (ref.current) {
            tl.set(
              ref.current,
              { height: "auto", marginBottom: 24, clearProps: "height" },
              delay - 0.1,
            );
            tl.fromTo(
              ref.current,
              { opacity: 0, y: -15 },
              { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
              delay,
            );
          }
        });
        if (categoriesRef.current?.children.length > 0) {
          tl.from(
            Array.from(categoriesRef.current.children),
            {
              opacity: 0,
              scale: 0.95,
              y: -10,
              duration: 0.4,
              stagger: 0.04,
              ease: "back.out(1.5)",
            },
            0.85,
          );
        }
      }
    }
  };

  // ── Hide navbar on scroll down, show on scroll up ──────────────
  useEffect(() => {
    if (!headerRef.current) return;

    let lastScrollY = window.scrollY;
    let isHidden = false;
    let rafId = null;
    const THRESHOLD = 8; // ignore tiny jitter

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY;

        // Always show at very top
        if (currentScrollY <= 10) {
          if (isHidden) {
            isHidden = false;
            gsap.to(headerRef.current, {
              y: 0,
              opacity: 1,
              duration: 0.35,
              ease: "power3.out",
            });
          }
          lastScrollY = currentScrollY;
          return;
        }

        // Scroll DOWN → hide fast
        if (delta > THRESHOLD && !isHidden) {
          isHidden = true;
          gsap.to(headerRef.current, {
            y: "-110%",
            opacity: 0,
            duration: 0.25,
            ease: "power2.in",
          });
        }
        // Scroll UP → show smooth
        else if (delta < -THRESHOLD && isHidden) {
          isHidden = false;
          gsap.to(headerRef.current, {
            y: 0,
            opacity: 1,
            duration: 0.38,
            ease: "power3.out",
          });
        }

        lastScrollY = currentScrollY;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (!clearBtnRef.current) return;
    if (searchQuery) {
      gsap.to(clearBtnRef.current, {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.3,
        ease: "back.out(1.7)",
      });
    } else {
      gsap.to(clearBtnRef.current, {
        scale: 0,
        opacity: 0,
        rotation: 90,
        duration: 0.2,
        ease: "power2.in",
      });
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!scrollButtonRef.current) return;
    gsap.set(scrollButtonRef.current, { scale: 0, opacity: 0 });

    const handleScrollBtn = () => {
      if (window.scrollY > 300) {
        gsap.to(scrollButtonRef.current, {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
        });
      } else {
        gsap.to(scrollButtonRef.current, {
          scale: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        });
      }
    };

    window.addEventListener("scroll", handleScrollBtn, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollBtn);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        if (headerRef.current)
          gsap.from(headerRef.current, {
            y: -20,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
          });
        if (loyaltyRef.current && !isSearchExpanded) {
          gsap.fromTo(
            loyaltyRef.current,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: "power2.out" },
          );
        }
        if (categoriesRef.current?.children.length > 0 && !isSearchExpanded) {
          const btns = Array.from(categoriesRef.current.children);
          gsap.set(btns, { opacity: 1, x: 0, visibility: "visible" });
          gsap.from(btns, {
            x: -20,
            opacity: 0,
            duration: 0.4,
            stagger: 0.05,
            delay: 0.3,
            ease: "power2.out",
            clearProps: "all",
          });
        }
      });
      return () => ctx.revert();
    }, 100);
    return () => clearTimeout(timer);
  }, [categories.length, isSearchExpanded]);

  useEffect(() => {
    if (!loading && menuGridRef.current?.children.length) {
      const ctx = gsap.context(() => {
        const items = Array.from(menuGridRef.current.children);
        gsap.set(items, { opacity: 1, y: 0, visibility: "visible" });
        gsap.from(items, {
          y: 40,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "all",
        });
      });
      return () => ctx.revert();
    }
  }, [loading, filteredItems.length, selectedCategory, viewMode]);

  useEffect(() => {
    if (showWelcome && isReturning && welcomeRef.current) {
      const tl = gsap.timeline();
      tl.from(welcomeRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
      }).to(welcomeRef.current, {
        y: -10,
        opacity: 0,
        duration: 0.4,
        delay: 3,
        ease: "power2.in",
        onComplete: () => setShowWelcome(false),
      });
      return () => tl.kill();
    }
  }, [showWelcome, isReturning]);

  useEffect(() => {
    if (!filtersRef.current) return;
    if (showFilters) {
      gsap.set(filtersRef.current, { height: "auto", opacity: 1 });
      const height = filtersRef.current.offsetHeight;
      gsap.fromTo(
        filtersRef.current,
        { height: 0, opacity: 0, marginBottom: 0, overflow: "hidden" },
        {
          height,
          opacity: 1,
          marginBottom: 24,
          duration: 0.4,
          ease: "power2.out",
          clearProps: "height",
        },
      );
    } else {
      gsap.to(filtersRef.current, {
        height: 0,
        opacity: 0,
        marginBottom: 0,
        duration: 0.3,
        ease: "power2.in",
        overflow: "hidden",
      });
    }
  }, [showFilters]);
  useEffect(() => {
    if (!shouldScrollToMenu || !menuSectionRef.current) return;

    // Small delay so the page renders first
    const timer = setTimeout(() => {
      window.scrollTo({
        top: menuSectionRef.current.offsetTop - 84,
        behavior: "smooth",
      });
      // Clear the state so back-navigation doesn't re-scroll
      window.history.replaceState({}, "");
    }, 400);

    return () => clearTimeout(timer);
  }, [shouldScrollToMenu]);

  const handleClearAll = () => {
    setSearchQuery("");
    setFilters({ veg: false, spicy: false, popular: false, priceRange: "all" });
    setSelectedCategory("all");
  };
  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputFieldRef.current?.focus();
  };
  const handleSearchClose = () => {
    if (!searchQuery) toggleSearch();
  };
  const handleScrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });
  const handleAddToCart = async (item, quantity = 1) =>
    addToCart(item, quantity);
  const handleToggleFavorite = async (itemId) => await toggleFavorite(itemId);

  // ── Shared class helpers ────────────────────────────────────────
  const pageBg = isDark
    ? "bg-[var(--color-bg-primary)]"
    : "bg-gradient-to-br from-orange-50 via-red-50 to-orange-50";

  const headerBg = isDark
    ? "bg-[var(--color-bg-elevated)]/95 border-[var(--color-border-primary)]"
    : "bg-white/95 border-orange-100";

  const greetingIconBg = "bg-gradient-to-br from-orange-400 to-red-500";

  const iconBtnBase = isDark
    ? "bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-orange-400"
    : "bg-orange-100 hover:bg-orange-200 text-orange-700";

  const searchActiveBg =
    "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-orange-500/50";

  const cartBtnCls =
    "bg-gradient-to-br from-orange-500 to-red-600 text-white hover:shadow-xl hover:shadow-orange-500/50";

  const textPrimary = "text-[var(--color-text-primary)]";
  const textSecondary = "text-[var(--color-text-secondary)]";
  const textTertiary = "text-[var(--color-text-tertiary)]";
  const accentText = isDark ? "text-orange-400" : "text-orange-600";
  const accentTextDark = isDark ? "text-orange-300" : "text-orange-700";

  const cardBg = isDark
    ? "bg-[var(--color-bg-elevated)] border-[var(--color-border-primary)]"
    : "bg-white border-orange-200";

  const searchInputBg = isDark
    ? "bg-[var(--color-bg-secondary)]/80 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
    : "bg-white/50 text-gray-900 placeholder:text-gray-400";
  const searchBorderFocused = isDark
    ? "border-orange-500 ring-2 ring-orange-500/40 shadow-orange-500/30"
    : "border-orange-400 ring-2 ring-orange-400/30 shadow-orange-300";
  const searchBorderDefault = isDark
    ? "border-[var(--color-border-primary)] hover:border-[var(--color-border-secondary)]"
    : "border-orange-200 hover:border-orange-300";

  const catActive =
    "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-orange-500/50 scale-105";
  const catInactive = isDark
    ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] border-[var(--color-border-primary)]"
    : "bg-white text-gray-700 hover:bg-orange-50 border-orange-200";

  const pillInactive = isDark
    ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] border-[var(--color-border-primary)]"
    : "bg-white text-gray-700 hover:bg-orange-50 border-orange-200";

  const viewToggleContainer = isDark
    ? "bg-[var(--color-bg-elevated)] border-[var(--color-border-primary)]"
    : "bg-white border-orange-200";

  const filterPanelBg = isDark
    ? "bg-[var(--color-bg-elevated)] border-[var(--color-border-primary)]"
    : "bg-white border-orange-200";

  const filterRowHover = isDark
    ? "hover:bg-[var(--color-bg-tertiary)] hover:border-[var(--color-border-secondary)]"
    : "hover:bg-orange-50 hover:border-orange-200";

  const filterSelectCls = isDark
    ? "bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)] text-[var(--color-text-primary)] focus:border-orange-500"
    : "bg-white border-orange-200 text-gray-900 focus:border-orange-400";

  const skeletonOuter = isDark
    ? "bg-[var(--color-bg-elevated)] border-[var(--color-border-primary)]"
    : "bg-white border-orange-100";
  const skeletonImg = isDark ? "bg-[var(--color-bg-tertiary)]" : "bg-orange-50";
  const skeletonLine1 = isDark
    ? "bg-[var(--color-bg-tertiary)]"
    : "bg-orange-100";
  const skeletonLine2 = isDark
    ? "bg-[var(--color-bg-secondary)]"
    : "bg-orange-50";

  const heroBg = isDark
    ? "bg-gradient-to-br from-[var(--color-bg-elevated)] via-[var(--color-bg-secondary)] to-[var(--color-bg-elevated)] border-[var(--color-border-primary)]"
    : "bg-gradient-to-br from-orange-100 via-red-50 to-orange-100 border-orange-200";

  const heroChips = [
    {
      icon: Star,
      bg: isDark ? "bg-emerald-900/50" : "bg-emerald-100",
      color: isDark ? "text-emerald-400" : "text-emerald-700",
      title: "Top Rated",
      sub: "Quality dishes",
    },
    {
      icon: Clock,
      bg: isDark ? "bg-amber-900/50" : "bg-amber-100",
      color: isDark ? "text-amber-400" : "text-amber-700",
      title: "Fast Service",
      sub: "Quick prep",
    },
    {
      icon: Trending,
      bg: isDark ? "bg-orange-900/50" : "bg-orange-100",
      color: isDark ? "text-orange-400" : "text-orange-700",
      title: "Trending",
      sub: "Most ordered",
    },
  ];

  const emptyIconBg = isDark
    ? "bg-[var(--color-bg-secondary)]"
    : "bg-orange-100";
  const scrollTopBtnCls =
    "bg-gradient-to-br from-orange-500 to-red-600 text-white";

  return (
    <div className={`min-h-screen ${pageBg} transition-colors duration-300`}>
      {/* ── WELCOME TOAST ─────────────────────────────────────────── */}
      {showWelcome && isReturning && (
        <div
          ref={welcomeRef}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
        >
          <div
            className={`bg-gradient-to-r ${timeGreeting.gradient} text-white px-6 py-4 rounded-3xl shadow-2xl backdrop-blur-xl border-2 border-white/30`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <GreetingIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg leading-tight">Welcome back!</p>
                <p className="text-sm text-white/90 leading-tight mt-1">
                  Your table is ready, {displayName}
                </p>
              </div>
              <button
                onClick={() => setShowWelcome(false)}
                className="w-9 h-9 hover:bg-white/20 rounded-xl transition-colors flex items-center justify-center flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NAVBAR ────────────────────────────────────────────────── */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-40">
        <div
          className={`${headerBg} backdrop-blur-xl border-b-2 shadow-lg transition-colors duration-300`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div
              ref={headerInnerRef}
              className="flex items-center justify-between h-16 sm:h-20"
            >
              {/* Greeting */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  ref={greetingIconRef}
                  className={`w-12 h-12 sm:w-14 sm:h-14 ${greetingIconBg} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}
                >
                  <GreetingIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1
                    ref={greetingTextRef}
                    className={`text-base sm:text-lg font-bold ${textPrimary} truncate leading-tight`}
                  >
                    {timeGreeting.greeting}, {displayName}
                  </h1>
                  <p
                    ref={subtitleRef}
                    className={`text-xs sm:text-sm ${textSecondary} truncate leading-tight mt-0.5`}
                  >
                    Table {session.tableNumber || "N/A"} •{" "}
                    {timeGreeting.message}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 sm:gap-2 flex-shrink-0">
                {/* Profile */}
                <button
                  ref={profileBtnRef}
                  onClick={() => navigate("/customer/profile")}
                  className={`w-11 h-11 sm:w-12 sm:h-12 ${iconBtnBase} active:scale-95 rounded-2xl transition-all flex items-center justify-center shadow-md`}
                  aria-label="Profile"
                >
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Search */}
                <button
                  ref={searchIconBtnRef}
                  onClick={toggleSearch}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl transition-all flex items-center justify-center shadow-md ${
                    isSearchExpanded ? searchActiveBg : iconBtnBase
                  }`}
                  aria-label=""
                >
                  <Search className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Cart */}
                <button
                  ref={cartBtnRef}
                  onClick={() => navigate("/customer/cart")}
                  className={`relative w-11 h-11 sm:w-12 sm:h-12 ${cartBtnCls} rounded-2xl active:scale-95 transition-all flex items-center justify-center shadow-lg`}
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg ring-2 ring-white dark:ring-[var(--color-bg-elevated)]">
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ── SEARCH BAR ──────────────────────────────────────── */}
            <div
              ref={searchBarRef}
              className="overflow-hidden relative"
              style={{ height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0 }}
            >
              <div
                ref={searchGlowRef}
                className={`absolute inset-0 ${isDark ? "bg-gradient-to-r from-orange-900/20 via-red-900/20 to-orange-900/20" : "bg-gradient-to-r from-orange-100 via-red-100 to-orange-100"} blur-2xl opacity-0 pointer-events-none`}
              />
              <div ref={searchInputRef} className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                  <Search
                    className={`w-5 h-5 transition-colors duration-300 ${searchFocused ? accentText : textTertiary}`}
                  />
                  {searchFocused && (
                    <div
                      className={`h-4 w-px ${isDark ? "bg-orange-700" : "bg-orange-200"}`}
                    />
                  )}
                  {searchFocused && !searchQuery && (
                    <div
                      className={`flex items-center gap-1.5 text-xs ${textTertiary}`}
                    ></div>
                  )}
                </div>
                <input
                  ref={searchInputFieldRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search for dishes, ingredients, or categories..."
                  style={{ fontSize: "16px" }}
                  className={`w-full h-16 pl-12 ${searchFocused && !searchQuery ? "pr-36" : "pr-28"} ${searchInputBg} border-2 transition-all duration-300 rounded-3xl outline-none focus:outline-none focus:ring-0 ${searchFocused ? `${searchBorderFocused} shadow-xl shadow-orange-500/20` : searchBorderDefault}`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {searchQuery && (
                    <div
                      className={`hidden sm:flex items-center gap-2 px-4 py-2 ${isDark ? "bg-orange-900/40 text-orange-300" : "bg-orange-100 text-orange-700"} rounded-2xl text-sm font-bold shadow-sm`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>{filteredItems.length} found</span>
                    </div>
                  )}
                  {searchQuery && (
                    <button
                      ref={clearBtnRef}
                      onClick={handleClearSearch}
                      className={`w-10 h-10 ${isDark ? "bg-orange-900/40 hover:bg-red-900/40" : "bg-orange-100 hover:bg-red-100"} active:scale-90 rounded-2xl flex items-center justify-center transition-all group shadow-sm`}
                      aria-label="Clear"
                      style={{ scale: 0, opacity: 0 }}
                    >
                      <X
                        className={`w-5 h-5 ${isDark ? "text-orange-400 group-hover:text-red-400" : "text-orange-600 group-hover:text-red-600"} transition-colors`}
                      />
                    </button>
                  )}
                  <button
                    onClick={handleSearchClose}
                    className={`w-10 h-10 ${isDark ? "bg-red-900/40 hover:bg-red-900/60 text-red-400" : "bg-red-100 hover:bg-red-200 text-red-600"} active:scale-90 rounded-2xl flex items-center justify-center transition-all shadow-sm`}
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="h-16 sm:h-20"></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 mt-10">
        {/* ── Loyalty Card ──────────────────────────────────────── */}
        {!isSearchExpanded && (
          <div ref={loyaltyRef}>
            <LoyaltyCard visits={loyaltyPoints || 0} />
          </div>
        )}

        {/* ── Current Order Card ────────────────────────────────── */}
        {!isSearchExpanded && hasActiveOrder && (
          <div ref={currentOrderRef}>
            <CurrentOrderCard
              order={currentOrder}
              statusInfo={statusInfo}
              progress={progress}
              estimatedTime={estimatedTime}
              refreshing={orderRefreshing}
              loading={orderLoading}
              error={orderError}
              retryCount={orderRetryCount}
              onRefresh={refreshOrder}
            />
          </div>
        )}

        {/* ── Order Now Hero ────────────────────────────────────── */}
        {!isSearchExpanded && !hasActiveOrder && !orderLoading && (
          <div ref={orderNowHeroRef} className="mb-6">
            <div
              className={`relative overflow-hidden ${heroBg} rounded-[32px] border-3 shadow-2xl transition-colors duration-300`}
            >
              {/* Decorative blobs */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400 rounded-full blur-3xl animate-pulse" />
                <div
                  className="absolute bottom-0 left-0 w-96 h-96 bg-red-400 rounded-full blur-3xl animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
              </div>
              <div className="relative p-8 sm:p-12">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-full mb-5 shadow-lg">
                    <Coffee className="w-5 h-5" />
                    <span className="text-sm font-bold">Ready to order</span>
                  </div>
                  <h2
                    className={`text-4xl sm:text-5xl font-bold ${textPrimary} mb-4 leading-tight`}
                  >
                    Hungry? Let's get you started!
                  </h2>
                  <p
                    className={`text-lg sm:text-xl ${textSecondary} mb-8 leading-relaxed`}
                  >
                    Browse our delicious menu and order your favorites. Fresh
                    ingredients, amazing flavors, delivered to your table.
                  </p>
                  <div className="grid grid-cols-3 gap-4 mb-10">
                    {heroChips.map(({ icon: Icon, bg, color, title, sub }) => (
                      <div key={title} className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md`}
                        >
                          <Icon className={`w-6 h-6 ${color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-bold ${textPrimary}`}>
                            {title}
                          </p>
                          <p className={`text-xs ${textSecondary}`}>{sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={scrollToMenu}
                    className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-3xl shadow-2xl hover:shadow-orange-500/50 active:scale-95 transition-all overflow-hidden text-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="relative flex items-center gap-3 justify-center">
                      <Zap className="w-6 h-6" />
                      <span>Order Now</span>
                      <ChevronDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Recommendations ───────────────────────────────────── */}
        {!isSearchExpanded && !loading && (
          <div ref={recommendationsRef}>
            <RecommendationsSection
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              favorites={favorites}
              disabled={favoriteSyncing}
            />
          </div>
        )}

        {/* ── Menu Section ──────────────────────────────────────── */}
        <div ref={menuSectionRef}>
          {/* Categories */}
          {!isSearchExpanded && (
            <div ref={categoriesContainerRef} className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className={`w-6 h-6 ${accentText}`} />
                <h2 className={`text-xl font-bold ${textPrimary}`}>
                  Categories
                </h2>
              </div>
              <div
                ref={categoriesRef}
                className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
                style={{ opacity: 1, visibility: "visible" }}
              >
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all shadow-md border-2 ${selectedCategory === "all" ? catActive : catInactive}`}
                >
                  All Items
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all shadow-md border-2 ${selectedCategory === category.name ? catActive : catInactive}`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toolbar */}
          {!isSearchExpanded && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <p className={`text-sm ${textSecondary}`}>
                  <span className={`font-bold ${textPrimary}`}>
                    {filteredItems.length}
                  </span>{" "}
                  items
                </p>
                {(searchQuery || activeFiltersCount > 0) && (
                  <>
                    <span className={textTertiary}>•</span>
                    <button
                      onClick={handleClearAll}
                      className={`text-sm font-bold ${accentText} hover:${accentTextDark} transition-colors`}
                    >
                      Clear all
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* View mode toggle */}
                <div
                  className={`flex items-center ${viewToggleContainer} rounded-2xl p-1.5 border-2 shadow-md`}
                >
                  <button
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid"
                    className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-md" : `${textSecondary} hover:${accentText}`}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    aria-label="List"
                    className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-md" : `${textSecondary} hover:${accentText}`}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
                {/* Filters button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`relative px-5 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-md border-2 ${showFilters || activeFiltersCount > 0 ? "bg-gradient-to-br from-orange-500 to-red-600 text-white border-transparent shadow-orange-500/50" : pillInactive}`}
                >
                  <SlidersHorizontal className="w-5 h-5" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[24px] h-6 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center px-2 shadow-lg ring-2 ring-white dark:ring-[var(--color-bg-elevated)]">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Filters Panel */}
          {!isSearchExpanded && (
            <div
              ref={filtersRef}
              style={{ height: 0, opacity: 0, overflow: "hidden" }}
            >
              <div
                className={`p-6 ${filterPanelBg} rounded-3xl border-2 shadow-xl transition-colors duration-300`}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className={`font-bold ${textPrimary} text-lg`}>
                    Filters
                  </h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={() =>
                        setFilters({
                          veg: false,
                          spicy: false,
                          popular: false,
                          priceRange: "all",
                        })
                      }
                      className={`text-sm font-bold ${accentText} hover:${accentTextDark}`}
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      key: "veg",
                      label: "Vegetarian",
                      accent: "accent-emerald-600",
                    },
                    { key: "spicy", label: "Spicy", accent: "accent-red-600" },
                    {
                      key: "popular",
                      label: "Popular",
                      accent: "accent-amber-600",
                    },
                  ].map(({ key, label, accent }) => (
                    <label
                      key={key}
                      className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-colors group border-2 border-transparent ${filterRowHover}`}
                    >
                      <input
                        type="checkbox"
                        checked={filters[key]}
                        onChange={(e) =>
                          setFilters({ ...filters, [key]: e.target.checked })
                        }
                        className={`w-5 h-5 rounded-lg border-2 border-gray-300 ${accent}`}
                      />
                      <span
                        className={`text-base font-bold ${textPrimary} group-hover:${accentText} transition-colors`}
                      >
                        {label}
                      </span>
                    </label>
                  ))}
                  <select
                    value={filters.priceRange}
                    onChange={(e) =>
                      setFilters({ ...filters, priceRange: e.target.value })
                    }
                    style={{ fontSize: "16px" }}
                    className={`px-4 py-4 border-2 rounded-2xl text-base font-bold focus:ring-4 focus:ring-orange-200 outline-none transition-all shadow-sm ${filterSelectCls}`}
                  >
                    <option value="all">All Prices</option>
                    <option value="low">Under Rs 500</option>
                    <option value="medium">Rs 500 - Rs 1000</option>
                    <option value="high">Over Rs 1000</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Search toolbar (expanded mode) */}
          {isSearchExpanded && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <p className={`text-sm ${textSecondary}`}>
                  <span className={`font-bold ${textPrimary}`}>
                    {filteredItems.length}
                  </span>{" "}
                  {searchQuery ? "results" : "items"}
                </p>
                {searchQuery && (
                  <>
                    <span className={textTertiary}>•</span>
                    <button
                      onClick={handleClearSearch}
                      className={`text-sm font-bold ${accentText} hover:${accentTextDark} transition-colors`}
                    >
                      Clear search
                    </button>
                  </>
                )}
              </div>
              <div
                className={`flex items-center ${viewToggleContainer} rounded-2xl p-1.5 border-2 shadow-md`}
              >
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-md" : `${textSecondary} hover:${accentText}`}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-md" : `${textSecondary} hover:${accentText}`}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ── Menu Grid ───────────────────────────────────────── */}
          {loading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-5"
              }
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`${skeletonOuter} rounded-3xl overflow-hidden border-2 animate-pulse shadow-lg`}
                >
                  <div className={`aspect-[4/3] ${skeletonImg}`}></div>
                  <div className="p-6 space-y-4">
                    <div
                      className={`h-6 ${skeletonLine1} rounded-2xl w-3/4`}
                    ></div>
                    <div
                      className={`h-5 ${skeletonLine2} rounded-xl w-1/2`}
                    ></div>
                    <div className={`h-4 ${skeletonLine2} rounded-xl`}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div
              ref={menuGridRef}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-5"
              }
              style={{ opacity: 1, visibility: "visible" }}
            >
              {filteredItems.map((item) => {
                const itemId = item._id || item.id;
                return (
                  <MenuCard
                    key={itemId}
                    item={item}
                    viewMode={viewMode}
                    onAddToCart={handleAddToCart}
                    isFavorite={isFavorite(itemId)}
                    onToggleFavorite={handleToggleFavorite}
                    disabled={favoriteSyncing}
                    isRecommended={recommendedItemIds.includes(itemId)}
                    isInCart={isInCart}
                    getItemQuantity={getItemQuantity}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24">
              <div
                className={`w-20 h-20 mx-auto mb-6 ${emptyIconBg} rounded-3xl flex items-center justify-center shadow-lg`}
              >
                <Search className={`w-10 h-10 ${accentText}`} />
              </div>
              <h3 className={`text-2xl font-bold ${textPrimary} mb-3`}>
                No items found
              </h3>
              <p className={`${textSecondary} mb-8 text-lg`}>
                {isSearchExpanded
                  ? "Try a different search term"
                  : "Try adjusting your filters"}
              </p>
              <button
                onClick={isSearchExpanded ? handleClearSearch : handleClearAll}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-orange-500/50 transition-all active:scale-95"
              >
                {isSearchExpanded ? "Clear Search" : "Clear All Filters"}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── Scroll to Top ─────────────────────────────────────────── */}
      <button
        ref={scrollButtonRef}
        onClick={handleScrollToTop}
        className={`fixed bottom-8 right-8 w-14 h-14 ${scrollTopBtnCls} rounded-2xl shadow-2xl flex items-center justify-center z-40 hover:scale-110 transition-transform`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default MenuPage;
