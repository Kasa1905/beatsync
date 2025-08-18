"use client";

import { useEffect, useState } from "react";

interface NetworkInfo {
  isOnline: boolean;
  effectiveType: string;
  downlink: number;
  rtt: number;
  isSlowConnection: boolean;
  saveData: boolean;
}

export function useNetworkInfo(): NetworkInfo {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    isOnline: true,
    effectiveType: "4g",
    downlink: 10,
    rtt: 50,
    isSlowConnection: false,
    saveData: false,
  });

  useEffect(() => {
    // Check if navigator is available (client-side)
    if (typeof navigator === "undefined") return;

    const updateNetworkInfo = () => {
      const connection = (navigator as unknown as { 
        connection?: { 
          effectiveType?: string;
          downlink?: number;
          rtt?: number;
          saveData?: boolean;
          addEventListener?: (event: string, handler: () => void) => void;
          removeEventListener?: (event: string, handler: () => void) => void;
        };
        mozConnection?: unknown;
        webkitConnection?: unknown;
      }).connection || 
      (navigator as unknown as { mozConnection?: unknown }).mozConnection || 
      (navigator as unknown as { webkitConnection?: unknown }).webkitConnection;
      
      const isOnline = navigator.onLine;
      let effectiveType = "4g";
      let downlink = 10;
      let rtt = 50;
      let saveData = false;

      if (connection && typeof connection === 'object') {
        const conn = connection as {
          effectiveType?: string;
          downlink?: number;
          rtt?: number;
          saveData?: boolean;
        };
        effectiveType = conn.effectiveType || "4g";
        downlink = conn.downlink || 10;
        rtt = conn.rtt || 50;
        saveData = conn.saveData || false;
      }

      const isSlowConnection = 
        effectiveType === "slow-2g" || 
        effectiveType === "2g" || 
        downlink < 1.5 || 
        rtt > 300 ||
        saveData;

      setNetworkInfo({
        isOnline,
        effectiveType,
        downlink,
        rtt,
        isSlowConnection,
        saveData,
      });
    };

    // Initial check
    updateNetworkInfo();

    // Listen for network changes
    window.addEventListener("online", updateNetworkInfo);
    window.addEventListener("offline", updateNetworkInfo);

    // Listen for connection changes (if supported)
    const connection = (navigator as unknown as { 
      connection?: { 
        addEventListener?: (event: string, handler: () => void) => void;
        removeEventListener?: (event: string, handler: () => void) => void;
      };
    }).connection;
    if (connection && connection.addEventListener) {
      connection.addEventListener("change", updateNetworkInfo);
    }

    return () => {
      window.removeEventListener("online", updateNetworkInfo);
      window.removeEventListener("offline", updateNetworkInfo);
      if (connection && connection.removeEventListener) {
        connection.removeEventListener("change", updateNetworkInfo);
      }
    };
  }, []);

  return networkInfo;
}
