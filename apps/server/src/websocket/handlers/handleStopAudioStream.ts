import { ExtractWSRequestFrom } from "@beatsync/shared";
import { sendBroadcast } from "../../utils/responses";
import { HandlerFunction } from "../types";

export const handleStopAudioStream: HandlerFunction<
  ExtractWSRequestFrom["STOP_AUDIO_STREAM"]
> = async ({ ws, message, server }) => {
  const { roomId } = message;
  
  console.log(
    `[${roomId}] User ${ws.data.username} stopped audio stream`
  );

  // Broadcast to all room members that someone stopped streaming
  sendBroadcast({
    server,
    roomId,
    message: {
      type: "ROOM_EVENT",
      event: {
        type: "AUDIO_STREAM_STOPPED",
        userId: ws.data.clientId,
        username: ws.data.username,
        timestamp: Date.now(),
      },
    },
  });
};
