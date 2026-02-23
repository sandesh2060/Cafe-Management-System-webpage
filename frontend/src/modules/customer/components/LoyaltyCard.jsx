// File: frontend/src/modules/customer/components/LoyaltyCard.jsx
// 🎯 REDESIGNED VERSION - Warm Tea Shop Aesthetic with Weather Features
// ✅ Matches LoginPage & MenuPage style
// ✅ Maintains all weather animations and features
// ✅ Orange/red gradient color scheme

import { useState, useEffect, useRef } from 'react';
import { Gift, Cloud, CloudRain, Sun, Moon, Snowflake, Wind, Loader, Sparkles, Coffee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getWeatherBasedTheme, getCachedWeatherTheme } from '../../../shared/services/weatherService';
import { useLoyalty } from '../hooks/useLoyalty';
import { ShootingStars } from '../../../components/ui/shooting-stars';
import { StarsBackground } from '../../../components/ui/stars-background';
import { useWeatherAnimations } from '../hooks/useWeatherAnimations';

// 🎨 TEA SHOP WEATHER COLOR PALETTES - Orange/Red Theme
const WEATHER_THEMES = {
  sunny: {
    gradient: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #DC2626 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FED7AA',
    glowColor: 'rgba(251, 146, 60, 0.4)',
    shadowColor: 'rgba(220, 38, 38, 0.3)',
    progressTrack: 'rgba(255, 255, 255, 0.25)',
    progressFill: '#FFFFFF',
    cardShadow: '0 20px 60px rgba(249, 115, 22, 0.5)',
  },
  cloudy: {
    gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #DC2626 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FED7AA',
    glowColor: 'rgba(249, 115, 22, 0.3)',
    shadowColor: 'rgba(234, 88, 12, 0.4)',
    progressTrack: 'rgba(255, 255, 255, 0.25)',
    progressFill: '#FFFFFF',
    cardShadow: '0 20px 60px rgba(234, 88, 12, 0.5)',
  },
  rainy: {
    gradient: 'linear-gradient(135deg, #EA580C 0%, #DC2626 50%, #B91C1C 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FED7AA',
    glowColor: 'rgba(234, 88, 12, 0.3)',
    shadowColor: 'rgba(185, 28, 28, 0.4)',
    progressTrack: 'rgba(255, 255, 255, 0.2)',
    progressFill: '#FED7AA',
    cardShadow: '0 20px 60px rgba(220, 38, 38, 0.6)',
  },
  thunderstorm: {
    gradient: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 50%, #991B1B 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FED7AA',
    glowColor: 'rgba(220, 38, 38, 0.4)',
    shadowColor: 'rgba(153, 27, 27, 0.5)',
    progressTrack: 'rgba(255, 255, 255, 0.15)',
    progressFill: '#FED7AA',
    cardShadow: '0 20px 60px rgba(185, 28, 28, 0.8)',
  },
  snowy: {
    gradient: 'linear-gradient(135deg, #FDBA74 0%, #FB923C 50%, #F97316 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FED7AA',
    glowColor: 'rgba(253, 186, 116, 0.4)',
    shadowColor: 'rgba(249, 115, 22, 0.3)',
    progressTrack: 'rgba(255, 255, 255, 0.25)',
    progressFill: '#FFFFFF',
    cardShadow: '0 20px 60px rgba(251, 146, 60, 0.6)',
  },
  misty: {
    gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #DC2626 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FED7AA',
    glowColor: 'rgba(249, 115, 22, 0.3)',
    shadowColor: 'rgba(220, 38, 38, 0.4)',
    progressTrack: 'rgba(255, 255, 255, 0.2)',
    progressFill: '#FFFFFF',
    cardShadow: '0 20px 60px rgba(234, 88, 12, 0.5)',
  },
  night: {
    gradient: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 50%, #7C2D12 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FED7AA',
    glowColor: 'rgba(220, 38, 38, 0.3)',
    shadowColor: 'rgba(124, 45, 18, 0.5)',
    progressTrack: 'rgba(255, 255, 255, 0.2)',
    progressFill: '#FED7AA',
    cardShadow: '0 20px 60px rgba(124, 45, 18, 0.8)',
  },
  windy: {
    gradient: 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
    textColor: '#FFFFFF',
    accentColor: '#FED7AA',
    glowColor: 'rgba(251, 146, 60, 0.4)',
    shadowColor: 'rgba(234, 88, 12, 0.4)',
    progressTrack: 'rgba(255, 255, 255, 0.25)',
    progressFill: '#FFFFFF',
    cardShadow: '0 20px 60px rgba(249, 115, 22, 0.5)',
  },
};

