"use client";
import { motion as MotionComponent, AnimatePresence as MotionAnimatePresence, type HTMLMotionProps } from "motion/react";
import type { FC, ReactNode } from "react";

interface AnimatePresenceProps {
  children: ReactNode;
}

// Create optimized motion components with proper typing
const createMotionComponent = <T extends keyof JSX.IntrinsicElements>(
  Component: T
): FC<HTMLMotionProps<T>> => {
  const MotionComponent: FC<HTMLMotionProps<T>> = ({ children, ...props }) => {
    return <Component {...props}>{children}</Component>;
  };
  MotionComponent.displayName = `SafeMotion.${Component}`;
  return MotionComponent;
};

// Optimized SafeMotion components with proper typing
export const SafeMotion = {
  div: createMotionComponent('div'),
  h2: createMotionComponent('h2'),
  p: createMotionComponent('p'),
  span: createMotionComponent('span'),
  circle: MotionComponent.circle,  // Add SVG circle support
  AnimatePresence: MotionAnimatePresence  // Use the original AnimatePresence
};

// Export optimized motion components
export { MotionComponent as motion };
export { MotionAnimatePresence as AnimatePresence };
