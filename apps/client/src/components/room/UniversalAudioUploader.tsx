"use client";

import { useState, useRef } from 'react';
import { cn } from "@/lib/utils";
import { Upload, File, Play, Pause, Volume2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface UniversalAudioUploaderProps {
  onAudioProcess?: (audioData: Float32Array, sampleRate: number) => void;
  className?: string;
}

export const UniversalAudioUploader: React.FC<UniversalAudioUploaderProps> = ({
  onAudioProcess,
  className
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = [
    'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 
    'audio/flac', 'audio/m4a', 'audio/webm', 'audio/x-m4a'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const audioFiles = files.filter(file => 
      supportedFormats.some(format => file.type.startsWith(format.split('/')[0])) ||
      /\.(mp3|wav|ogg|aac|flac|m4a|webm)$/i.test(file.name)
    );

    if (audioFiles.length === 0) {
      toast.error('Please select a valid audio file');
      return;
    }

    const file = audioFiles[0];
    setAudioFile(file);
    
    // Create object URL for playback
    const url = URL.createObjectURL(file);
    setAudioURL(url);
    
    toast.success(`Audio file loaded: ${file.name}`);
  };

  const processAudioFile = async (file: File) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext || AudioContext)();
      }

      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      // Get audio data
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      
      // Process in chunks to simulate streaming
      const chunkSize = 4096;
      for (let i = 0; i < channelData.length; i += chunkSize) {
        const chunk = channelData.slice(i, i + chunkSize);
        onAudioProcess?.(chunk, sampleRate);
        
        // Add delay to simulate real-time streaming
        await new Promise(resolve => setTimeout(resolve, (chunkSize / sampleRate) * 1000));
      }
      
      toast.success('Audio processing completed');
    } catch (error) {
      console.error('Failed to process audio file:', error);
      toast.error('Failed to process audio file');
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seekTime = percentage * duration;
    
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* File Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          dragActive
            ? "border-primary-400 bg-primary-900/20"
            : "border-neutral-600 hover:border-neutral-500 bg-neutral-800/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="audio/*"
          onChange={handleFileInput}
        />
        
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-neutral-400" />
          <div className="text-sm text-neutral-300">
            {audioFile ? (
              <div className="space-y-1">
                <p className="font-medium text-white">{audioFile.name}</p>
                <p className="text-xs text-neutral-400">
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <>
                <p>Drop audio file here or click to browse</p>
                <p className="text-xs text-neutral-400">
                  Supports MP3, WAV, OGG, AAC, FLAC, M4A
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Audio Player */}
      {audioURL && (
        <div className="space-y-3 p-4 bg-neutral-800/50 rounded-lg">
          <audio
            ref={audioRef}
            src={audioURL}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayback}
              className="p-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              
              <div
                className="h-2 bg-neutral-700 rounded-full cursor-pointer"
                onClick={handleSeek}
              >
                <motion.div
                  className="h-2 bg-primary-500 rounded-full"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>
            
            <Volume2 className="h-4 w-4 text-neutral-400" />
          </div>
          
          <motion.button
            onClick={() => audioFile && processAudioFile(audioFile)}
            className="w-full p-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Stream Audio to Room
          </motion.button>
        </div>
      )}
      
      {/* Format Support Info */}
      <div className="text-xs text-neutral-400 space-y-1">
        <p className="font-medium">✅ Universal Browser Support:</p>
        <p>• Works on all browsers including Safari, Brave, Firefox</p>
        <p>• Perfect for mobile devices and tablets</p>
        <p>• No permission required - just upload and stream</p>
      </div>
    </div>
  );
};
