// File: frontend/src/modules/customer/hooks/useWeatherAnimations.js
// 🎨 PREMIUM WEATHER ANIMATIONS - Silky smooth GSAP effects

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Weather PNG URLs
const WEATHER_ASSETS = {
  sun: 'https://imgs.search.brave.com/QNO3p0NxH3NtR4wccgeX3BqtCX_8Yk8Ot3RxkhdtkKs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/cG5nbWFydC5jb20v/ZmlsZXMvMjMvQ2Fy/dG9vbi1TdW4tUE5H/LUhELnBuZw',
  clouds: [
    'https://imgs.search.brave.com/jM5WAJvZ4TzH7MDJ8EoWk_jaHENIDHOiMPXtGD44WgU/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudmV4ZWxzLmNv/bS9tZWRpYS91c2Vy/cy8zLzEzNTAxOC9p/c29sYXRlZC9wcmV2/aWV3LzE5NzE1NDli/NWYyMDliMWIzYzY4/NTIxZWZkZDliODVj/LWNsb3VkLWNhcnRv/b24tMDQucG5n',
    'https://imgs.search.brave.com/9sjBWhbd2bIsxUAmAlfdxrMlDkyf5GzF9TuEQkS36xQ/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJzLmNvbS9p/bWFnZXMvaGQvY2Fy/dG9vbi1zdG9ybS1j/bG91ZC1wbmctMDUy/NTIwMjQtMXNpcDg2/eHN1Ymk1MnBsYy5w/bmc'
  ],
  wind: 'https://imgs.search.brave.com/Kqs1KJ8Xz6lY1DZPXPlZ7-eKrJEh2-wGg4Dwnowh3hk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jbGlw/YXJ0LWxpYnJhcnku/Y29tL2ltYWdlc19r/L3dpbmQtY2xpcGFy/dC10cmFuc3BhcmVu/dC93aW5kLWNsaXBh/cnQtdHJhbnNwYXJl/bnQtOS5qcGc',
  rain: 'https://imgs.search.brave.com/iCwR6hfPNLp985bUbB0B6VfaqBAWhhLTbgCQXOwbpKk/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9wbmcu/cG5ndHJlZS5jb20v/cG5nLXZlY3Rvci8y/MDE5MDExOS9vdXJt/aWQvcG5ndHJlZS1z/aG93ZXItcmFpbi1s/aWdodC1yYWluLXJh/aW4tcG5nLWltYWdl/XzQ3NzI2MS5wbmc'
};

