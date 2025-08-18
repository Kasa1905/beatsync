"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileAudio, X } from "lucide-react";
import { motion } from "motion/react";

interface LocalAudioUploaderProps {
  onFileSelect?: (file: File, url: string) => void;
  className?: string;
}

export const LocalAudioUploader = ({ onFileSelect, className = "" }: LocalAudioUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file (MP3, WAV, etc.)');
      return;
    }

    // Create object URL for local playback
    const url = URL.createObjectURL(file);
    
    setSelectedFile(file);
    setAudioUrl(url);
    
    // Notify parent component
    if (onFileSelect) {
      onFileSelect(file, url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const clearSelection = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setSelectedFile(null);
    setAudioUrl(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`local-audio-uploader ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50/10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {!selectedFile ? (
          <div className="text-center">
            <motion.div
              animate={{ y: isDragOver ? -5 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            </motion.div>
            
            <h3 className="text-lg font-medium text-white mb-2">
              Upload Audio File
            </h3>
            <p className="text-gray-400 mb-4">
              Drag and drop an MP3, WAV, or other audio file here
            </p>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
            
            <p className="text-xs text-gray-500 mt-2">
              Supports: MP3, WAV, OGG, M4A (Max 50MB)
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* File Info */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <FileAudio className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">
                  {selectedFile.name}
                </h4>
                <p className="text-gray-400 text-sm">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
              
              <Button
                onClick={clearSelection}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Audio Preview */}
            {audioUrl && (
              <audio 
                controls 
                className="w-full"
                src={audioUrl}
              />
            )}
            
            <div className="text-xs text-green-400">
              ✅ File ready for local playback
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />
    </div>
  );
};
