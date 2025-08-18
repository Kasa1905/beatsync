import { ExtractWSRequestFrom } from "@beatsync/shared";
import { sendBroadcast } from "../../utils/responses";
import { HandlerFunction } from "../types";

export const handleStreamAudioChunk: HandlerFunction<
  ExtractWSRequestFrom["STREAM_AUDIO_CHUNK"]
> = async ({ ws, message, server }) => {
  const { roomId, audioData, sampleRate, channelCount, timestamp } = message;
  
  // Forward the audio chunk to all other users in the room (excluding sender)
  sendBroadcast({
    server,
    roomId,
    message: {
      type: "AUDIO_CHUNK",
      data: {
        userId: ws.data.clientId,
        username: ws.data.username,
        audioData,
        sampleRate,
        channelCount,
        timestamp,
      },
    },
    excludeWs: ws, // Don't send back to the sender
  });
};
