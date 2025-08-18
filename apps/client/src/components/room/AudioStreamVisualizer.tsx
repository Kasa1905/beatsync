"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { Mic, Monitor, Music, Volume2, VolumeX } from "lucide-react";

interface AudioVisualizerProps {
  userId: string;
  username: string;
  audioSource?: 'mic' | 'system' | 'file' | 'none';
  isPlaying: boolean;
  isMuted: boolean;
  className?: string;
}

export const AudioStreamVisualizer = ({ 
  username, 
  audioSource = 'none', 
  isPlaying, 
  isMuted,
  className = "" 
}: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [audioLevel, setAudioLevel] = useState(0);
  const [frequencyData, setFrequencyData] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(false);

  // Generate mock audio data for demonstration
  const generateMockAudioData = useCallback(() => {
    if (!isPlaying || isMuted) return;
    
    setIsActive(true);
    const mockVisualization = () => {
      if (!isPlaying || isMuted) {
        setIsActive(false);
        return;
      }
      
      // Generate realistic mock audio data
      const mockLevel = Math.random() * 0.7 + 0.1; // 0.1 to 0.8
      const mockFreqData = Array.from({ length: 32 }, (_, i) => {
        const baseLevel = Math.random() * 100;
        const frequency = i / 32;
        // Simulate frequency distribution (more energy in lower frequencies)
        const frequencyWeight = Math.exp(-frequency * 2);
        return Math.min(255, baseLevel * frequencyWeight * mockLevel);
      });
      
      setAudioLevel(mockLevel);
      setFrequencyData(mockFreqData);
      
      animationFrameRef.current = requestAnimationFrame(mockVisualization);
    };
    
    mockVisualization();
  }, [isPlaying, isMuted]);

  // Real audio visualization
  const startVisualization = useCallback(() => {
    if (!analyserRef.current) return;

    const visualize = () => {
      if (!analyserRef.current || !isPlaying || isMuted) {
        setIsActive(false);
        return;
      }

      // Create fresh Uint8Array for each frame to avoid type issues
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate audio level (RMS)
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += (dataArray[i] / 255) ** 2;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      setAudioLevel(rms);
      
      // Get frequency data for bars
      const freqData = Array.from(dataArray.slice(0, 32));
      setFrequencyData(freqData);
      
      animationFrameRef.current = requestAnimationFrame(visualize);
    };

    visualize();
  }, [isPlaying, isMuted]);

  // Initialize audio context and analyzer
  useEffect(() => {
    if (!isPlaying || isMuted) {
      setIsActive(false);
      return;
    }

    const initializeAudio = async () => {
      try {
        // Create audio context
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        
        // Configure analyzer
        analyserRef.current.fftSize = 256;
        
        // Try to get user media based on audio source
        let stream: MediaStream | null = null;
        
        if (audioSource === 'mic') {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch (micError) {
            console.warn('Microphone access denied, using mock data:', micError);
            // Fallback to mock visualization without actual audio input
            generateMockAudioData();
            return;
          }
        } else if (audioSource === 'system') {
          try {
            stream = await navigator.mediaDevices.getDisplayMedia({ 
              audio: true, 
              video: false 
            });
          } catch (systemError) {
            console.warn('Screen capture access denied, using mock data:', systemError);
            // Fallback to mock visualization without actual audio input
            generateMockAudioData();
            return;
          }
        }
        
        if (stream && analyserRef.current) {
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
          setIsActive(true);
          startVisualization();
        }
      } catch (error) {
        console.error('Failed to initialize audio visualization:', error);
        // Generate mock data for demonstration
        generateMockAudioData();
      }
    };

    initializeAudio();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isPlaying, isMuted, audioSource, generateMockAudioData, startVisualization]);

  // Draw waveform on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw frequency bars
    const barWidth = canvas.width / frequencyData.length;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#3b82f6'); // Blue
    gradient.addColorStop(0.5, '#8b5cf6'); // Purple
    gradient.addColorStop(1, '#ec4899'); // Pink

    frequencyData.forEach((value, index) => {
      const barHeight = (value / 255) * canvas.height * 0.8;
      const x = index * barWidth;
      const y = canvas.height - barHeight;
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
  }, [frequencyData, isActive]);

  const getSourceIcon = () => {
    switch (audioSource) {
      case 'mic': return <Mic className="w-3 h-3" />;
      case 'system': return <Monitor className="w-3 h-3" />;
      case 'file': return <Music className="w-3 h-3" />;
      default: return null;
    }
  };

  const getSourceColor = () => {
    switch (audioSource) {
      case 'mic': return 'bg-blue-500';
      case 'system': return 'bg-green-500';
      case 'file': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`audio-visualizer ${className}`}>
      {/* User Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1">
          <span className="text-xs sm:text-sm font-medium text-white truncate max-w-[100px] sm:max-w-none">{username}</span>
          {audioSource !== 'none' && (
            <div className={`p-1 rounded ${getSourceColor()} text-white`}>
              {getSourceIcon()}
            </div>
          )}
        </div>
        
        {/* Audio Level Indicator */}
        <div className="flex items-center gap-1">
          {isMuted ? (
            <VolumeX className="w-3 h-3 text-red-400" />
          ) : (
            <Volume2 className="w-3 h-3 text-green-400" />
          )}
          
          {/* Level Meter */}
          <div className="w-12 sm:w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
              style={{ width: `${(audioLevel * 100)}%` }}
              animate={{ 
                width: `${(audioLevel * 100)}%`,
                opacity: isActive ? 1 : 0.3
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      </div>

      {/* Frequency Visualization */}
      <div className="relative bg-gray-900/50 rounded-lg p-2 border border-gray-700">
        <canvas
          ref={canvasRef}
          width={200}
          height={60}
          className="w-full h-full rounded touch-none"
        />
        
        {/* Overlay for inactive state */}
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 rounded-lg">
            <span className="text-xs text-gray-400">
              {isPlaying ? 'No audio detected' : 'Not streaming'}
            </span>
          </div>
        )}
        
        {/* Audio Source Label */}
        {audioSource !== 'none' && (
          <div className="absolute top-1 right-1">
            <span className="text-xs bg-black/50 text-white px-1 rounded">
              {audioSource.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Real-time Audio Stats - Hide on very small screens */}
      {isActive && (
        <div className="mt-1 text-xs text-gray-400 space-y-1 hidden xs:block">
          <div className="flex justify-between">
            <span>Level:</span>
            <span>{Math.round(audioLevel * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Peak:</span>
            <span>{Math.round(Math.max(...frequencyData) / 255 * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
