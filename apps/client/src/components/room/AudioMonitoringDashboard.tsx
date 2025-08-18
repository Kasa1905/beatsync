"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AudioStreamVisualizer } from "./AudioStreamVisualizer";
import { Activity, Headphones, Radio, TrendingUp } from "lucide-react";

interface AudioMonitoringDashboardProps {
  className?: string;
}

interface AudioStreamInfo {
  userId: string;
  username: string;
  audioSource: 'mic' | 'system' | 'file' | 'none';
  isPlaying: boolean;
  isMuted: boolean;
  joinedAt: Date;
  lastActivity: Date;
}

export const AudioMonitoringDashboard = ({ className = "" }: AudioMonitoringDashboardProps) => {
  const [audioStreams, setAudioStreams] = useState<AudioStreamInfo[]>([
    // Mock data for demonstration
    {
      userId: "user-1",
      username: "You",
      audioSource: "mic",
      isPlaying: true,
      isMuted: false,
      joinedAt: new Date(Date.now() - 300000), // 5 minutes ago
      lastActivity: new Date()
    },
    {
      userId: "user-2", 
      username: "easygoing-orangutan",
      audioSource: "system",
      isPlaying: true,
      isMuted: false,
      joinedAt: new Date(Date.now() - 180000), // 3 minutes ago
      lastActivity: new Date(Date.now() - 10000) // 10 seconds ago
    },
    {
      userId: "user-3",
      username: "funky-penguin",
      audioSource: "file",
      isPlaying: false,
      isMuted: true,
      joinedAt: new Date(Date.now() - 120000), // 2 minutes ago
      lastActivity: new Date(Date.now() - 60000) // 1 minute ago
    }
  ]);

  const [globalAudioStats, setGlobalAudioStats] = useState({
    totalStreams: 0,
    activeStreams: 0,
    totalBandwidth: 0,
    averageLatency: 0
  });

  // Update audio stats
  useEffect(() => {
    const activeStreams = audioStreams.filter(stream => stream.isPlaying && !stream.isMuted);
    setGlobalAudioStats({
      totalStreams: audioStreams.length,
      activeStreams: activeStreams.length,
      totalBandwidth: activeStreams.length * 128, // Mock: 128 kbps per stream
      averageLatency: Math.random() * 50 + 20 // Mock: 20-70ms
    });
  }, [audioStreams]);

  // Mock real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAudioStreams(prev => prev.map(stream => ({
        ...stream,
        lastActivity: stream.isPlaying && !stream.isMuted 
          ? new Date() 
          : stream.lastActivity
      })));
      
      setGlobalAudioStats(prev => ({
        ...prev,
        averageLatency: Math.random() * 30 + 20,
        totalBandwidth: prev.activeStreams * (120 + Math.random() * 16) // 120-136 kbps
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStreamStatusColor = (stream: AudioStreamInfo) => {
    if (!stream.isPlaying) return "text-gray-500";
    if (stream.isMuted) return "text-orange-500";
    return "text-green-500";
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className={`audio-monitoring-dashboard ${className}`}>
      {/* Dashboard Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Audio Stream Monitor</h3>
          <motion.div 
            className="w-2 h-2 bg-green-500 rounded-full"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        
        {/* Global Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-sm text-gray-400">Total Streams</div>
                <div className="text-lg font-bold text-white">{globalAudioStats.totalStreams}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-green-400" />
              <div>
                <div className="text-sm text-gray-400">Active</div>
                <div className="text-lg font-bold text-green-400">{globalAudioStats.activeStreams}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-sm text-gray-400">Bandwidth</div>
                <div className="text-lg font-bold text-purple-400">
                  {Math.round(globalAudioStats.totalBandwidth)} kbps
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" />
              <div>
                <div className="text-sm text-gray-400">Latency</div>
                <div className="text-lg font-bold text-orange-400">
                  {Math.round(globalAudioStats.averageLatency)}ms
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Stream List */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Active Audio Streams</h4>
        
        <AnimatePresence>
          {audioStreams.map((stream) => (
            <motion.div
              key={stream.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Status Indicator */}
                <div className="mt-2">
                  <motion.div 
                    className={`w-3 h-3 rounded-full ${
                      stream.isPlaying && !stream.isMuted 
                        ? 'bg-green-500' 
                        : stream.isMuted 
                          ? 'bg-orange-500' 
                          : 'bg-gray-500'
                    }`}
                    animate={stream.isPlaying && !stream.isMuted ? {
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1]
                    } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>
                
                {/* Audio Visualizer */}
                <div className="flex-1">
                  <AudioStreamVisualizer
                    userId={stream.userId}
                    username={stream.username}
                    audioSource={stream.audioSource}
                    isPlaying={stream.isPlaying}
                    isMuted={stream.isMuted}
                  />
                </div>
                
                {/* Stream Info */}
                <div className="text-xs text-gray-400 text-right min-w-0">
                  <div className={`font-medium ${getStreamStatusColor(stream)}`}>
                    {stream.isPlaying 
                      ? stream.isMuted 
                        ? 'Muted' 
                        : 'Streaming'
                      : 'Idle'}
                  </div>
                  <div>Joined {getTimeAgo(stream.joinedAt)}</div>
                  <div>Active {getTimeAgo(stream.lastActivity)}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {audioStreams.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Radio className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No audio streams detected</p>
            <p className="text-sm">Start streaming to see audio visualization</p>
          </div>
        )}
      </div>

      {/* Technical Information */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <details className="group">
          <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
            Technical Details
          </summary>
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <div>• Audio format: WebM/Opus, 48kHz, Stereo</div>
            <div>• Visualization: Real-time FFT analysis (256 samples)</div>
            <div>• Update rate: 60fps for visualizer, 1Hz for stats</div>
            <div>• Supported sources: Microphone, System Audio, Audio Files</div>
          </div>
        </details>
      </div>
    </div>
  );
};
