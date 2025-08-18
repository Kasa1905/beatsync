import { epochNow, ExtractWSRequestFrom } from "@beatsync/shared";
import { sendUnicast } from "../../utils/responses";
import { requireRoom } from "../middlewares";
import { HandlerFunction } from "../types";

export const handleNTPRequest: HandlerFunction<
  ExtractWSRequestFrom["NTP_REQUEST"]
> = async ({ ws, message }) => {
  if (!message.t1) {
    console.error("NTP request received without t1 timestamp");
    return;
  }

  // Check if room exists before proceeding
  try {
    const { room } = requireRoom(ws);
    room.processNTPRequestFrom(ws.data.clientId, message.clientRTT);

    sendUnicast({
      ws,
      message: {
        type: "NTP_RESPONSE",
        t0: message.t0, // Echo back the client's t0
        t1: message.t1, // Server receive time
        t2: epochNow(), // Server send time
      },
    });
  } catch (error) {
    // Silently handle room cleanup race conditions
    // This can happen when a room is cleaned up between connection and NTP request
    if (error instanceof Error && error.message.includes("not found in global manager")) {
      // Don't log this as it's a normal race condition during cleanup
      return;
    }
    // Log other unexpected errors
    console.error("Unexpected error in NTP handler:", error);
  }
};
