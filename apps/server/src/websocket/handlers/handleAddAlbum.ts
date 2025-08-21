import { ExtractWSRequestFrom } from "@beatsync/shared";
import { MUSIC_PROVIDER_MANAGER } from "../../managers/MusicProviderManager";
import { sendBroadcast } from "../../utils/responses";
import { requireCanMutate } from "../middlewares";
import { HandlerFunction } from "../types";

export const handleAddAlbum: HandlerFunction<
  ExtractWSRequestFrom["ADD_ALBUM"]
> = async ({ ws, message, server }) => {
  const { room } = requireCanMutate(ws);
  const { albumId, albumName, artistName } = message;

  try {
    console.log(`🎵 Adding album "${albumName}" by ${artistName} to room ${ws.data.roomId}`);
    
    // Get all tracks from the album
    const albumTracks = await MUSIC_PROVIDER_MANAGER.getAlbumTracks(albumId);
    
    if (albumTracks.length === 0) {
      console.warn(`No tracks found for album ${albumId}`);
      return;
    }

    // Check if any of the album tracks already exist in the room to prevent duplicates
    const existingUrls = new Set(room.getState().audioSources.map(source => source.url));
    const newTracks = albumTracks.filter(track => !existingUrls.has(track.url));
    
    if (newTracks.length === 0) {
      console.log(`All tracks from album "${albumName}" already exist in room`);
      return;
    }

    // Add only the new tracks to the room
    const sources = room.addMultipleAudioSources(newTracks);

    console.log(`✅ Added ${newTracks.length} new tracks from "${albumName}" to room (${albumTracks.length - newTracks.length} were already present)`);

    // Broadcast to all room members that new audio sources are available
    sendBroadcast({
      server,
      roomId: ws.data.roomId,
      message: {
        type: "ROOM_EVENT",
        event: {
          type: "SET_AUDIO_SOURCES",
          sources,
        },
      },
    });

    console.log(`📢 Notified room ${ws.data.roomId} about ${newTracks.length} new tracks from "${albumName}" by ${artistName} (added by ${ws.data.username})`);
  } catch (error) {
    console.error(`Failed to add album ${albumId}:`, error);
    // Could send an error message back to the user here
  }
};
