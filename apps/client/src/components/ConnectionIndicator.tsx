"use client";

import { useNetworkInfo } from "@/hooks/useNetworkInfo";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, Zap, Turtle } from "lucide-react";
import React from "react";

interface ConnectionIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export const ConnectionIndicator = ({ 
  className, 
  showDetails = false 
}: ConnectionIndicatorProps) => {
  const { isOnline, effectiveType, downlink, isSlowConnection, saveData } = useNetworkInfo();

  const getConnectionIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (isSlowConnection) return <Turtle className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  const getConnectionColor = () => {
    if (!isOnline) return "text-red-500";
    if (isSlowConnection) return "text-yellow-500";
    return "text-green-500";
  };

  const getConnectionText = () => {
    if (!isOnline) return "Offline";
    if (isSlowConnection) return "Slow Connection";
    return "Good Connection";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex items-center gap-1", getConnectionColor())}>
        {getConnectionIcon()}
        {showDetails && (
          <span className="text-xs font-medium">
            {getConnectionText()}
          </span>
        )}
      </div>
      
      {showDetails && isOnline && (
        <div className="text-xs text-neutral-400 flex items-center gap-1">
          <span>{effectiveType.toUpperCase()}</span>
          {downlink && <span>• {downlink.toFixed(1)} Mbps</span>}
          {saveData && (
            <>
              <span>•</span>
              <span title="Data Saver Mode">
                <Zap className="w-3 h-3" />
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Hook for connection-aware features
export const useConnectionAwareFeatures = () => {
  const { isOnline, isSlowConnection, saveData } = useNetworkInfo();

  return {
    // Disable heavy animations on slow connections
    enableAnimations: !isSlowConnection && !saveData,
    
    // Reduce audio quality on slow connections
    audioQuality: isSlowConnection ? 'low' : saveData ? 'medium' : 'high',
    
    // Enable/disable real-time features
    enableRealTimeFeatures: isOnline && !isSlowConnection,
    
    // Auto-retry settings
    retryAttempts: isSlowConnection ? 2 : 5,
    retryDelay: isSlowConnection ? 3000 : 1000,
    
    // Batch size for data operations
    batchSize: isSlowConnection ? 5 : 20,
    
    // Enable/disable preloading
    enablePreloading: !isSlowConnection && !saveData,
    
    // Connection status
    connectionStatus: !isOnline ? 'offline' : isSlowConnection ? 'slow' : 'good'
  };
};
