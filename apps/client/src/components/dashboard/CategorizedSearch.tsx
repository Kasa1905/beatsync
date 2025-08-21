"use client";

import { motion } from "motion/react";
import { useGlobalStore, useCanMutate } from "@/store/global";
import { sendWSRequest } from "@/utils/ws";
import { ClientActionEnum } from "@beatsync/shared";
import { Music, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePostHog } from "posthog-js/react";
import { toast } from "sonner";
import Image from "next/image";

interface CategorizedSearchProps {
  className?: string;
  onTrackSelect?: () => void;
}

export function CategorizedSearch({ className, onTrackSelect }: CategorizedSearchProps) {
  const socket = useGlobalStore((state) => state.socket);
  const searchQuery = useGlobalStore((state) => state.searchQuery);
  const searchResults = useGlobalStore((state) => state.searchResults);
  const isSearching = useGlobalStore((state) => state.isSearching);
  const canMutate = useCanMutate();
  const posthog = usePostHog();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddTrack = (track: any) => {
    if (!socket || !canMutate) {
      toast.error("Cannot add tracks");
      return;
    }

    posthog.capture("add_track", {
      trackId: track.id || track.url,
      trackName: track.title,
      searchQuery,
    });

    sendWSRequest({
      ws: socket,
      request: {
        type: ClientActionEnum.enum.STREAM_MUSIC,
        trackId: track.spotifyId || track.id || track.url,
        trackName: track.title,
      },
    });

    onTrackSelect?.();
    toast.success(`Adding "${track.title}" to queue...`);
  };

  // Get track results from search
  const getTrackResults = () => {
    if (!searchResults || searchResults.type === "error") return [];
    
    const responseData = searchResults.response;
    
    // Handle different response formats
    if ('results' in responseData) {
      return responseData.results;
    }
    
    // Legacy Spotify format
    if ('data' in responseData && responseData.data?.tracks?.items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return responseData.data.tracks.items.map((track: any) => ({
        id: track.id,
        title: track.title || track.name,
        artist: track.performer?.name || track.artist || "Unknown Artist",
        url: track.preview || track.url || "",
        thumbnail: track.album?.image?.thumbnail || track.thumbnail,
        source: "spotify" as const,
        spotifyId: track.id,
        duration: track.duration,
      }));
    }
    
    return [];
  };

  const trackResults = getTrackResults();

  // Empty state
  if (!searchQuery) {
    return (
      <div className={cn("p-8 text-center", className)}>
        <h3 className="text-lg font-medium text-white mb-2">
          Start typing to search
        </h3>
        <p className="text-neutral-400 text-sm">
          Find songs to add to your room
        </p>
      </div>
    );
  }

  // Loading state
  if (isSearching) {
    return (
      <div className={cn("p-8 text-center", className)}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="size-6 animate-spin rounded-full border-2 border-neutral-600 border-t-green-500" />
          <p className="text-neutral-400 text-sm">Searching...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Simple header */}
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-800">
        <Music className="size-4 text-green-500" />
        <h3 className="text-sm font-medium text-white">Search Results</h3>
        {trackResults.length > 0 && (
          <span className="text-xs text-neutral-400">
            {trackResults.length} track{trackResults.length !== 1 ? "s" : ""} found
          </span>
        )}
      </div>

      {/* Track results */}
      {trackResults.length > 0 ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {trackResults.map((track: any, index: number) => (
            <motion.div
              key={track.id || track.url || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group flex items-center gap-3 p-3 rounded-md hover:bg-neutral-800 transition-colors"
            >
              {track.thumbnail && (
                <Image
                  src={track.thumbnail}
                  alt={track.title}
                  width={50}
                  height={50}
                  className="rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{track.title}</p>
                <p className="text-sm text-neutral-400 truncate">{track.artist}</p>
                {track.duration && (
                  <p className="text-xs text-neutral-500">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </p>
                )}
              </div>
              {canMutate && (
                <Button
                  onClick={() => handleAddTrack(track)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Play className="size-4" />
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-neutral-400">No results found for &quot;{searchQuery}&quot;</p>
          <p className="text-xs text-neutral-500 mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
