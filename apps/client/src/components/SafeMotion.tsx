"use client";
import { motion, AnimatePresence } from "motion/react";

// Re-export a curated set of motion components to keep usage consistent
export const SafeMotion = {
  a: motion.a,
  button: motion.button,
  div: motion.div,
  h2: motion.h2,
  p: motion.p,
  path: motion.path,
  span: motion.span,
  svg: motion.svg,
  circle: motion.circle,
  AnimatePresence,
};

export { motion, AnimatePresence };
