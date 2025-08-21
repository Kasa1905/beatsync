import { ExtractWSRequestFrom } from "@beatsync/shared";
import { sendBroadcast } from "../../utils/responses";
import { HandlerFunction } from "../types";

export const handleSendChatMessage: HandlerFunction<
  ExtractWSRequestFrom["SEND_CHAT_MESSAGE"]
> = async ({ ws, message, server }) => {
  const { message: messageText } = message;
  
  // Broadcast the chat message to all users in the room
  sendBroadcast({
    server,
    roomId: ws.data.roomId,
    message: {
      type: "CHAT_MESSAGE",
      data: {
        userId: ws.data.clientId,
        username: ws.data.username,
        message: messageText,
        timestamp: Date.now(),
      },
    },
  });
};