export const useWeatherAnimations = (containerRef, weatherTheme, currentTheme) => {
  const animationsRef = useRef([]);
  const elementsRef = useRef([]);

  // Cleanup function
  const cleanup = () => {
    animationsRef.current.forEach(anim => {
      if (anim && anim.kill) anim.kill();
    });
    animationsRef.current = [];
    
    elementsRef.current.forEach(el => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    elementsRef.current = [];
  };

  // Create element helper
  const createElement = (tag, className, styles = {}) => {
    const el = document.createElement(tag);
    el.className = className;
    Object.assign(el.style, styles);
    return el;
  };

  // ☀️ SUNNY ANIMATION - Premium rotating sun with dynamic rays
  const createSunnyAnimation = (container) => {
    const sunContainer = createElement('div', 'absolute top-6 right-6 sm:top-8 sm:right-8', {
      width: '100px',
      height: '100px',
      pointerEvents: 'none',
      zIndex: '2',
    });

    const sun = createElement('img', 'absolute inset-0', {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      filter: `drop-shadow(0 0 30px ${currentTheme.accentColor}) brightness(1.1)`,
    });
    sun.src = WEATHER_ASSETS.sun;
    
    sunContainer.appendChild(sun);
    container.appendChild(sunContainer);
    elementsRef.current.push(sunContainer);

    // Entrance animation with elastic bounce
    gsap.fromTo(sunContainer,
      { scale: 0, rotation: -180, opacity: 0, y: -50 },
      { 
        scale: 1, 
        rotation: 0, 
        opacity: 1,
        y: 0,
        duration: 2, 
        ease: 'elastic.out(1, 0.6)',
      }
    );

    // Continuous smooth rotation
    const rotateAnim = gsap.to(sun, {
      rotation: 360,
      duration: 25,
      repeat: -1,
      ease: 'none',
    });

    // Gentle pulsing with breathing effect
    const pulseAnim = gsap.to(sunContainer, {
      scale: 1.15,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    animationsRef.current.push(rotateAnim, pulseAnim);

    // Premium sun rays with staggered animation
    for (let i = 0; i < 12; i++) {
      const ray = createElement('div', 'absolute', {
        width: '4px',
        height: '25px',
        background: `linear-gradient(to bottom, ${currentTheme.accentColor}CC, transparent)`,
        transformOrigin: 'center 50px',
        left: '50%',
        top: '50%',
        marginLeft: '-2px',
        marginTop: '-50px',
        transform: `rotate(${i * 30}deg)`,
        borderRadius: '4px',
      });
      
      sunContainer.appendChild(ray);
      
      const rayAnim = gsap.to(ray, {
        scaleY: 1.5,
        opacity: 0.4,
        duration: 1.5 + Math.random() * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.1,
      });
      
      animationsRef.current.push(rayAnim);
    }
  };

  // ☁️ CLOUDS ANIMATION - Smooth floating clouds with depth
  const createCloudsAnimation = (container) => {
    const numClouds = 5;
    const cloudUrls = WEATHER_ASSETS.clouds;

    for (let i = 0; i < numClouds; i++) {
      const cloudWrapper = createElement('div', 'absolute', {
        pointerEvents: 'none',
      });

      const cloud = createElement('img', '', {
        width: `${70 + Math.random() * 50}px`,
        height: 'auto',
        opacity: 0.5 + Math.random() * 0.3,
        filter: 'brightness(1.1) contrast(0.95)',
      });
      
      cloud.src = cloudUrls[i % cloudUrls.length];
      cloudWrapper.appendChild(cloud);
      
      const startX = -150;
      const endX = window.innerWidth + 150;
      const yPos = 5 + (i * 18);
      
      gsap.set(cloudWrapper, {
        x: startX,
        y: `${yPos}%`,
      });
      
      container.appendChild(cloudWrapper);
      elementsRef.current.push(cloudWrapper);
      
      const duration = 20 + Math.random() * 15;
      const delay = i * 3;
      
      // Horizontal drift
      const cloudAnim = gsap.to(cloudWrapper, {
        x: endX,
        duration: duration,
        delay: delay,
        repeat: -1,
        ease: 'none',
      });
      
      // Vertical bobbing with varying speeds
      const bobAnim = gsap.to(cloudWrapper, {
        y: `+=${8 + Math.random() * 12}`,
        duration: 4 + Math.random() * 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Subtle scale animation for depth
      const scaleAnim = gsap.to(cloud, {
        scale: 1.05,
        duration: 3 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      
      animationsRef.current.push(cloudAnim, bobAnim, scaleAnim);
    }
  };

  // 🌧️ RAIN ANIMATION - Realistic rain with varying speeds
  const createRainAnimation = (container) => {
    const numDrops = 30;
    
    for (let i = 0; i < numDrops; i++) {
      const drop = createElement('img', 'absolute', {
        width: '35px',
        height: 'auto',
        opacity: 0.7,
        pointerEvents: 'none',
        filter: `brightness(1.1) hue-rotate(${Math.random() * 20}deg)`,
      });
      
      drop.src = WEATHER_ASSETS.rain;
      
      const startX = Math.random() * 110 - 5;
      const duration = 0.6 + Math.random() * 0.5;
      
      gsap.set(drop, {
        x: `${startX}%`,
        y: '-15%',
        rotation: Math.random() * 10 - 5,
      });
      
      container.appendChild(drop);
      elementsRef.current.push(drop);
      
      const dropAnim = gsap.to(drop, {
        y: '115%',
        rotation: `+=${Math.random() * 15 - 7.5}`,
        duration: duration,
        delay: Math.random() * 2.5,
        repeat: -1,
        ease: 'none',
      });
      
      // Subtle horizontal sway
      const sway = gsap.to(drop, {
        x: `+=${Math.random() * 15 - 7.5}`,
        duration: duration * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      
      animationsRef.current.push(dropAnim, sway);
    }
  };

  // 💨 WIND ANIMATION - Dynamic wind with motion blur effect
  const createWindAnimation = (container) => {
    const windContainer = createElement('div', 'absolute inset-0', {
      pointerEvents: 'none',
    });
    
    container.appendChild(windContainer);
    elementsRef.current.push(windContainer);

    // Animated wind lines with varying speeds
    for (let i = 0; i < 20; i++) {
      const line = createElement('div', 'absolute', {
        width: `${40 + Math.random() * 60}px`,
        height: '3px',
        background: `linear-gradient(to right, transparent, ${currentTheme.accentColor}80, ${currentTheme.accentColor}40, transparent)`,
        borderRadius: '3px',
        boxShadow: `0 0 8px ${currentTheme.accentColor}40`,
      });
      
      const yPos = Math.random() * 100;
      
      gsap.set(line, {
        x: '-30%',
        y: `${yPos}%`,
        opacity: 0,
        scaleX: 0.5,
      });
      
      windContainer.appendChild(line);
      
      const lineAnim = gsap.to(line, {
        x: '130%',
        opacity: [0, 0.8, 0.8, 0],
        scaleX: [0.5, 1, 1, 0.5],
        duration: 1.2 + Math.random() * 0.8,
        delay: Math.random() * 4,
        repeat: -1,
        ease: 'power2.inOut',
      });
      
      animationsRef.current.push(lineAnim);
    }

    // Wind particles for added effect
    for (let i = 0; i < 10; i++) {
      const particle = createElement('div', 'absolute', {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: `${currentTheme.accentColor}60`,
        boxShadow: `0 0 12px ${currentTheme.accentColor}`,
      });

      const yPos = Math.random() * 100;

      gsap.set(particle, {
        x: '-10%',
        y: `${yPos}%`,
        opacity: 0,
        scale: 0.5,
      });

      windContainer.appendChild(particle);

      const particleAnim = gsap.to(particle, {
        x: '110%',
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1, 1.2, 0.5],
        duration: 2 + Math.random(),
        delay: Math.random() * 5,
        repeat: -1,
        ease: 'power1.inOut',
      });

      animationsRef.current.push(particleAnim);
    }
  };

  // ❄️ SNOW ANIMATION - Beautiful falling snowflakes with glow
  const createSnowAnimation = (container) => {
    const numFlakes = 35;
    
    for (let i = 0; i < numFlakes; i++) {
      const size = 6 + Math.random() * 10;
      const flake = createElement('div', 'absolute', {
        width: `${size}px`,
        height: `${size}px`,
        background: currentTheme.accentColor,
        borderRadius: '50%',
        opacity: 0.7 + Math.random() * 0.3,
        pointerEvents: 'none',
        boxShadow: `0 0 ${size * 2}px ${currentTheme.accentColor}, 0 0 ${size}px rgba(255,255,255,0.8)`,
      });
      
      const startX = Math.random() * 110 - 5;
      const duration = 5 + Math.random() * 4;
      
      gsap.set(flake, {
        x: `${startX}%`,
        y: '-10%',
      });
      
      container.appendChild(flake);
      elementsRef.current.push(flake);
      
      const fallAnim = gsap.to(flake, {
        y: '115%',
        duration: duration,
        delay: Math.random() * 4,
        repeat: -1,
        ease: 'none',
      });
      
      // Swaying motion
      const sway = gsap.to(flake, {
        x: `+=${40 + Math.random() * 30}`,
        duration: duration / 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      
      // Rotation for realism
      const rotate = gsap.to(flake, {
        rotation: 360 + Math.random() * 180,
        duration: 3 + Math.random() * 3,
        repeat: -1,
        ease: 'none',
      });

      // Gentle pulsing glow
      const pulse = gsap.to(flake, {
        opacity: 0.4,
        scale: 0.8,
        duration: 2 + Math.random(),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      
      animationsRef.current.push(fallAnim, sway, rotate, pulse);
    }
  };

  // ⚡ THUNDERSTORM ANIMATION - Dramatic lightning with rain
  const createThunderstormAnimation = (container) => {
    // Base rain effect
    createRainAnimation(container);

    // Lightning overlay
    const lightning = createElement('div', 'absolute inset-0', {
      background: 'transparent',
      pointerEvents: 'none',
      zIndex: '10',
      mixBlendMode: 'screen',
    });
    
    container.appendChild(lightning);
    elementsRef.current.push(lightning);
    
    const createLightningFlash = () => {
      const timeline = gsap.timeline({
        delay: 4 + Math.random() * 6,
        onComplete: createLightningFlash,
      });
      
      // Multiple flash sequence for realism
      timeline
        .to(lightning, {
          background: `radial-gradient(circle at ${Math.random() * 100}% ${Math.random() * 50}%, ${currentTheme.accentColor}40, transparent 60%)`,
          duration: 0.05,
          ease: 'power4.in',
        })
        .to(lightning, {
          background: 'transparent',
          duration: 0.08,
        })
        .to(lightning, {
          background: `radial-gradient(circle at ${Math.random() * 100}% ${Math.random() * 50}%, rgba(255,255,255,0.95), transparent 50%)`,
          duration: 0.03,
          delay: 0.1,
        })
        .to(lightning, {
          background: 'transparent',
          duration: 0.15,
        })
        .to(lightning, {
          background: `radial-gradient(circle at ${Math.random() * 100}% ${Math.random() * 50}%, ${currentTheme.accentColor}30, transparent 70%)`,
          duration: 0.04,
          delay: 0.05,
        })
        .to(lightning, {
          background: 'transparent',
          duration: 0.3,
        });
      
      animationsRef.current.push(timeline);
    };
    
    createLightningFlash();
  };

  // 🌫️ MIST/HAZE ANIMATION - Ethereal drifting fog
  const createMistAnimation = (container) => {
    const numLayers = 5;
    
    for (let i = 0; i < numLayers; i++) {
      const layer = createElement('div', 'absolute', {
        width: '250%',
        height: '20%',
        top: `${i * 20}%`,
        background: `linear-gradient(90deg, transparent, ${currentTheme.accentColor}30, ${currentTheme.accentColor}40, ${currentTheme.accentColor}30, transparent)`,
        pointerEvents: 'none',
        filter: 'blur(20px)',
        opacity: 0.4 + Math.random() * 0.2,
      });
      
      gsap.set(layer, {
        x: '-60%',
      });
      
      container.appendChild(layer);
      elementsRef.current.push(layer);
      
      const driftAnim = gsap.to(layer, {
        x: '10%',
        duration: 12 + i * 3,
        delay: i * 2,
        repeat: -1,
        ease: 'none',
      });

      // Vertical movement for depth
      const verticalMove = gsap.to(layer, {
        y: `+=${10 + Math.random() * 10}`,
        duration: 6 + Math.random() * 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Pulsing opacity
      const fadeAnim = gsap.to(layer, {
        opacity: 0.2,
        duration: 4 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      
      animationsRef.current.push(driftAnim, verticalMove, fadeAnim);
    }
  };

  // Main effect
  useEffect(() => {
    if (!containerRef.current || !weatherTheme || !currentTheme) return;

    cleanup();

    const container = containerRef.current;
    const condition = weatherTheme.condition;
    const isNight = weatherTheme.emoji === '🌙';

    // Apply animations based on weather
    switch (condition) {
      case 'clear':
        if (!isNight) {
          createSunnyAnimation(container);
        }
        break;
      
      case 'clouds':
        createCloudsAnimation(container);
        break;
      
      case 'rain':
      case 'drizzle':
        createRainAnimation(container);
        break;
      
      case 'thunderstorm':
        createThunderstormAnimation(container);
        break;
      
      case 'snow':
        createSnowAnimation(container);
        break;
      
      case 'mist':
      case 'haze':
      case 'fog':
        createMistAnimation(container);
        break;
      
      default:
        break;
    }

    // Add wind effect for windy conditions
    if (weatherTheme.description?.includes('wind') || weatherTheme.description?.includes('breez')) {
      createWindAnimation(container);
    }

    return cleanup;
  }, [containerRef, weatherTheme, currentTheme]);

  return null;
};