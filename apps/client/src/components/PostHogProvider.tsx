"use client";

import React, { createContext, useContext } from "react";

// Create a mock PostHog context
const PostHogContext = createContext({
  capture: (event: string, properties?: Record<string, any>) => {},
  identify: (userId: string, properties?: Record<string, any>) => {},
  reset: () => {},
});

// Mock usePostHog hook
export function usePostHog() {
  return useContext(PostHogContext);
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // Mock PostHog instance
  const mockPostHog = {
    capture: (event: string, properties?: Record<string, any>) => {
      console.log('📊 [Mock Analytics]', event, properties);
    },
    identify: (userId: string, properties?: Record<string, any>) => {
      console.log('👤 [Mock Analytics] Identify:', userId, properties);
    },
    reset: () => {
      console.log('🔄 [Mock Analytics] Reset');
    },
  };

  return (
    <PostHogContext.Provider value={mockPostHog}>
      {children}
    </PostHogContext.Provider>
  );
}
