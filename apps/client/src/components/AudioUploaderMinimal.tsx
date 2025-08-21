"use client";

import { uploadAudioFile } from "@/lib/api";
import { cn, trimFileName } from "@/lib/utils";
"use client";

import { uploadAudioFile } from "@/lib/api";
import { cn, trimFileName } from "@/lib/utils";
import { useCanMutate } from "@/store/global";
import { useRoomStore } from "@/store/room";
import { CloudUpload, Plus } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { toast } from "sonner";

export const AudioUploaderMinimal = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const canMutate = useCanMutate();
  const roomId = useRoomStore((state) => state.roomId);
  const posthog = usePostHog();

  const isDisabled = !canMutate;

  const handleFileUpload = async (file: File) => {
    if (isDisabled) return;

    // Store file name for display
    setFileName(file.name);

    // Track upload initiated
    posthog.capture("upload_initiated", {
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      room_id: roomId,
    });

    try {
      setIsUploading(true);

      // Upload the file to the server
      await uploadAudioFile({
        file,
        roomId,
      });

      // Track successful upload
      posthog.capture("upload_success", {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        room_id: roomId,
      });

      toast.success("Audio uploaded successfully!");
      setTimeout(() => setFileName(null), 3000);
    } catch (err) {
      console.error("Error during upload:", err);
      toast.error("Failed to upload audio file");
      setFileName(null);

      // Track upload failure
      posthog.capture("upload_failed", {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        room_id: roomId,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate audio file
    if (!file.type.startsWith("audio/")) {
      toast.error("Please select an audio file");
      return;
    }

    handleFileUpload(file);
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

    const file = event.dataTransfer?.files?.[0];
    if (!file) return;

    // Validate audio file
    if (!file.type.startsWith("audio/")) {
      toast.error("Please select an audio file");
      return;
    }

    handleFileUpload(file);
  };

  return (
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
            {isUploading ? (
              <CloudUpload className="h-4 w-4 animate-pulse" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">
              {isUploading
                ? "Uploading..."
                : fileName
                ? trimFileName(fileName)
                : "Upload audio"}
            </div>
            {!isUploading && !fileName && (
              <div
                className={cn(
                  "text-xs truncate",
                  isDisabled ? "text-neutral-500" : "text-neutral-400"
                )}
              >
                {isDisabled
                  ? "Must be an admin to upload"
                  : "Add music to queue"}
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
        disabled={isUploading || isDisabled}
        className="hidden"
      />
    </div>
  );
};
import { useRoomStore } from "@/store/room";
import { CloudUpload, Plus } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { toast } from "sonner";

export const AudioUploaderMinimal = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const canMutate = useCanMutate();
  const roomId = useRoomStore((state) => state.roomId);
  const posthog = usePostHog();

  const isDisabled = !canMutate;

  const handleFileUpload = async (file: File) => {
    if (isDisabled) return;

    // Store file name for display
    setFileName(file.name);

    // Track upload initiated
    posthog.capture("upload_initiated", {
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      room_id: roomId,
    });

    try {
      setIsUploading(true);

      // Try cloud upload first, fallback to local if S3 not configured
      try {
        await uploadAudioFile({
          file,
          roomId,
        });
        
        toast.success(`${trimFileName(file.name)} uploaded successfully!`);
      } catch (cloudError) {
        console.warn("Cloud upload failed, falling back to local file:", cloudError);
        
        // Create local object URL for the file
        const localUrl = URL.createObjectURL(file);
        console.log("Created local URL:", localUrl);
        
        // Add local file to the audio sources using the proper store method
        const currentSources = useGlobalStore.getState().audioSources.map(as => as.source);
        const newSource = { url: localUrl };
        
        console.log("Current sources:", currentSources);
        console.log("Adding new source:", newSource);
        
        // Use the store's handler to properly add the new source
        useGlobalStore.getState().handleSetAudioSources({
          type: "SET_AUDIO_SOURCES",
          sources: [...currentSources, newSource],
          currentAudioSource: undefined
        });
        
        // Verify the source was added
        const updatedSources = useGlobalStore.getState().audioSources;
        console.log("Updated audio sources:", updatedSources);
        
        toast.success(`${trimFileName(file.name)} ready for local playback!`);
        console.log("Local file URL created and added to queue:", localUrl);
      }

      // Track successful upload
      posthog.capture("upload_success", {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        room_id: roomId,
      });

      setTimeout(() => setFileName(null), 3000);
    } catch (err) {
      console.error("Error during upload:", err);
      toast.error("Failed to upload audio file");
      setFileName(null);

      // Track upload failure
      posthog.capture("upload_failed", {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        room_id: roomId,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    const file = event.target.files?.[0];
    if (!file) return;
    handleFileUpload(file);
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

    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    // make sure we only allow audio files
    if (!file.type.startsWith("audio/")) {
      toast.error("Please select an audio file");
      return;
    }

    handleFileUpload(file);
  };

  return (
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
            {isUploading ? (
              <CloudUpload className="h-4 w-4 animate-pulse" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">
              {isUploading
                ? "Uploading..."
                : fileName
                ? trimFileName(fileName)
                : "Upload audio"}
            </div>
            {!isUploading && !fileName && (
              <div
                className={cn(
                  "text-xs truncate",
                  isDisabled ? "text-neutral-500" : "text-neutral-400"
                )}
              >
                {isDisabled
                  ? "Must be an admin to upload"
                  : "Add music to queue"}
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
        disabled={isUploading || isDisabled}
        className="hidden"
      />
    </div>
  );
};
