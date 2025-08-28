"use client";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useMobileOptimizations } from "@/hooks/useMobileTouch";
import { fetchActiveRooms } from "@/lib/api";
import { generateName } from "@/lib/randomNames";
import { validateFullRoomId, validatePartialRoomId } from "@/lib/room";
import { useRoomStore } from "@/store/room";
import { useQuery } from "@tanstack/react-query";
import { LogIn, PlusCircle } from "lucide-react";
import { SafeMotion } from "./SafeMotion";
import { useRouter } from "next/navigation";
import { usePostHog } from "./PostHogProvider";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ActiveRooms } from "./ActiveRooms";

interface JoinFormData {
  roomId: string;
}

export const Join = () => {
  // Initialize mobile optimizations
  useMobileOptimizations();
  
  const posthog = usePostHog();
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const setUsername = useRoomStore((state) => state.setUsername);
  const username = useRoomStore((state) => state.username);

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm<JoinFormData>({
    defaultValues: {
      roomId: "",
    },
  });

  const roomId = watch("roomId");

  useEffect(() => {
    // Set a random username when component mounts
    const generatedName = generateName();
    setUsername(generatedName);
  }, [setValue, setUsername, posthog]);

  const { data: numActiveUsers } = useQuery({
    queryKey: ["active-rooms"],
    queryFn: fetchActiveRooms,
    refetchInterval: 300, // Poll every
  });

  const router = useRouter();

  const onSubmit = (data: JoinFormData) => {
    setIsJoining(true);
    // Validate roomId
    if (!validateFullRoomId(data.roomId)) {
      toast.error("Invalid room code", {
        description: "Please enter exactly 6 digits to join a room",
        duration: 4000,
      });
      setIsJoining(false);

      // Track validation error
      posthog.capture("join_room_validation_error", {
        room_id: data.roomId,
        error: "Invalid room code",
      });
      return;
    }

    // Show joining feedback
    toast.loading("Joining room...", {
      id: "joining-room",
      description: `Connecting to room ${data.roomId}`,
    });

    // Track join attempt
    posthog.capture("join_room_attempt", {
      room_id: data.roomId,
      username,
    });

    console.log("Joining room with data:", {
      roomId: data.roomId,
      username,
    });
    router.push(`/room/${data.roomId}`);
  };

  const handleCreateRoom = () => {
    setIsCreating(true);

    // Generate a random 6-digit room ID
    const newRoomId = Math.floor(100000 + Math.random() * 900000).toString();

    // Show creation feedback
    toast.loading("Creating room...", {
      id: "creating-room",
      description: `Setting up room ${newRoomId}`,
    });

    // Track room creation
    posthog.capture("create_room", {
      room_id: newRoomId,
      username,
    });

    router.push(`/room/${newRoomId}`);
  };

  const handleRegenerateName = () => {
    const newName = generateName();
    setUsername(newName);

    // Track name regeneration
    posthog.capture("regenerate_username", {
      previous_username: username,
      new_username: newName,
    });
  };

  return (
    <SafeMotion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-neutral-950 backdrop-blur-sm no-bounce"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full px-2 sm:px-1 touch-smooth">
        <SafeMotion.div
          className="flex flex-col items-center justify-center p-4 sm:p-6 bg-neutral-900 rounded-lg border border-neutral-800 shadow-xl max-w-[28rem] mx-auto"
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {numActiveUsers && numActiveUsers > 0 ? (
            <SafeMotion.div
              className="flex items-center gap-1.5 mb-3"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <SafeMotion.div className="relative flex items-center justify-center">
                <SafeMotion.div className="size-2 bg-green-500 rounded-full" />
                <SafeMotion.div className="absolute size-2.5 bg-green-500/30 rounded-full animate-ping" />
              </SafeMotion.div>
              <span className="text-xs text-neutral-500 ml-0.5">
                {numActiveUsers} {numActiveUsers === 1 ? "person" : "people"}{" "}
                listening now
              </span>
            </SafeMotion.div>
          ) : null}
          <SafeMotion.h2
            className="text-base font-medium tracking-tight mb-1 text-white"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.13 }}
          >
            Join a Beatsync Room
          </SafeMotion.h2>

          <SafeMotion.p
            className="text-neutral-400 mb-5 text-center text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            Enter a room code to join or create a new room
          </SafeMotion.p>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <SafeMotion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Controller
                control={control}
                name="roomId"
                rules={{ required: "Room code is required" }}
                render={({ field }) => (
                  <InputOTP
                    autoFocus
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    data-lpignore="true"
                    data-1p-ignore
                    data-form-type="other"
                    value={field.value}
                    onChange={(value) => {
                      // Only set the value if it contains only digits
                      if (validatePartialRoomId(value)) {
                        field.onChange(value);

                        // Auto-submit when 6 digits are entered
                        if (value.length === 6) {
                          // handleSubmit(onSubmit)();
                          // Small delay to ensure UI updates before submission
                          setTimeout(() => {
                            handleSubmit(onSubmit)();
                          }, 100);
                        }
                      }
                    }}
                    className="gap-2"
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-9 h-10 text-base bg-neutral-800/80 border-neutral-700 transition-all duration-200 
                          focus-within:border-primary/70 focus-within:bg-neutral-800 focus-within:ring-1 focus-within:ring-primary/30"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                )}
              />
            </SafeMotion.div>
            {errors.roomId && (
              <SafeMotion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-xs text-red-500 text-center mt-1"
              >
                {errors.roomId.message}
              </SafeMotion.p>
            )}

            <SafeMotion.div
              className="flex items-center justify-center mt-5"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <div className="text-sm text-neutral-400">
                You&apos;ll join as{" "}
                <SafeMotion.AnimatePresence mode="wait" initial={false}>
                  <SafeMotion.span
                    key={username}
                    className="text-primary font-medium inline-block"
                    initial={{
                      opacity: 0,
                      filter: "blur(8px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      filter: "blur(8px)",
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                  >
                    {username}
                  </SafeMotion.span>
                </SafeMotion.AnimatePresence>
              </div>
              <Button
                type="button"
                onClick={handleRegenerateName}
                variant="ghost"
                className="text-xs text-neutral-500 hover:text-neutral-300 ml-2 h-6 px-2"
                disabled={isJoining || isCreating}
              >
                Regenerate
              </Button>
            </SafeMotion.div>

            <div className="flex flex-col gap-3 mt-5">
              {/* Show auto-join indicator when room code is complete */}
              {roomId.length === 6 && !isJoining && (
                <SafeMotion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full px-4 py-2 bg-primary/20 border border-primary/30 text-primary rounded-full font-medium text-sm flex items-center justify-center"
                >
                  <LogIn size={16} className="mr-2" />
                  <span>Auto-joining room...</span>
                </SafeMotion.div>
              )}

              {/* Only show join button if room code is not complete */}
              {roomId.length < 6 && (
                <SafeMotion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={!isJoining && !isCreating ? { scale: 1.01 } : {}}
                  whileTap={!isJoining && !isCreating ? { scale: 0.98 } : {}}
                >
                  <Button
                    type="submit"
                    className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-medium text-sm cursor-pointer transition-all duration-300 flex items-center justify-center"
                    disabled={isJoining || isCreating}
                    onClick={() => {
                      posthog.capture("join_button_clicked");
                    }}
                  >
                    {isJoining ? (
                      <SafeMotion.div
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                      >
                        <LogIn size={16} className="mr-2" />
                      </SafeMotion.div>
                    ) : (
                      <LogIn size={16} className="mr-2" />
                    )}
                    <span>{isJoining ? "Joining..." : "Join room"}</span>
                  </Button>
                </SafeMotion.div>
              )}

              <SafeMotion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={!isJoining && !isCreating ? { scale: 1.01 } : {}}
                whileTap={!isJoining && !isCreating ? { scale: 0.98 } : {}}
              >
                <Button
                  type="button"
                  onClick={handleCreateRoom}
                  className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-full font-medium text-sm cursor-pointer transition-all duration-300 flex items-center justify-center"
                  disabled={isJoining || isCreating}
                >
                  {isCreating ? (
                    <SafeMotion.div
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                    >
                      <PlusCircle size={16} className="mr-2" />
                    </SafeMotion.div>
                  ) : (
                    <PlusCircle size={16} className="mr-2" />
                  )}
                  <span>{isCreating ? "Creating..." : "Create new room"}</span>
                </Button>
              </SafeMotion.div>
            </div>
          </form>

          <SafeMotion.p
            className="text-neutral-500 mt-5 text-center text-xs leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            Use native device speakers.
          </SafeMotion.p>

          {/* Divider */}
          <SafeMotion.div
            className="w-full h-px bg-neutral-800 my-4"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          />

          {/* Social links removed as requested */}
        </SafeMotion.div>

        {/* Active Rooms Section */}
        <ActiveRooms />
      </div>
    </SafeMotion.div>
  );
};
