import { ExtractWSRequestFrom } from "@beatsync/shared";
import { globalManager } from "../../managers";
import { HandlerFunction } from "../types";

export const handleSetRoomPrivacy: HandlerFunction<
  ExtractWSRequestFrom["SET_ROOM_PRIVACY"]
> = async ({ ws, message }) => {
  const { roomId, clientId } = ws.data;
  const room = globalManager.getRoom(roomId);

  if (!room) {
    console.error(`Room ${roomId} not found`);
    return;
  }

  // Check if client is admin (only admins can change privacy)
  const client = room.getClients().find((c) => c.clientId === clientId);
  if (!client || !client.isAdmin) {
    console.error(`Client ${clientId} is not authorized to change room privacy`);
    return;
  }

  // Set room privacy
  room.setRoomPrivacy(message.isPrivate);
  
  console.log(`Room ${roomId} privacy changed to ${message.isPrivate ? 'private' : 'public'} by ${client.username}`);
};
