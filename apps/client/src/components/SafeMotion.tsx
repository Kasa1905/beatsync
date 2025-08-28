"use client";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

// Temporarily disable motion for debugging
export const SafeMotion = {
  div: ({ children, ...props }: any) => {
    // Remove motion props and just return a div for now
    const { initial, animate, exit, transition, whileHover, whileTap, ...restProps } = props;
    return <div {...restProps}>{children}</div>;
  },
  
  h2: ({ children, ...props }: any) => {
    const { initial, animate, exit, transition, whileHover, whileTap, ...restProps } = props;
    return <h2 {...restProps}>{children}</h2>;
  },
  
  p: ({ children, ...props }: any) => {
    const { initial, animate, exit, transition, whileHover, whileTap, ...restProps } = props;
    return <p {...restProps}>{children}</p>;
  },
  
  span: ({ children, ...props }: any) => {
    const { initial, animate, exit, transition, whileHover, whileTap, ...restProps } = props;
    return <span {...restProps}>{children}</span>;
  },
  
  AnimatePresence: ({ children, ...props }: any) => {
    return <>{children}</>;
  }
};

export { motion, AnimatePresence };
