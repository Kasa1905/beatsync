import { cn } from "@/lib/utils";
import { Info, Activity, ChevronDown, MonitorSpeaker } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { UserGrid } from "../room/UserGrid";
import { AudioMonitoringDashboard } from "../room/AudioMonitoringDashboard";
import { SystemAudioStreamer } from "../room/SystemAudioStreamer";
import { AudioControls } from "./AudioControls";

interface RightProps {
  className?: string;
}

export const Right = ({ className }: RightProps) => {
  const [isAudioMonitorExpanded, setIsAudioMonitorExpanded] = useState(false);
  const [isAudioStreamerExpanded, setIsAudioStreamerExpanded] = useState(false);

  return (
    <motion.div
      className={cn(
        "w-full lg:w-80 lg:flex-shrink-0 border-l border-neutral-800/50 bg-neutral-900/50 backdrop-blur-md flex flex-col pb-4 lg:pb-0 text-sm space-y-1 overflow-y-auto flex-shrink-0 scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/20",
        className
      )}
    >
      {/* Spatial Audio Controls */}
      <motion.div className="flex-1 flex flex-col">
        {/* Spatial Audio Grid */}
        <UserGrid />

        {/* Audio Effects Controls */}
        <AudioControls />

        {/* System Audio Streamer - Collapsible */}
        <motion.div className="mx-3 mb-3">
          <button
            onClick={() => setIsAudioStreamerExpanded(!isAudioStreamerExpanded)}
            className="w-full flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MonitorSpeaker className="w-4 h-4" />
              <span className="text-sm font-medium">Audio Streaming</span>
            </div>
            <motion.div
              animate={{ rotate: isAudioStreamerExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>
          
          <motion.div
            initial={false}
            animate={{ 
              height: isAudioStreamerExpanded ? "auto" : 0,
              opacity: isAudioStreamerExpanded ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-3">
              <SystemAudioStreamer className="text-xs scale-95" />
            </div>
          </motion.div>
        </motion.div>

        {/* Audio Stream Monitor - Collapsible */}
        <motion.div className="mx-3 mb-3">
          <button
            onClick={() => setIsAudioMonitorExpanded(!isAudioMonitorExpanded)}
            className="w-full flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Audio Monitor</span>
            </div>
            <motion.div
              animate={{ rotate: isAudioMonitorExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>
          
          <motion.div
            initial={false}
            animate={{ 
              height: isAudioMonitorExpanded ? "auto" : 0,
              opacity: isAudioMonitorExpanded ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-3">
              <AudioMonitoringDashboard className="text-xs" />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div className="flex flex-col gap-3 px-4 py-3 mt-1 bg-neutral-800/30 rounded-lg mx-3 mb-3 text-neutral-400">
        <div className="flex items-start gap-2">
          <div>
            <h5 className="text-xs font-medium text-neutral-300 mb-1 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-neutral-300 flex-shrink-0" />
              What is this?
            </h5>
            <p className="text-xs leading-relaxed">
              {
                "This grid simulates a spatial audio environment. Drag the listening source around and hear how the volume changes on each device. Works best in person."
              }
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
