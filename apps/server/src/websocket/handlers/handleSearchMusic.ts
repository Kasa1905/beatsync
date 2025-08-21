import { ExtractWSRequestFrom } from "@beatsync/shared";
import { MUSIC_PROVIDER_MANAGER } from "../../managers/MusicProviderManager";
import { sendUnicast } from "../../utils/responses";
import { HandlerFunction } from "../types";

export const handleSearchMusic: HandlerFunction<
  ExtractWSRequestFrom["SEARCH_MUSIC"]
> = async ({ ws, message }) => {
  try {
    const { query, category = "tracks" } = message;
    
    console.log(`🔍 Search request: "${query}" (${category})`);
    
    // For simplicity, always search tracks but keep the category for future use
    const data = await MUSIC_PROVIDER_MANAGER.search(query);

    sendUnicast({
      ws,
      message: {
        type: "SEARCH_RESPONSE",
        response: {
          type: "success",
          response: data,
        },
      },
    });
  } catch (error) {
    console.error("Search failed:", error);
    sendUnicast({
      ws,
      message: {
        type: "SEARCH_RESPONSE",
        response: {
          type: "error",
          message: "An error occurred while searching",
        },
      },
    });
  }
};
