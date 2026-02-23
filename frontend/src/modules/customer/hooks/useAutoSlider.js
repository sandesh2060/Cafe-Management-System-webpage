// File: frontend/src/modules/customer/hooks/useAutoSlider.js
// 🎯 AUTO-SLIDER HOOK - Reusable slider logic with auto-play
// ✅ Automatic sliding every 3 seconds
// ✅ Manual navigation with smooth transitions
// ✅ Infinite loop support
// ✅ Pause on hover/interaction
// ✅ Touch/swipe support for mobile

import { useState, useEffect, useRef, useCallback } from 'react';

export const useAutoSlider = ({
  itemsCount = 0,
  autoPlayInterval = 3000, // 3 seconds
  enableInfiniteLoop = true,
  pauseOnHover = true,
  pauseOnInteraction = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Navigate to specific index
  const goToSlide = useCallback((index) => {
    if (itemsCount === 0) return;
    
    let newIndex = index;
    
    if (enableInfiniteLoop) {
      // Handle infinite loop wrapping
      if (index < 0) {
        newIndex = itemsCount - 1;
      } else if (index >= itemsCount) {
        newIndex = 0;
      }
    } else {
      // Clamp to valid range
      newIndex = Math.max(0, Math.min(index, itemsCount - 1));
    }
    
    setCurrentIndex(newIndex);
    
    // Pause briefly when user manually navigates
    if (pauseOnInteraction && isPlaying) {
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 5000); // Resume after 5s
    }
  }, [itemsCount, enableInfiniteLoop, pauseOnInteraction, isPlaying]);

  // Navigate to next slide
  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  // Navigate to previous slide
  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying || isPaused || itemsCount <= 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isPaused, itemsCount, autoPlayInterval, nextSlide]);

  // Handle mouse hover (pause on hover)
  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  }, [pauseOnHover]);

  // Handle touch events for swipe
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const swipeThreshold = 50; // Minimum swipe distance
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left - go to next
        nextSlide();
      } else {
        // Swiped right - go to previous
        prevSlide();
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  }, [nextSlide, prevSlide]);

  // Play/Pause controls
  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlayPause = useCallback(() => setIsPlaying(prev => !prev), []);

  // Reset to first slide
  const reset = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(true);
    setIsPaused(false);
  }, []);

  return {
    currentIndex,
    isPlaying,
    isPaused,
    goToSlide,
    nextSlide,
    prevSlide,
    play,
    pause,
    togglePlayPause,
    reset,
    // Event handlers
    handleMouseEnter,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};

export default useAutoSlider;