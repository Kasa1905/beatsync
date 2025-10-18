"use client";

import React, { createContext, useContext } from "react";

// Create a mock PostHog context
interface PostHogContextType {
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, properties?: Record<string, unknown>) => void;
  reset: () => void;
}

const PostHogContext = createContext<PostHogContextType>({
  capture: () => {},
  identify: () => {},
  reset: () => {},
});

// Mock usePostHog hook
export function usePostHog() {
  return useContext(PostHogContext);
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  // Mock PostHog instance
  const mockPostHog: PostHogContextType = {
    capture: (event: string, properties?: Record<string, unknown>) => {
      console.log('📊 [Mock Analytics]', event, properties);
    },
    identify: (userId: string, properties?: Record<string, unknown>) => {
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
