"use client";

import { Switch } from "@/components/ui/switch";
import { useCanMutate, useGlobalStore } from "@/store/global";
import { sendWSRequest } from "@/utils/ws";
import { ClientActionEnum } from "@beatsync/shared";
import { Lock, Unlock } from "lucide-react";
import { motion } from "motion/react";
import { usePostHog } from "./PostHogProvider";
import { useState } from "react";

export const RoomPrivacyToggle = () => {
  const socket = useGlobalStore((state) => state.socket);
  const canMutate = useCanMutate();
  const posthog = usePostHog();
  const [isPrivate, setIsPrivate] = useState(false);

  const handlePrivacyToggle = (checked: boolean) => {
    if (!socket || !canMutate) return;

    setIsPrivate(checked);

    // Track privacy change
    posthog.capture("room_privacy_changed", {
      is_private: checked,
    });

    // Send privacy change to server
    sendWSRequest({
      ws: socket,
      request: {
        type: ClientActionEnum.enum.SET_ROOM_PRIVACY,
        isPrivate: checked,
      },
    });
  };

  if (!canMutate) {
    return null; // Only show to admins
  }

  return (
    <motion.div
      className="px-4 py-3"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ 
              scale: isPrivate ? 1.1 : 1,
              color: isPrivate ? "#ef4444" : "#6b7280"
            }}
            transition={{ duration: 0.2 }}
          >
            {isPrivate ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Unlock className="h-4 w-4" />
            )}
          </motion.div>
          <div>
            <div className="text-sm font-medium text-white">
              {isPrivate ? "Private Room" : "Public Room"}
            </div>
            <div className="text-xs text-neutral-400">
              {isPrivate 
                ? "Hidden from discovery, invite-only"
                : "Visible in room discovery"
              }
            </div>
          </div>
        </div>

        <Switch
          checked={isPrivate}
          onCheckedChange={handlePrivacyToggle}
          className="data-[state=checked]:bg-red-600"
        />
      </div>
    </motion.div>
  );
};