const LoyaltyCard = () => {
  const navigate = useNavigate();
  
  const { 
    loyaltyData, 
    maxVisits, 
    canClaimReward, 
    loading: loyaltyLoading,
    getVisitsRemaining 
  } = useLoyalty();
  
  const visits = loyaltyData.visits ?? 0;
  const progress = loyaltyData.currentProgress ?? 0;
  const canClaim = canClaimReward();
  const visitsRemaining = getVisitsRemaining();
  
  const [weatherTheme, setWeatherTheme] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState(WEATHER_THEMES.sunny);
  
  const gradientRef = useRef(null);
  const cardRef = useRef(null);
  const weatherContainerRef = useRef(null);

  // Initialize weather animations
  useWeatherAnimations(weatherContainerRef, weatherTheme, currentTheme);

  useEffect(() => {
    const cached = getCachedWeatherTheme();
    if (cached) {
      setWeatherTheme(cached);
      setIsLoading(false);
      applyWeatherTheme(cached);
    }

    const loadWeatherTheme = async () => {
      try {
        const theme = await getWeatherBasedTheme();
        setWeatherTheme(theme);
        applyWeatherTheme(theme);
      } catch (error) {
        console.error('Failed to load weather theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWeatherTheme();
  }, []);

  // Apply premium theme based on weather
  const applyWeatherTheme = (theme) => {
    if (!theme) return;
    
    let selectedTheme;
    const condition = theme.condition;
    const isNight = theme.emoji === '🌙';
    
    if (isNight) {
      selectedTheme = WEATHER_THEMES.night;
    } else {
      switch (condition) {
        case 'clear':
          selectedTheme = WEATHER_THEMES.sunny;
          break;
        case 'clouds':
          selectedTheme = WEATHER_THEMES.cloudy;
          break;
        case 'rain':
        case 'drizzle':
          selectedTheme = WEATHER_THEMES.rainy;
          break;
        case 'thunderstorm':
          selectedTheme = WEATHER_THEMES.thunderstorm;
          break;
        case 'snow':
          selectedTheme = WEATHER_THEMES.snowy;
          break;
        case 'mist':
        case 'haze':
        case 'fog':
          selectedTheme = WEATHER_THEMES.misty;
          break;
        default:
          if (theme.description?.includes('wind')) {
            selectedTheme = WEATHER_THEMES.windy;
          } else {
            selectedTheme = WEATHER_THEMES.sunny;
          }
      }
    }
    
    setCurrentTheme(selectedTheme);
  };

  // Get weather icon component
  const getWeatherIcon = () => {
    if (!weatherTheme) return Sun;
    
    const iconMap = {
      clear: weatherTheme.emoji === '🌙' ? Moon : Sun,
      clouds: Cloud,
      rain: CloudRain,
      drizzle: CloudRain,
      thunderstorm: CloudRain,
      snow: Snowflake,
      mist: Cloud,
      haze: Wind,
      fog: Cloud,
    };
    
    return iconMap[weatherTheme.condition] || Sun;
  };

  const WeatherIcon = getWeatherIcon();
  const emoji = weatherTheme?.emoji || '☕';
  const message = weatherTheme?.message || 'Perfect tea weather';
  const temp = weatherTheme?.temp;
  const city = weatherTheme?.city;

  // Handle claim button click
  const handleClaimClick = () => {
    if (canClaim) {
      navigate('/customer/claim-reward');
    }
  };

  // Show loading state
  if (loyaltyLoading && visits === 0) {
    return (
      <div className="mb-6">
        <div 
          className="rounded-[32px] p-8 relative overflow-hidden"
          style={{ 
            background: currentTheme.gradient,
            boxShadow: currentTheme.cardShadow,
          }}
        >
          <div className="flex items-center justify-center py-8">
            <Loader className="w-8 h-8 animate-spin text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6" ref={cardRef}>
      <div 
        ref={gradientRef}
        className="relative overflow-hidden rounded-[32px] p-8 transition-all duration-1000 backdrop-blur-xl border-2 border-white/20"
        style={{ 
          background: currentTheme.gradient,
          boxShadow: currentTheme.cardShadow,
          color: currentTheme.textColor,
        }}
      >
        {/* ✨ WEATHER ANIMATION CONTAINER */}
        <div 
          ref={weatherContainerRef} 
          className="absolute inset-0 overflow-hidden pointer-events-none weather-animation-container"
          data-weather={weatherTheme?.condition}
          data-is-night={weatherTheme?.emoji === '🌙'}
        >
          {/* Universal shooting stars */}
          <ShootingStars
            minSpeed={12}
            maxSpeed={30}
            minDelay={1000}
            maxDelay={3500}
            starColor={currentTheme.accentColor}
            trailColor={currentTheme.accentColor}
            starWidth={10}
            starHeight={1.5}
            className="opacity-40"
          />

          {/* Starfield for night/mist/haze */}
          {(weatherTheme?.emoji === '🌙' || weatherTheme?.condition === 'mist' || weatherTheme?.condition === 'haze') && (
            <StarsBackground
              starDensity={0.0002}
              allStarsTwinkle={true}
              twinkleProbability={0.8}
              minTwinkleSpeed={0.3}
              maxTwinkleSpeed={1.2}
              className="opacity-50"
            />
          )}

          {/* Extra shooting stars for night */}
          {weatherTheme?.emoji === '🌙' && (
            <ShootingStars
              minSpeed={15}
              maxSpeed={35}
              minDelay={800}
              maxDelay={3000}
              starColor={currentTheme.accentColor}
              trailColor={currentTheme.accentColor}
              starWidth={12}
              starHeight={2}
              className="opacity-60"
            />
          )}

          {/* 💫 AMBIENT GLOW ORBS */}
          <div 
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] floating-orb opacity-60"
            style={{ 
              backgroundColor: currentTheme.glowColor,
              animationDelay: '0s',
            }}
          />
          <div 
            className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-[80px] floating-orb opacity-50"
            style={{ 
              backgroundColor: currentTheme.shadowColor,
              animationDelay: '1.5s',
            }}
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-[120px] floating-orb-slow opacity-30"
            style={{ 
              backgroundColor: currentTheme.accentColor,
              animationDelay: '3s',
            }}
          />
        </div>
        
        {/* 📱 MAIN CARD CONTENT */}
        <div className="relative z-10">
          {/* Header with Weather Info */}
          <div className="flex items-start justify-between mb-6 gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <Coffee className="w-7 h-7 text-white" />
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  Loyalty Rewards
                </h3>
                <span className="text-3xl bounce-emoji-smooth">{emoji}</span>
              </div>
              
              {/* Weather info with glass morphism */}
              {!isLoading && weatherTheme && (
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl backdrop-blur-md mb-3 border border-white/30"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <Sparkles className="w-4 h-4 text-orange-200" />
                  <span className="text-sm font-bold text-white">
                    {message}
                  </span>
                  {temp && (
                    <>
                      <span className="text-white/50">•</span>
                      <span className="text-sm font-bold text-orange-200">
                        {temp}°C
                      </span>
                    </>
                  )}
                </div>
              )}
              
              <p className="text-lg font-bold text-white/90 mb-2">
                {visits}/{maxVisits} visits completed
              </p>
              
              {loyaltyData.totalVisits > 0 && (
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold backdrop-blur-sm border border-white/30"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF'
                  }}
                >
                  🎯 Total: {loyaltyData.totalVisits} visits
                </div>
              )}
            </div>

            {/* Weather Icon Badge with premium glass effect */}
            <div 
              className="p-5 backdrop-blur-xl rounded-3xl flex-shrink-0 relative group weather-icon-badge border-2 border-white/30"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                boxShadow: `0 8px 32px ${currentTheme.shadowColor}`,
              }}
            >
              <WeatherIcon 
                className="w-8 h-8" 
                style={{ color: currentTheme.accentColor }}
              />
              
              {city && (
                <div 
                  className="absolute -bottom-12 right-0 px-4 py-2 rounded-2xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-50 backdrop-blur-xl border-2 border-white/20"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#EA580C'
                  }}
                >
                  📍 {city}
                </div>
              )}
            </div>
          </div>

          {/* Premium Progress Bar */}
          <div className="mb-6">
            <div 
              className="h-5 rounded-full overflow-hidden backdrop-blur-sm relative border-2 border-white/30"
              style={{ 
                backgroundColor: currentTheme.progressTrack,
                boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden progress-bar-fill"
                style={{ 
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: currentTheme.progressFill,
                  boxShadow: `0 0 20px ${currentTheme.shadowColor}, 0 0 40px ${currentTheme.shadowColor}`,
                }}
              >
                {/* Animated shine effect */}
                <div 
                  className="absolute inset-0 shimmer-premium"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)'
                  }}
                />
                {/* Pulse effect */}
                <div 
                  className="absolute right-0 top-0 bottom-0 w-1 pulse-glow"
                  style={{ backgroundColor: currentTheme.accentColor }}
                />
              </div>
            </div>
            
            {/* Progress percentage indicator */}
            <div className="flex items-center justify-between mt-3 px-1">
              <span className="text-sm font-bold text-white/80">
                {progress}% Complete
              </span>
              <span className="text-sm font-black text-orange-200">
                {visitsRemaining} more to go!
              </span>
            </div>
          </div>

          {/* Premium Visit Dots with animation */}
          <div className="flex items-center gap-3 mb-8">
            {[...Array(maxVisits)].map((_, i) => (
              <div
                key={i}
                className="flex-1 relative visit-dot"
              >
                <div
                  className={`h-3.5 rounded-full transition-all duration-500 border-2 ${
                    i < visits ? 'scale-110 border-white/50' : 'scale-100 border-white/30'
                  }`}
                  style={{
                    backgroundColor: i < visits ? currentTheme.progressFill : currentTheme.progressTrack,
                    boxShadow: i < visits 
                      ? `0 0 12px ${currentTheme.shadowColor}, 0 4px 8px ${currentTheme.shadowColor}`
                      : 'none',
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
                {/* Sparkle effect on completed dots */}
                {i < visits && (
                  <div 
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ 
                      backgroundColor: currentTheme.accentColor,
                      opacity: 0.3,
                      animationDuration: '2s',
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Premium CTA Button */}
          {canClaim ? (
            <button 
              onClick={handleClaimClick}
              disabled={loyaltyLoading}
              className="w-full py-5 font-bold rounded-3xl active:scale-[0.98] transition-all text-lg touch-manipulation group relative overflow-hidden premium-button border-2 border-white/30"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#EA580C',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)',
              }}
            >
              {loyaltyLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-6 h-6 animate-spin" />
                  Loading...
                </span>
              ) : (
                <>
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <Gift className="w-7 h-7 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
                    <span className="font-black tracking-wide">Claim Your Free Item!</span>
                  </span>
                  {/* Button shine effect */}
                  <div 
                    className="absolute inset-0 shimmer-button"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(234, 88, 12, 0.2), transparent)'
                    }}
                  />
                  {/* Hover glow */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(234, 88, 12, 0.15), transparent 70%)'
                    }}
                  />
                </>
              )}
            </button>
          ) : (
            <div 
              className="text-center py-5 px-6 rounded-3xl backdrop-blur-md border-2 border-white/30"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
              }}
            >
              <p className="text-lg font-bold mb-2 text-white">
                {visitsRemaining} more visit{visitsRemaining !== 1 ? 's' : ''} to your next reward!
              </p>
              {weatherTheme && (
                <p className="text-sm font-bold text-orange-200">
                  Perfect weather for कौसी चिया! ☕✨
                </p>
              )}
            </div>
          )}
        </div>

        {/* 🎨 PREMIUM ANIMATION STYLES */}
        <style>{`
          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) scale(1);
              opacity: 0.6;
            }
            50% { 
              transform: translateY(-30px) scale(1.08);
              opacity: 0.8;
            }
          }

          @keyframes floatSlow {
            0%, 100% { 
              transform: translate(0, 0) scale(1);
              opacity: 0.3;
            }
            33% { 
              transform: translate(20px, -20px) scale(1.05);
              opacity: 0.5;
            }
            66% { 
              transform: translate(-20px, 20px) scale(0.95);
              opacity: 0.4;
            }
          }

          .floating-orb {
            animation: float 6s ease-in-out infinite;
            will-change: transform, opacity;
          }

          .floating-orb-slow {
            animation: floatSlow 12s ease-in-out infinite;
            will-change: transform, opacity;
          }

          @keyframes bounceEmojiSmooth {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg) scale(1);
            }
            25% {
              transform: translateY(-4px) rotate(-8deg) scale(1.05);
            }
            50% {
              transform: translateY(-6px) rotate(0deg) scale(1.08);
            }
            75% {
              transform: translateY(-4px) rotate(8deg) scale(1.05);
            }
          }

          .bounce-emoji-smooth {
            display: inline-block;
            animation: bounceEmojiSmooth 3s ease-in-out infinite;
            will-change: transform;
          }

          @keyframes shimmerPremium {
            0% {
              transform: translateX(-100%) skewX(-15deg);
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translateX(200%) skewX(-15deg);
              opacity: 0;
            }
          }

          .shimmer-premium {
            animation: shimmerPremium 3s ease-in-out infinite;
            will-change: transform, opacity;
          }

          @keyframes shimmerButton {
            0% {
              transform: translateX(-150%) skewX(-20deg);
            }
            100% {
              transform: translateX(250%) skewX(-20deg);
            }
          }

          .shimmer-button {
            animation: shimmerButton 3s ease-in-out infinite;
            will-change: transform;
          }

          @keyframes pulseGlow {
            0%, 100% {
              opacity: 0.6;
              filter: blur(4px);
            }
            50% {
              opacity: 1;
              filter: blur(8px);
            }
          }

          .pulse-glow {
            animation: pulseGlow 2s ease-in-out infinite;
            will-change: opacity, filter;
          }

          .premium-button {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .premium-button:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          }

          .premium-button:active {
            transform: translateY(-2px) scale(0.98);
          }

          .weather-icon-badge {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .weather-icon-badge:hover {
            transform: scale(1.1) rotate(5deg);
          }

          .visit-dot {
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .progress-bar-fill {
            position: relative;
          }

          .progress-bar-fill::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 2px;
            background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.8), transparent);
            animation: pulseGlow 1.5s ease-in-out infinite;
          }

          /* GPU acceleration for smooth animations */
          .floating-orb,
          .bounce-emoji-smooth,
          .shimmer-premium,
          .shimmer-button,
          .weather-icon-badge,
          .premium-button,
          .visit-dot {
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
          }

          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoyaltyCard;