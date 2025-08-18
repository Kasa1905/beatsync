import { ExtractWSRequestFrom } from "@beatsync/shared";
import { sendBroadcast } from "../../utils/responses";
import { HandlerFunction } from "../types";

export const handleStartAudioStream: HandlerFunction<
  ExtractWSRequestFrom["START_AUDIO_STREAM"]
> = async ({ ws, message, server }) => {
  const { roomId, streamType, quality } = message;
  
  console.log(
    `[${roomId}] User ${ws.data.username} started ${streamType} audio stream (${quality} quality)`
  );

  // Broadcast to all room members that someone started streaming
  sendBroadcast({
    server,
    roomId,
    message: {
      type: "ROOM_EVENT",
      event: {
        type: "AUDIO_STREAM_STARTED",
        userId: ws.data.clientId,
        username: ws.data.username,
        streamType,
        quality,
        timestamp: Date.now(),
      },
    },
  });
};
