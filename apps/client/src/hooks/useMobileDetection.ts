"use client";

import { useEffect, useState } from "react";

/**
 * Enhanced mobile detection and responsive utilities
 */
export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('md');

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const width = window.innerWidth;
      
      // Mobile detection
      const mobileRegex = /android|iphone|ipod|blackberry|iemobile|opera mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      
      // Tablet detection  
      const tabletRegex = /ipad|android(?!.*mobile)|tablet/i;
      const isTabletDevice = tabletRegex.test(userAgent);
      
      // Touch detection
      const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Screen size detection
      let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';
      if (width < 475) size = 'xs';
      else if (width < 640) size = 'sm';
      else if (width < 768) size = 'md';
      else if (width < 1024) size = 'lg';
      else if (width < 1280) size = 'xl';
      else size = '2xl';
      
      setIsMobile(isMobileDevice || width <= 768);
      setIsTablet(isTabletDevice);
      setIsTouchDevice(hasTouchSupport);
      setScreenSize(size);
    };

    // Initial detection
    detectDevice();

    // Listen for resize
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);
    
    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    isTouchDevice,
    screenSize,
    isDesktop: !isMobile && !isTablet,
    isSmallScreen: screenSize === 'xs' || screenSize === 'sm',
  };
}

/**
 * Mobile-specific CSS classes for touch-friendly interfaces
 */
export const mobileClasses = {
  // Touch-friendly button sizes
  button: {
    small: "min-h-[44px] min-w-[44px] px-4 py-2 text-sm", // Apple's recommended minimum
    medium: "min-h-[48px] min-w-[48px] px-6 py-3 text-base",
    large: "min-h-[56px] min-w-[56px] px-8 py-4 text-lg",
  },
  
  // Mobile-optimized spacing
  spacing: {
    tight: "p-2 gap-2",
    comfortable: "p-4 gap-4", 
    loose: "p-6 gap-6",
  },
  
  // Mobile-friendly text sizes
  text: {
    xs: "text-xs sm:text-sm",
    sm: "text-sm sm:text-base", 
    base: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl",
  },
  
  // Responsive grid layouts
  grid: {
    responsive: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    cards: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4",
  },
  
  // Mobile-optimized form inputs
  input: "min-h-[44px] px-4 py-3 text-base", // Prevent zoom on iOS
  
  // Safe area handling for mobile browsers
  safeArea: {
    padding: "px-safe py-safe",
    paddingTop: "pt-safe",
    paddingBottom: "pb-safe",
  }
};

/**
 * Utility to get optimal button size based on device
 */
export function getOptimalButtonSize(isMobile: boolean, variant: 'small' | 'medium' | 'large' = 'medium') {
  if (isMobile) {
    return mobileClasses.button[variant];
  }
  
  // Desktop sizes can be smaller
  const desktopSizes = {
    small: "min-h-[32px] px-3 py-1 text-sm",
    medium: "min-h-[36px] px-4 py-2 text-base", 
    large: "min-h-[40px] px-6 py-3 text-lg",
  };
  
  return desktopSizes[variant];
}
