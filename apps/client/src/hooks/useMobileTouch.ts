"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface TouchPosition {
  x: number;
  y: number;
}

interface UseMobileTouchOptions {
  onPositionChange?: (position: TouchPosition) => void;
  onTouchStart?: (position: TouchPosition) => void;
  onTouchEnd?: (position: TouchPosition) => void;
  sensitivity?: number; // How much movement triggers position change
  enableHaptics?: boolean; // Use haptic feedback on supported devices
}

export const useMobileTouch = ({
  onPositionChange,
  onTouchStart,
  onTouchEnd,
  sensitivity = 5,
  enableHaptics = true,
}: UseMobileTouchOptions = {}) => {
  const lastPositionRef = useRef<TouchPosition>({ x: 0, y: 0 });
  const isTrackingRef = useRef(false);

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHaptics) return;
    
    // Check if device supports haptics
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, [enableHaptics]);

  const getTouchPosition = useCallback((touch: Touch, element: HTMLElement): TouchPosition => {
    const rect = element.getBoundingClientRect();
    return {
      x: ((touch.clientX - rect.left) / rect.width) * 100,
      y: ((touch.clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;

    const target = e.currentTarget as HTMLElement;
    const position = getTouchPosition(touch, target);
    
    lastPositionRef.current = position;
    isTrackingRef.current = true;
    
    triggerHaptic('light');
    onTouchStart?.(position);
  }, [getTouchPosition, onTouchStart, triggerHaptic]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    if (!isTrackingRef.current) return;

    const touch = e.touches[0];
    if (!touch) return;

    const target = e.currentTarget as HTMLElement;
    const position = getTouchPosition(touch, target);
    
    // Only trigger if movement exceeds sensitivity threshold
    const deltaX = Math.abs(position.x - lastPositionRef.current.x);
    const deltaY = Math.abs(position.y - lastPositionRef.current.y);
    
    if (deltaX > sensitivity || deltaY > sensitivity) {
      lastPositionRef.current = position;
      onPositionChange?.(position);
    }
  }, [getTouchPosition, onPositionChange, sensitivity]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    if (!isTrackingRef.current) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const target = e.currentTarget as HTMLElement;
    const position = getTouchPosition(touch, target);
    
    isTrackingRef.current = false;
    triggerHaptic('medium');
    onTouchEnd?.(position);
  }, [getTouchPosition, onTouchEnd, triggerHaptic]);

  const attachTouchListeners = useCallback((element: HTMLElement) => {
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    attachTouchListeners,
    triggerHaptic,
    isTracking: isTrackingRef.current,
  };
};

// Hook for detecting mobile viewport
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'tablet'];
      const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(isMobileUserAgent || (isTouchDevice && isSmallScreen));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Hook for mobile-specific optimizations
export const useMobileOptimizations = () => {
  useEffect(() => {
    // Prevent zoom on double tap for better UX
    let lastTouchEnd = 0;
    
    const preventZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchend', preventZoom, { passive: false });

    // Add mobile-specific CSS classes
    document.documentElement.classList.add('mobile-optimized');

    // Prevent scroll bounce on iOS
    const preventBounce = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.scrollable')) return; // Allow scroll in designated areas
      
      e.preventDefault();
    };

    document.addEventListener('touchmove', preventBounce, { passive: false });

    return () => {
      document.removeEventListener('touchend', preventZoom);
      document.removeEventListener('touchmove', preventBounce);
      document.documentElement.classList.remove('mobile-optimized');
    };
  }, []);
};
