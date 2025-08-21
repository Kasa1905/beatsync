"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState, ErrorState, LoadingSpinner } from "@/components/ui/states";
import { fetchDiscoverRooms } from "@/lib/api";
import { generateName } from "@/lib/randomNames";
import { cn, extractFileNameFromUrl, getOldestClient } from "@/lib/utils";
import { useRoomStore } from "@/store/room";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Music, Users2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";

export const ActiveRooms = () => {
  const router = useRouter();
  const posthog = usePostHog();
  const username = useRoomStore((state) => state.username);
  const setUsername = useRoomStore((state) => state.setUsername);

  const { data: discoverRooms, isLoading, error, refetch } = useQuery({
    queryKey: ["discover-rooms"],
    queryFn: fetchDiscoverRooms,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
    refetchIntervalInBackground: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const handleJoinRoom = (roomId: string) => {
    // Ensure username is set
    if (!username) {
      const generatedName = generateName();
      setUsername(generatedName);
    }

    posthog.capture("join_room_from_discover", {
      room_id: roomId,
      username: username || "generated",
    });
    router.push(`/room/${roomId}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <motion.div
        className="mt-12 w-full max-w-[32rem] mb-32"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="text-center">
          <LoadingSpinner text="Discovering active rooms..." />
        </div>
      </motion.div>
    );
  }

  // Show error state
  if (error) {
    return (
      <motion.div
        className="mt-12 w-full max-w-[32rem] mb-32"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <ErrorState
          title="Unable to discover rooms"
          description="We couldn't load active rooms. Please check your connection and try again."
          onRetry={() => refetch()}
        />
      </motion.div>
    );
  }

  // Show empty state
  if (!discoverRooms || discoverRooms.length === 0) {
    return (
      <motion.div
        className="mt-12 w-full max-w-[32rem] mb-32"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <EmptyState
          icon={<Music className="w-12 h-12" />}
          title="No active rooms"
          description="No public rooms are currently playing music. Create a room to get started!"
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mt-12 w-full max-w-[32rem] mb-32"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h3 className="text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-[0.1em]">
        Playing Now
      </h3>
      <div className="space-y-1">
        <AnimatePresence initial={true}>
          {discoverRooms.map((room, index) => (
            <motion.div
              key={room.roomId}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: -10,
                transition: {
                  duration: 0.3,
                  ease: [0.25, 0.1, 0.25, 1],
                },
              }}
              transition={{
                layout: {
                  type: "spring",
                  stiffness: 300,
                  damping: 40,
                  mass: 0.8,
                },
                opacity: {
                  duration: 0.6,
                  delay: 0.5 + 0.04 * index,
                  ease: [0.25, 0.1, 0.25, 1],
                },
                y: {
                  duration: 0.6,
                  delay: 0.5 + 0.04 * index,
                  ease: [0.25, 0.1, 0.25, 1],
                },
              }}
              className={cn(
                "group relative rounded-md p-3 -mx-3",
                "hover:bg-white/[0.05] transition-colors duration-200 cursor-pointer"
              )}
              onClick={() => handleJoinRoom(room.roomId)}
            >
              <div className="flex items-center gap-3">
                {/* Flag indicator - show oldest user's flag */}
                <div className="relative size-10 flex-shrink-0">
                  {(() => {
                    const oldestClient = getOldestClient(room.clients);
                    const flagSvgURL = oldestClient.location?.flagSvgURL;
                    const isPlaying = room.playbackState.type === "playing";

                    return (
                      <div
                        className={cn(
                          "w-full h-full rounded flex items-center justify-center overflow-hidden",
                          isPlaying && ""
                        )}
                      >
                        {flagSvgURL ? (
                          <Image
                            src={flagSvgURL}
                            alt={`${oldestClient.location?.country || "Country"} flag`}
                            className="w-full h-full object-cover"
                            width={40}
                            height={40}
                            unoptimized // SVG flags don't need optimization
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                            <Users2 className="w-4 h-4 text-neutral-500" />
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Room Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-white truncate">
                      {extractFileNameFromUrl(room.playbackState.audioSource)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-500">
                      <span className="font-mono">{room.roomId}</span>
                      {(() => {
                        const oldestClient = getOldestClient(room.clients);
                        const city = oldestClient.location?.city;
                        const region = oldestClient.location?.region;
                        const country = oldestClient.location?.country;
                        const locationParts = Array.from(
                          new Set([city, region, country].filter(Boolean))
                        );

                        if (locationParts.length > 0) {
                          return (
                            <>
                              <span className="mx-1.5 inline-block size-[3px] rounded-full bg-neutral-600 align-middle"></span>
                              <span className="font-normal">
                                {locationParts.join(", ")}
                              </span>
                            </>
                          );
                        }
                        return null;
                      })()}
                    </p>
                    {/* Stacked country flag avatars */}
                    <div className="flex items-center gap-1 pl-2">
                      <div className="flex -space-x-2.5">
                        {room.clients.slice(0, 5).map((client) => (
                          <Avatar
                            key={client.clientId}
                            className="size-[18px] ring-1 ring-black/60"
                          >
                            {client.location?.flagSvgURL ? (
                              <AvatarImage
                                src={client.location.flagSvgURL}
                                alt={`${
                                  client.location.country || "Country"
                                } flag`}
                                loading="lazy" // Optimize for low internet
                              />
                            ) : (
                              <AvatarFallback className="bg-neutral-800">
                                <Users2 className="w-2 h-2 text-neutral-500" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                        ))}
                      </div>
                      {room.clients.length > 5 && (
                        <span className="text-[10px] text-neutral-500 font-medium">
                          +{room.clients.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 transition-colors flex-shrink-0" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
