import { cn } from "@/lib/utils";
import { QueueMusic } from "lucide-react";
import { motion } from "motion/react";
import Queue from "../Queue";
import { AudioUploaderMinimal } from "../AudioUploaderMinimal";
import { TimingDisplay } from "../TimingDisplay";
import { useGlobalStore } from "@/store/global";

interface RightProps {
  className?: string;
}

export const Right = ({ className }: RightProps) => {
  const hasUserStartedSystem = useGlobalStore(
    (state) => state.hasUserStartedSystem
  );

  return (
    <motion.div
      className={cn(
        "w-full lg:w-80 lg:flex-shrink-0 border-l border-neutral-800/50 bg-neutral-900/50 backdrop-blur-md flex flex-col pb-4 lg:pb-0 text-sm space-y-1 overflow-y-auto flex-shrink-0 scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/20",
        className
      )}
    >
      {/* Header */}
      <div className="px-3 py-2 flex items-center gap-2">
        <div className="bg-neutral-800 rounded-md p-1.5">
          <QueueMusic className="h-4 w-4 text-white" />
        </div>
        <h1 className="font-semibold text-white">Queue</h1>
      </div>

      {/* Upload Section */}
      <div className="px-3 py-2">
        <AudioUploaderMinimal />
      </div>

      {/* Queue */}
      <div className="flex-1 overflow-y-auto">
        <Queue />
      </div>

      {/* Timing Display */}
      {hasUserStartedSystem && (
        <div className="px-3 py-2 border-t border-neutral-800/50">
          <TimingDisplay />
        </div>
      )}
    </motion.div>
  );
};
