"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRoomStore } from "@/store/room";
import { QrCode, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export const RoomQRCode = () => {
  const roomId = useRoomStore((state) => state.roomId);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const roomUrl = `${window.location.origin}/room/${roomId}`;

  const generateQRCode = async () => {
    if (!roomId) return;
    
    setIsLoading(true);
    try {
      // Use QR Server API (lightweight and fast for low internet)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(roomUrl)}`;
      setQrDataUrl(qrUrl);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join Beatsync Room ${roomId}`,
          text: "Join my Beatsync room for synchronized music listening!",
          url: roomUrl,
        });
      } catch (error) {
        console.log("Share failed:", error);
        // Fallback to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      // Could add a toast notification here
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  useEffect(() => {
    if (roomId) {
      generateQRCode();
    }
  }, [roomId]);

  if (!roomId) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-neutral-400 hover:text-white hover:bg-white/10"
        >
          <QrCode className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-700">
        <DialogHeader>
          <DialogTitle className="text-white">Share Room</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Scan the QR code or share the link to invite others to room {roomId}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4">
          {/* QR Code */}
          <motion.div
            className="bg-white p-4 rounded-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              <div className="w-[200px] h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600"></div>
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for room ${roomId}`}
                className="w-[200px] h-[200px]"
                loading="lazy"
              />
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center text-neutral-600">
                Failed to load QR code
              </div>
            )}
          </motion.div>

          {/* Share URL */}
          <div className="w-full">
            <div className="flex items-center space-x-2">
              <div className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-sm text-neutral-300 truncate">
                {roomUrl}
              </div>
              <Button
                size="sm"
                onClick={copyToClipboard}
                className="px-3 py-2 bg-primary hover:bg-primary/90"
              >
                Copy
              </Button>
            </div>
          </div>

          {/* Share Button */}
          <Button
            onClick={handleShare}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
