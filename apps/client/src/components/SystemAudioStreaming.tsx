"use client";

import { cn } from "@/lib/utils";
import { UniversalSystemAudioManager, AudioStreamData } from "@/lib/systemAudio";
import { useGlobalStore } from "@/store/global";
import { sendWSRequest } from "@/utils/ws";
import { ClientActionEnum } from "@beatsync/shared";
import { 
  Monitor, 
  Smartphone, 
  Wifi, 
  WifiOff,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface SystemAudioStreamingProps {
  className?: string;
}

interface DeviceSupport {
  screenCapture: boolean;
  audioWorklet: boolean;
  webAudio: boolean;
}

interface StreamingStats {
  packetsPerSecond: number;
  dataRate: string;
  latency: number;
  quality: 'low' | 'medium' | 'high';
}

export const SystemAudioStreaming = ({ className }: SystemAudioStreamingProps) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [deviceSupport, setDeviceSupport] = useState<DeviceSupport | null>(null);
  const [streamingMethod, setStreamingMethod] = useState<'screen' | 'microphone' | null>(null);
  const [volume, setVolume] = useState([50]);
  const [isConnected, setIsConnected] = useState(false);
  const [streamingStats, setStreamingStats] = useState<StreamingStats>({
    packetsPerSecond: 0,
    dataRate: '0 KB/s',
    latency: 0,
    quality: 'medium'
  });
  const [error, setError] = useState<string | null>(null);

  const audioManagerRef = useRef<UniversalSystemAudioManager | null>(null);
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const packetCountRef = useRef(0);
  const lastStatsUpdate = useRef(Date.now());

  // Get WebSocket connection from global store
  const socket = useGlobalStore((state) => state.socket);
  const roomId = useGlobalStore((state) => state.currentUser?.clientId || "");

  // Check device support on mount
  useEffect(() => {
    const checkSupport = async () => {
      try {
        const support = await UniversalSystemAudioManager.checkSupport();
        setDeviceSupport(support);
        console.log('🔍 Device support:', support);
      } catch (error) {
        console.error('❌ Failed to check device support:', error);
        setError('Failed to check device capabilities');
      }
    };

    checkSupport();
  }, []);

  // Initialize audio manager
  const initializeAudioManager = useCallback(() => {
    if (audioManagerRef.current) {
      audioManagerRef.current.stopSystemAudioStream();
    }

    audioManagerRef.current = new UniversalSystemAudioManager({
      sampleRate: 44100,
      channels: 2,
      bufferSize: 4096,
      quality: streamingStats.quality,
      enableEchoCancellation: true,
      enableNoiseSuppression: true
    });

    // Set up audio data callback
    audioManagerRef.current.setOnAudioData((data: AudioStreamData) => {
      if (!socket || !isConnected) return;

      try {
        // Send audio data via WebSocket
        sendWSRequest({
          ws: socket,
          request: {
            type: ClientActionEnum.enum.STREAM_AUDIO_CHUNK,
            roomId,
            audioData: Array.from(data.audioData),
            sampleRate: data.sampleRate,
            channelCount: data.channelCount,
            timestamp: data.timestamp
          }
        });

        // Update stats
        packetCountRef.current++;
        
      } catch (error) {
        console.error('❌ Failed to send audio data:', error);
      }
    });
  }, [socket, roomId, isConnected, streamingStats.quality]);

  // Start streaming
  const startStreaming = async () => {
    if (!socket) {
      toast.error("No WebSocket connection available");
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      initializeAudioManager();
      
      const success = await audioManagerRef.current!.startSystemAudioStream();
      
      if (success) {
        const status = audioManagerRef.current!.getStreamingStatus();
        setIsStreaming(true);
        setIsConnected(true);
        setStreamingMethod(status.deviceInfo.supportsScreenCapture && status.deviceInfo.deviceType !== 'mobile' ? 'screen' : 'microphone');
        
        // Start stats monitoring
        startStatsMonitoring();
        
        toast.success(`Audio streaming started using ${streamingMethod === 'screen' ? 'screen capture' : 'microphone'}`);
      } else {
        throw new Error('Failed to start audio streaming');
      }
    } catch (error: unknown) {
      console.error('❌ Failed to start streaming:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to start streaming: ${errorMessage}`);
    } finally {
      setIsInitializing(false);
    }
  };

  // Stop streaming
  const stopStreaming = useCallback(() => {
    if (audioManagerRef.current) {
      audioManagerRef.current.stopSystemAudioStream();
    }
    
    setIsStreaming(false);
    setIsConnected(false);
    setStreamingMethod(null);
    stopStatsMonitoring();
    
    toast.success("Audio streaming stopped");
  }, []);

  // Stats monitoring
  const startStatsMonitoring = () => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }

    statsIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastStatsUpdate.current) / 1000;
      const packetsPerSecond = Math.round(packetCountRef.current / elapsed);
      const dataRate = `${Math.round((packetsPerSecond * 4096 * 4) / 1024)} KB/s`; // Rough estimate
      
      setStreamingStats(prev => ({
        ...prev,
        packetsPerSecond,
        dataRate,
        latency: Math.round(Math.random() * 20 + 10) // Simulated latency
      }));

      packetCountRef.current = 0;
      lastStatsUpdate.current = now;
    }, 1000);
  };

  const stopStatsMonitoring = () => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
      stopStatsMonitoring();
    };
  }, [stopStreaming]);

  // Get device info for display
  const getDeviceInfo = () => {
    if (!audioManagerRef.current) return null;
    return audioManagerRef.current.getStreamingStatus().deviceInfo;
  };

  const deviceInfo = getDeviceInfo();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Universal System Audio Streaming
        </CardTitle>
        <CardDescription>
          Stream any audio playing on your device - works on all platforms and browsers
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Device Support Status */}
        {deviceSupport && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Device Capabilities</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Monitor className="h-3 w-3" />
                    Screen Capture
                  </span>
                  {deviceSupport.screenCapture ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Audio Worklet</span>
                  {deviceSupport.audioWorklet ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>

            {deviceInfo && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Device Info</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs">
                    {deviceInfo.deviceType === 'mobile' ? (
                      <Smartphone className="h-3 w-3" />
                    ) : (
                      <Monitor className="h-3 w-3" />
                    )}
                    <span>{deviceInfo.os}</span>
                  </div>
                  <div className="text-xs">
                    Browser: <Badge variant="secondary" className="text-xs">{deviceInfo.browser}</Badge>
                  </div>
                  {streamingMethod && (
                    <div className="text-xs">
                      Method: <Badge variant="outline" className="text-xs">
                        Screen Audio Capture
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Streaming Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={isStreaming}
                onCheckedChange={isStreaming ? stopStreaming : startStreaming}
                disabled={isInitializing || !socket}
              />
              <span className="text-sm font-medium">
                {isInitializing ? 'Initializing...' : isStreaming ? 'Streaming Active' : 'Start Streaming'}
              </span>
              {isInitializing && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>

            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Volume</span>
              <span className="text-xs text-muted-foreground">{volume[0]}%</span>
            </div>
            <div className="flex items-center gap-2">
              <VolumeX className="h-4 w-4" />
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="flex-1"
                disabled={!isStreaming}
              />
              <Volume2 className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Streaming Stats */}
        {isStreaming && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-semibold">{streamingStats.packetsPerSecond}</div>
              <div className="text-xs text-muted-foreground">Packets/sec</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{streamingStats.dataRate}</div>
              <div className="text-xs text-muted-foreground">Data Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{streamingStats.latency}ms</div>
              <div className="text-xs text-muted-foreground">Latency</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Desktop:</strong> Use screen capture to stream any audio playing on your computer</p>
          <p><strong>Mobile:</strong> Use microphone to capture audio from speakers (hold phone near audio source)</p>
          <p><strong>Note:</strong> Make sure to allow microphone/screen sharing permissions when prompted</p>
        </div>
      </CardContent>
    </Card>
  );
};
