"use client";

import { useNetworkInfo } from "@/hooks/useNetworkInfo";
import Image from "next/image";
import React, { Suspense } from "react";

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  condition?: boolean;
  loadingComponent?: React.ComponentType;
}

/**
 * Component for lazy loading heavy components based on network conditions
 */
export const LazyComponent = ({
  children,
  fallback,
  condition = true,
  loadingComponent: LoadingComponent
}: LazyComponentProps) => {
  const { isSlowConnection } = useNetworkInfo();
  
  // Don't load heavy components on slow connections unless explicitly needed
  if (isSlowConnection && !condition) {
    return <>{fallback || <div>Loading...</div>}</>;
  }

  const LoadingFallback = LoadingComponent ? (
    <LoadingComponent />
  ) : (
    <div className="animate-pulse bg-neutral-800 rounded h-8 w-full" />
  );

  return (
    <Suspense fallback={LoadingFallback}>
      {children}
    </Suspense>
  );
};

// HOC for dynamic imports
export function withLazyLoading<P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  fallback?: React.ComponentType
) {
  const LazyWrappedComponent = React.lazy(importFn);
  
  const WrappedComponent = (props: P) => {
    const FallbackComponent = fallback || (() => (
      <div className="animate-pulse bg-neutral-800 rounded h-32 w-full" />
    ));

    return (
      <LazyComponent
        fallback={<FallbackComponent />}
        loadingComponent={FallbackComponent}
      >
        <LazyWrappedComponent {...props} />
      </LazyComponent>
    );
  };

  WrappedComponent.displayName = 'LazyWrappedComponent';
  return WrappedComponent;
}

// Preload components when network is fast
export const usePreloadComponents = () => {
  const { isSlowConnection } = useNetworkInfo();
  
  React.useEffect(() => {
    if (!isSlowConnection) {
      // Preload heavy components when network is fast
      const preloadPromises: Promise<unknown>[] = [
        // Add your heavy component imports here
        // import('../components/room/AudioStreamVisualizer'),
        // import('../components/dashboard/SearchResults'),
      ];
      
      if (preloadPromises.length > 0) {
        Promise.all(preloadPromises).catch(error => {
          console.warn('Component preloading failed:', error);
        });
      }
    }
  }, [isSlowConnection]);
};

// Connection-aware image component
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

const OptimizedImageComponent = ({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  priority = false 
}: OptimizedImageProps) => {
  const { isSlowConnection, saveData } = useNetworkInfo();
  
  // Use lower quality images on slow connections
  const optimizedSrc = React.useMemo(() => {
    if (isSlowConnection || saveData) {
      // Add quality parameters or use different image sizes
      try {
        const url = new URL(src, window.location.origin);
        url.searchParams.set('q', '60'); // Lower quality
        url.searchParams.set('w', Math.min(width || 400, 400).toString()); // Smaller width
        return url.toString();
      } catch {
        return src; // Fallback to original if URL parsing fails
      }
    }
    return src;
  }, [src, isSlowConnection, saveData, width]);

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width || 400}
      height={height || 400}
      className={className}
      priority={priority}
    />
  );
};

OptimizedImageComponent.displayName = 'OptimizedImage';
export const OptimizedImage = OptimizedImageComponent;
