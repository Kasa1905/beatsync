"use client";

import { OptimizedMotion } from "@/components/OptimizedMotion";
import { useNetworkInfo } from "@/hooks/useNetworkInfo";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/store/global";
import { useRoomStore } from "@/store/room";
import { sendWSRequest } from "@/utils/ws";
import { ClientActionEnum } from "@beatsync/shared";
import { 
  Mic, 
  Monitor, 
  MonitorSpeaker,
  Play,
  Square,
  Wifi,
  WifiOff,
  Upload
} from "lucide-react";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { UniversalAudioUploader } from "./UniversalAudioUploader";

interface SystemAudioStreamerProps {
  className?: string;
}

type StreamType = 'system' | 'mic' | 'file';
type Quality = 'low' | 'medium' | 'high';

interface BrowserCapabilities {
  hasGetDisplayMedia: boolean;
  hasGetUserMedia: boolean;
  hasWebAudio: boolean;
  hasMediaRecorder: boolean;
  systemAudioSupport: 'full' | 'limited' | 'none';
  recommendedMethod: 'system' | 'microphone' | 'file';
  browserName: string;
  isMobile: boolean;
}

export const SystemAudioStreamer = ({ className }: SystemAudioStreamerProps) => {
  // Browser capabilities detection (memoized)
  const getBrowserCapabilities = useCallback((): BrowserCapabilities => {
    const userAgent = navigator.userAgent.toLowerCase();
    const capabilities: BrowserCapabilities = {
      hasGetDisplayMedia: !!navigator.mediaDevices?.getDisplayMedia,
      hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia,
      hasWebAudio: !!(window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext),
      hasMediaRecorder: !!window.MediaRecorder,
      systemAudioSupport: 'none',
      recommendedMethod: 'file',
      browserName: 'unknown',
      isMobile: /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    };

    // Browser detection with capabilities
    if (userAgent.includes('brave') || (userAgent.includes('chrome') && (navigator as unknown as { brave?: unknown }).brave)) {
      capabilities.browserName = 'Brave';
      capabilities.systemAudioSupport = 'full';
      capabilities.recommendedMethod = 'system';
    } else if (userAgent.includes('chrome') && !userAgent.includes('edg') && !userAgent.includes('opr')) {
      capabilities.browserName = 'Chrome';
      const chromeMatch = userAgent.match(/chrome\/(\d+)/);
      if (chromeMatch && parseInt(chromeMatch[1]) >= 72) {
        capabilities.systemAudioSupport = 'full';
        capabilities.recommendedMethod = 'system';
      }
    } else if (userAgent.includes('edg')) {
      capabilities.browserName = 'Edge';
      capabilities.systemAudioSupport = 'full';
      capabilities.recommendedMethod = 'system';
    } else if (userAgent.includes('firefox')) {
      capabilities.browserName = 'Firefox';
      capabilities.systemAudioSupport = 'limited';
      capabilities.recommendedMethod = 'microphone';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      capabilities.browserName = 'Safari';
      capabilities.recommendedMethod = 'file';
    }

    // Mobile optimization
    if (capabilities.isMobile) {
      capabilities.recommendedMethod = 'file';
    }

    return capabilities;
  }, []);

  // State management
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamType, setStreamType] = useState<StreamType>(() => {
    if (typeof window !== 'undefined') {
      const caps = getBrowserCapabilities();
      return caps.recommendedMethod === 'microphone' ? 'mic' : caps.recommendedMethod as StreamType;
    }
    return 'mic';
  });
  const [audioLevel, setAudioLevel] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamQuality, setStreamQuality] = useState<Quality>('medium');

  // Refs
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Store hooks
  const socket = useGlobalStore((state) => state.socket);
  const roomId = useRoomStore((state) => state.roomId);

  // Network-aware features
  const { isSlowConnection } = useNetworkInfo();

  // Adaptive quality based on connection
  useEffect(() => {
    if (isSlowConnection && streamQuality !== 'low') {
      setStreamQuality('low');
      toast.info('Audio quality reduced due to slow connection');
    }
  }, [isSlowConnection, streamQuality]);

  // Quality settings
  const qualitySettings = useMemo(() => ({
    low: { sampleRate: 22050, bitRate: 64000 },
    medium: { sampleRate: 44100, bitRate: 128000 },
    high: { sampleRate: 48000, bitRate: 256000 }
  }), []);

  // Audio context initialization
  const initializeAudioContext = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContext({
        sampleRate: qualitySettings[streamQuality].sampleRate
      });
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 1024;
      analyserRef.current.smoothingTimeConstant = 0.8;
      return true;
    } catch (error) {
      console.error('Audio context failed:', error);
      setError('Audio context initialization failed');
      return false;
    }
  }, [streamQuality, qualitySettings]);

    // Get media stream with fallbacks
  const getMediaStream = useCallback(async (type: Exclude<StreamType, 'file'>): Promise<MediaStream | null> => {
    const settings = qualitySettings[streamQuality];
    
    try {
      console.log('Attempting to get media stream of type:', type);
      
      if (type === 'system') {
        console.log('Requesting system audio capture...');
        try {
          return await navigator.mediaDevices.getDisplayMedia({
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
              sampleRate: settings.sampleRate,
              channelCount: 1
            },
            video: false
          });
        } catch (systemError) {
          console.log('System audio not available, falling back to microphone:', systemError);
          // Fallback to microphone
          type = 'mic';
        }
      }
      
      if (type === 'mic') {
        console.log('Requesting microphone access...');
        return await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            sampleRate: settings.sampleRate,
            channelCount: 1
          }
        });
      }
    } catch (error) {
      console.error(`Failed to get ${type} stream:`, error);
      
      // Browser capabilities for better error messages
      const caps = getBrowserCapabilities();
      
      // Provide more user-friendly error messages
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          if (caps.browserName === 'Brave') {
            throw new Error(`Brave Browser: Audio access denied. To fix this:\n1. Click the shield icon in address bar\n2. Allow "Site Microphone Use"\n3. For system audio: Go to brave://settings/content/microphone and add this site to "Allow"\n4. Refresh the page and try again.`);
          } else {
            throw new Error('Microphone access denied. Please allow microphone permissions and try again.');
          }
        } else if (error.name === 'NotFoundError') {
          throw new Error('No microphone found. Please connect a microphone and try again.');
        } else if (error.name === 'NotSupportedError') {
          if (caps.browserName === 'Brave') {
            throw new Error('Audio capture not supported. Try using HTTPS or enable experimental features in brave://flags/');
          } else {
            throw new Error('Audio capture not supported in this browser.');
          }
        } else if (error.message.includes('display-capture')) {
          if (caps.browserName === 'Brave') {
            throw new Error(`Brave Browser: System audio capture blocked by permissions policy. To fix this:\n1. Go to brave://settings/content/sound\n2. Add this site to "Allow"\n3. Enable "Use hardware acceleration when available"\n4. Try using microphone mode instead of system audio.`);
          } else {
            throw new Error('System audio capture blocked by browser policy. Try microphone mode instead.');
          }
        } else {
          throw new Error(`Audio access failed: ${error.message}`);
        }
      }
      throw error;
    }
    
    return null;
  }, [streamQuality, qualitySettings, getBrowserCapabilities]);

  // Audio level monitoring
  const startAudioLevelMonitoring = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const monitor = () => {
      if (!analyserRef.current || !isStreaming) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(average / 255);
      
      animationFrameRef.current = requestAnimationFrame(monitor);
    };
    
    monitor();
  }, [isStreaming]);

  // Start streaming
  const startStreaming = useCallback(async () => {
    if (streamType === 'file') {
      toast.info('Please upload a file to start streaming');
      return;
    }

    if (isStreaming) return;
    setError(null);

    try {
      if (!initializeAudioContext()) {
        throw new Error('Failed to initialize audio context');
      }

      const stream = await getMediaStream(streamType);
      if (!stream) {
        throw new Error('Failed to get media stream');
      }

      mediaStreamRef.current = stream;
      setIsStreaming(true);
      setIsConnected(true);

      // Connect audio monitoring
      if (audioContextRef.current && analyserRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
      }

      startAudioLevelMonitoring();

      // Notify server
      if (socket) {
        sendWSRequest({
          ws: socket,
          request: {
            type: ClientActionEnum.enum.START_AUDIO_STREAM,
            roomId,
            streamType: streamType as 'system' | 'mic',
            quality: streamQuality
          }
        });
      }

      toast.success(`Started ${streamType} streaming`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start streaming';
      setError(message);
      toast.error(message);
    }
  }, [streamType, isStreaming, initializeAudioContext, getMediaStream, startAudioLevelMonitoring, socket, roomId, streamQuality]);

  // Stop streaming
  const stopStreaming = useCallback(() => {
    try {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      setIsStreaming(false);
      setIsConnected(false);
      setAudioLevel(0);

      if (socket) {
        sendWSRequest({
          ws: socket,
          request: {
            type: ClientActionEnum.enum.STOP_AUDIO_STREAM,
            roomId
          }
        });
      }

      toast.success('Stopped streaming');
    } catch (error) {
      console.error('Failed to stop streaming:', error);
      toast.error('Failed to stop streaming');
    }
  }, [socket, roomId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isStreaming) {
        stopStreaming();
      }
    };
  }, [isStreaming, stopStreaming]);

  // Recommendation banner
  const RecommendationBanner = () => {
    const capabilities = getBrowserCapabilities();
    const currentIsOptimal = (
      (streamType === 'system' && capabilities.recommendedMethod === 'system') ||
      (streamType === 'mic' && capabilities.recommendedMethod === 'microphone') ||
      (streamType === 'file' && capabilities.recommendedMethod === 'file')
    );
    
    if (currentIsOptimal) return null;
    
    return (
      <div className="p-2 bg-amber-900/20 border border-amber-700/30 rounded text-amber-300 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span>
            💡 Tip: <button 
              onClick={() => setStreamType(capabilities.recommendedMethod === 'microphone' ? 'mic' : capabilities.recommendedMethod as StreamType)}
              className="underline hover:text-amber-200"
            >
              Switch to {capabilities.recommendedMethod}
            </button> for best performance on {capabilities.browserName}
          </span>
        </div>
      </div>
    );
  };

  // Stream type buttons
  const StreamTypeButtons = () => (
    <div className="grid grid-cols-3 gap-2">
      {[
        { type: 'system' as const, icon: MonitorSpeaker, label: 'System' },
        { type: 'mic' as const, icon: Mic, label: 'Microphone' },
        { type: 'file' as const, icon: Upload, label: 'File' }
      ].map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => setStreamType(type)}
          className={cn(
            "p-2 rounded-md text-sm font-medium transition-colors",
            streamType === type
              ? "bg-primary-600 text-white"
              : "bg-neutral-700 text-gray-300 hover:bg-neutral-600"
          )}
          disabled={isStreaming}
        >
          <Icon className="h-4 w-4 mx-auto mb-1" />
          {label}
        </button>
      ))}
    </div>
  );

  // Audio level indicator
  const AudioLevelIndicator = () => (
    isStreaming && streamType !== 'file' ? (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">Audio Level</span>
          <span className="text-xs text-gray-400">{(audioLevel * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-neutral-700 rounded-full h-2">
          <OptimizedMotion
            className="h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
            initial={{ width: 0 }}
            animate={{ width: `${audioLevel * 100}%` }}
            transition={{ duration: 0.1 }}
          >
            <div />
          </OptimizedMotion>
        </div>
      </div>
    ) : null
  );

  // Control button
  const ControlButton = () => (
    streamType !== 'file' ? (
      <OptimizedMotion
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <button
          onClick={isStreaming ? stopStreaming : startStreaming}
          className={cn(
            "w-full p-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2",
            isStreaming
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-primary-600 hover:bg-primary-700 text-white"
          )}
        >
          {isStreaming ? (
            <>
              <Square className="h-4 w-4" />
              Stop Streaming
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Start {streamType === 'system' ? 'System Audio' : 'Microphone'} Streaming
            </>
          )}
        </button>
      </OptimizedMotion>
    ) : null
  );

  return (
    <div className={cn("bg-neutral-800/50 rounded-lg p-4 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary-400" />
          <h3 className="font-semibold text-white">Audio Stream</h3>
        </div>
        <div className="flex items-center gap-1">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-400" />
          ) : (
            <WifiOff className="h-4 w-4 text-gray-400" />
          )}
          <span className="text-xs text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <RecommendationBanner />
      <StreamTypeButtons />

      {/* File Upload Interface */}
      {streamType === 'file' && (
        <UniversalAudioUploader 
          onAudioProcess={(audioData: Float32Array, sampleRate: number) => {
            if (socket && isConnected) {
              sendWSRequest({
                ws: socket,
                request: {
                  type: ClientActionEnum.enum.STREAM_AUDIO_CHUNK,
                  roomId,
                  audioData: Array.from(audioData),
                  sampleRate,
                  channelCount: 1,
                  timestamp: Date.now()
                }
              });
            }
          }}
        />
      )}

      {/* Real-time Streaming Controls */}
      {streamType !== 'file' && (
        <>
          {/* Quality Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Stream Quality</label>
            <div className="flex gap-1">
              {(['low', 'medium', 'high'] as const).map((quality) => (
                <button
                  key={quality}
                  onClick={() => setStreamQuality(quality)}
                  className={cn(
                    "flex-1 px-2 py-1 rounded text-xs font-medium transition-colors",
                    streamQuality === quality
                      ? "bg-primary-600 text-white"
                      : "bg-neutral-700 text-gray-400 hover:bg-neutral-600"
                  )}
                  disabled={isStreaming}
                >
                  {quality.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <AudioLevelIndicator />
          
          {/* Error Display */}
          {error && (
            <div className="p-2 bg-red-900/30 border border-red-700/50 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* HTTPS Warning */}
          {typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost' && (
            <div className="p-2 bg-yellow-900/30 border border-yellow-700/50 rounded text-yellow-400 text-sm">
              ⚠️ HTTPS required for microphone access in production
            </div>
          )}

          <ControlButton />
        </>
      )}
    </div>
  );
};
