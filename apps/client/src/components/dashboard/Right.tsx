import { cn } from "@/lib/utils";
import { Music } from "lucide-react";
import { motion } from "motion/react";
import { Queue } from "../Queue";
import { AudioUploaderMinimal } from "../AudioUploaderMinimal";
import { LoadDefaultTracksButton } from "../LoadDefaultTracksButton";

interface RightProps {
  className?: string;
}

export const Right = ({ className }: RightProps) => {
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
          <Music className="h-4 w-4 text-white" />
        </div>
        <h1 className="font-semibold text-white">Queue</h1>
      </div>

      {/* Upload Section */}
      <div className="px-3 py-2 space-y-2">
        <AudioUploaderMinimal />
        <LoadDefaultTracksButton />
      </div>

      {/* Queue */}
      <div className="flex-1 overflow-y-auto">
        <Queue />
      </div>
    </motion.div>
  );
};
