"use client";

import { uploadAudioFile } from "@/lib/api";
import { cn, trimFileName } from "@/lib/utils";
import { useCanMutate } from "@/store/global";
import { useRoomStore } from "@/store/room";
import { CloudUpload, Plus, X, CheckCircle, AlertCircle } from "lucide-react";
import { usePostHog } from "./PostHogProvider";
import { useState } from "react";
import { toast } from "sonner";

interface UploadProgress {
  id: string;
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export const MultiAudioUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const canMutate = useCanMutate();
  const roomId = useRoomStore((state) => state.roomId);
  const posthog = usePostHog();

  const isDisabled = !canMutate;
  const hasActiveUploads = uploads.some(upload => upload.status === 'uploading');

  const updateUploadProgress = (id: string, updates: Partial<UploadProgress>) => {
    setUploads(prev => prev.map(upload => 
      upload.id === id ? { ...upload, ...updates } : upload
    ));
  };

  const removeUpload = (id: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== id));
  };

  const handleFileUpload = async (file: File) => {
    if (isDisabled) return;

    const uploadId = Math.random().toString(36).substr(2, 9);
    
    // Add to upload queue
    setUploads(prev => [...prev, {
      id: uploadId,
      file,
      status: 'uploading',
      progress: 0
    }]);

    // Track upload initiated
    posthog.capture("upload_initiated", {
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      room_id: roomId,
    });

    try {
      // Simulate progress (since actual upload progress isn't easily trackable)
      const progressInterval = setInterval(() => {
        updateUploadProgress(uploadId, { 
          progress: Math.min(90, Math.random() * 30 + 60) 
        });
      }, 500);

      // Upload the file to the server
      await uploadAudioFile({
        file,
        roomId,
      });

      clearInterval(progressInterval);
      
      // Mark as complete
      updateUploadProgress(uploadId, { 
        status: 'success', 
        progress: 100 
      });

      // Track successful upload
      posthog.capture("upload_success", {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        room_id: roomId,
      });

      toast.success(`${file.name} uploaded successfully!`);
      
      // Remove from list after 3 seconds
      setTimeout(() => removeUpload(uploadId), 3000);
      
    } catch (err) {
      console.error("Error during upload:", err);
      
      updateUploadProgress(uploadId, { 
        status: 'error',
        progress: 0,
        error: err instanceof Error ? err.message : "Unknown error"
      });

      toast.error(`Failed to upload ${file.name}`);

      // Track upload failure
      posthog.capture("upload_failed", {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        room_id: roomId,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleMultipleFiles = (files: FileList | File[]) => {
    if (isDisabled) return;
    
    const audioFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith("audio/")) {
        toast.error(`${file.name} is not an audio file`);
        return false;
      }
      return true;
    });

    if (audioFiles.length === 0) {
      toast.error("Please select audio files");
      return;
    }

    if (audioFiles.length > 10) {
      toast.error("Maximum 10 files can be uploaded at once");
      return;
    }

    // Upload all files
    audioFiles.forEach(file => handleFileUpload(file));
    
    toast.success(`Started uploading ${audioFiles.length} file(s)`);
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    handleMultipleFiles(files);
    
    // Reset input
    event.target.value = '';
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const onDropEvent = (event: React.DragEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    handleMultipleFiles(files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      {/* Upload Zone */}
      <div
        className={cn(
          "border border-neutral-700/50 rounded-md mx-2 transition-all overflow-hidden",
          isDisabled
            ? "bg-neutral-800/20 opacity-50"
            : "bg-neutral-800/30 hover:bg-neutral-800/50",
          isDragging && !isDisabled
            ? "outline outline-primary-400 outline-dashed"
            : "outline-none"
        )}
        id="drop_zone"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDragEnd={onDragLeave}
        onDrop={onDropEvent}
        title={
          isDisabled ? "Admin-only mode - only admins can upload" : undefined
        }
      >
        <label
          htmlFor="audio-upload"
          className={cn("block w-full", isDisabled ? "" : "cursor-pointer")}
        >
          <div className="p-3 flex items-center gap-3">
            <div
              className={cn(
                "p-1.5 rounded-md flex-shrink-0",
                isDisabled
                  ? "bg-neutral-600 text-neutral-400"
                  : "bg-primary-700 text-white"
              )}
            >
              {hasActiveUploads ? (
                <CloudUpload className="h-4 w-4 animate-pulse" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">
                {hasActiveUploads
                  ? `Uploading ${uploads.filter(u => u.status === 'uploading').length} file(s)...`
                  : "Upload audio files"}
              </div>
              {!hasActiveUploads && (
                <div
                  className={cn(
                    "text-xs truncate",
                    isDisabled ? "text-neutral-500" : "text-neutral-400"
                  )}
                >
                  {isDisabled
                    ? "Must be an admin to upload"
                    : "Drag & drop multiple files or click to select"}
                </div>
              )}
            </div>
          </div>
        </label>

        <input
          id="audio-upload"
          type="file"
          accept="audio/mpeg,audio/mp3,audio/wav,audio/aac,audio/ogg,audio/webm,audio/flac,.mp3,.wav,.m4a,.aac,.ogg,.webm,.flac"
          onChange={onInputChange}
          disabled={isDisabled}
          multiple
          className="hidden"
        />
      </div>

      {/* Upload Progress List */}
      {uploads.length > 0 && (
        <div className="mx-2 space-y-1">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="bg-neutral-800/40 border border-neutral-700/30 rounded p-2 flex items-center gap-2"
            >
              <div className="flex-shrink-0">
                {upload.status === 'uploading' && (
                  <CloudUpload className="h-3 w-3 text-blue-400 animate-pulse" />
                )}
                {upload.status === 'success' && (
                  <CheckCircle className="h-3 w-3 text-green-400" />
                )}
                {upload.status === 'error' && (
                  <AlertCircle className="h-3 w-3 text-red-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">
                  {trimFileName(upload.file.name)}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-neutral-400">
                    {formatFileSize(upload.file.size)}
                  </div>
                  {upload.status === 'uploading' && (
                    <div className="flex-1 bg-neutral-700 rounded-full h-1">
                      <div 
                        className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  )}
                  {upload.status === 'error' && upload.error && (
                    <div className="text-xs text-red-400 truncate">
                      {upload.error}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => removeUpload(upload.id)}
                className="flex-shrink-0 p-1 hover:bg-neutral-700 rounded"
                title="Remove"
              >
                <X className="h-3 w-3 text-neutral-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
