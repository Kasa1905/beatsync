"use client";

import { useNetworkInfo } from "@/hooks/useNetworkInfo";
import { motion, MotionProps } from "motion/react";
import React from "react";

interface OptimizedMotionProps extends MotionProps {
  children: React.ReactNode;
  reduceMotion?: boolean;
  fallbackComponent?: React.ComponentType<React.PropsWithChildren>;
  className?: string;
}

/**
 * Optimized motion component that reduces animations on slow connections
 * and provides fallbacks for better performance
 */
export const OptimizedMotion = ({ 
  children, 
  reduceMotion = false,
  fallbackComponent: FallbackComponent,
  ...motionProps 
}: OptimizedMotionProps) => {
  const { isSlowConnection, saveData } = useNetworkInfo();
  
  // Check for user's motion preferences
  const prefersReducedMotion = typeof window !== "undefined" && 
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Determine if we should reduce motion
  const shouldReduceMotion = 
    reduceMotion || 
    isSlowConnection || 
    saveData || 
    prefersReducedMotion;

  // If we should reduce motion and have a fallback, use it
  if (shouldReduceMotion && FallbackComponent) {
    return <FallbackComponent>{children}</FallbackComponent>;
  }

  // If we should reduce motion but no fallback, use div
  if (shouldReduceMotion) {
    const { className, style } = motionProps;
    return (
      <div 
        className={className} 
        style={style as React.CSSProperties}
      >
        {children}
      </div>
    );
  }

  // Otherwise, use full motion
  return <motion.div {...motionProps}>{children}</motion.div>;
};

// Optimized variants that are lighter on slow connections
export const optimizedVariants = {
  // Fast connection variants
  full: {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 },
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 25,
      mass: 0.5
    }
  },
  
  // Reduced motion variants
  reduced: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 }
  },

  // Slide variants - full
  slideFull: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },

  // Slide variants - reduced
  slideReduced: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.1 }
  }
};

// Hook to get appropriate variants based on connection
export const useOptimizedVariants = () => {
  const { isSlowConnection, saveData } = useNetworkInfo();
  const prefersReducedMotion = typeof window !== "undefined" && 
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const shouldReduce = isSlowConnection || saveData || prefersReducedMotion;

  return {
    fade: shouldReduce ? optimizedVariants.reduced : optimizedVariants.full,
    slide: shouldReduce ? optimizedVariants.slideReduced : optimizedVariants.slideFull,
    shouldReduce
  };
};
