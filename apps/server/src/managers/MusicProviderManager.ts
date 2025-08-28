import {
  RawSearchResponseSchema,
  SearchParamsSchema,
  StreamResponseSchema,
  TrackParamsSchema,
  SearchCategoryType,
  CategorizedSearchResponseType,
} from "@beatsync/shared/";
import { z } from "zod";
import { SpotifyMusicProvider } from "../lib/spotify";
import { iTunesMusicProvider } from "../lib/itunes";

export class MusicProviderManager {
  private providerUrl: string | undefined;
  private spotifyProvider: SpotifyMusicProvider | null;
  private iTunesProvider: iTunesMusicProvider;

  constructor() {
    // Lazy initialization - don't throw in constructor for test compatibility
    this.providerUrl = process.env.PROVIDER_URL;
    
    // Initialize iTunes provider as fallback (always available)
    this.iTunesProvider = iTunesMusicProvider.create();
    
    // Initialize Spotify provider if configured
    this.spotifyProvider = SpotifyMusicProvider.create();
    
    if (this.spotifyProvider) {
      console.log("✅ Spotify music provider initialized");
    }
    
    console.log("✅ iTunes music provider initialized (fallback)");
    
    if (!this.spotifyProvider && !this.providerUrl) {
      console.log("⚠️ Primary providers not configured - using iTunes fallback");
    }
  }

  private getProviderUrl(): string {
    if (!this.providerUrl) {
      throw new Error("PROVIDER_URL environment variable is required for external music search");
    }
    return this.providerUrl;
  }

  /**
   * Enhanced search with category support (tracks, albums, artists, all)
   */
  async searchCategorized(
    query: string,
    category: SearchCategoryType = "tracks",
    offset: number = 0,
    limit: number = 20
  ): Promise<CategorizedSearchResponseType> {
    try {
      // Try Spotify first if available
      if (this.spotifyProvider) {
        console.log(`🎵 Searching Spotify (${category}) for: "${query}"`);
        try {
          return await this.spotifyProvider.searchAll(query, category, limit, offset);
        } catch (spotifyError) {
          console.warn("Spotify search failed, falling back to iTunes:", spotifyError);
          return await this.iTunesProvider.searchCategorized(query, category, limit, offset);
        }
      }
      
      // Use iTunes as primary fallback
      console.log(`🍎 Searching iTunes (${category}) for: "${query}"`);
      try {
        return await this.iTunesProvider.searchCategorized(query, category, limit, offset);
      } catch (iTunesError) {
        console.warn("iTunes search failed, trying legacy search:", iTunesError);
      }
      
      // Fall back to legacy search for backward compatibility
      console.log(`🔗 Falling back to legacy search for: "${query}"`);
      const legacyResult = await this.search(query, offset);
      
      // Convert legacy format to categorized format
      if ('results' in legacyResult && Array.isArray(legacyResult.results)) {
        return {
          tracks: {
            items: legacyResult.results.map((track, index) => ({
              ...track,
              id: track.spotifyId || track.url || `track-${index}`, // Ensure id field exists
            })),
            total: legacyResult.total || legacyResult.results.length,
            hasMore: legacyResult.hasMore || false,
          },
          provider: legacyResult.provider || 'external',
        };
      }
      
      // Handle legacy format with data.tracks structure
      if ('data' in legacyResult && legacyResult.data && 'tracks' in legacyResult.data) {
        const tracks = (legacyResult.data as any).tracks;
        return {
          tracks: {
            items: tracks.items || [],
            total: tracks.total || 0,
            hasMore: tracks.offset + tracks.items.length < tracks.total,
          },
          provider: 'external',
        };
      }
      
      // Return empty result if format is unrecognized
      return {
        tracks: { items: [], total: 0, hasMore: false },
        provider: 'fallback',
      };
    } catch (error) {
      console.error(`Search failed for category "${category}":`, error);
      
      // Return mock results for tracks category
      if (category === "tracks" || category === "all") {
        const mockResult = this.getMockSearchResults(query, offset);
        return {
          tracks: {
            items: 'results' in mockResult ? mockResult.results.map((track, index) => ({
              ...track,
              id: track.spotifyId || track.url || `mock-${index}`,
            })) : [],
            total: 10,
            hasMore: false,
          },
          provider: 'mock',
        };
      }
      
      // Return empty results for albums/artists
      return {
        tracks: { items: [], total: 0, hasMore: false },
        albums: { items: [], total: 0, hasMore: false },
        artists: { items: [], total: 0, hasMore: false },
        provider: 'mock',
      };
    }
  }

  /**
   * Legacy search method for backward compatibility
   */
  async search(
    query: string,
    offset: number = 0
  ): Promise<z.infer<typeof RawSearchResponseSchema>> {
    try {
      // Try Spotify first if available
      if (this.spotifyProvider) {
        console.log(`🎵 Searching Spotify for: "${query}"`);
        return await this.searchWithSpotify(query, offset);
      }
      
      // Fall back to external provider if configured
      if (this.providerUrl) {
        console.log(`🔗 Searching external provider for: "${query}"`);
        return await this.searchWithExternalProvider(query, offset);
      }

      // Fall back to mock results
      console.log(`🎭 No providers configured, returning mock results for: "${query}"`);
      return this.getMockSearchResults(query, offset);
    } catch (error) {
      console.error("Search failed, falling back to mock results:", error);
      return this.getMockSearchResults(query, offset);
    }
  }

  private async searchWithSpotify(
    query: string,
    offset: number = 0
  ): Promise<z.infer<typeof RawSearchResponseSchema>> {
    if (!this.spotifyProvider) {
      throw new Error("Spotify provider not initialized");
    }

    try {
      const tracks = await this.spotifyProvider.searchTracks(query, 20);
      
      const results = tracks.slice(offset, offset + 10).map(track => 
        this.spotifyProvider!.spotifyTrackToAudioSource(track)
      );

      return {
        results,
        hasMore: tracks.length > offset + 10,
        total: tracks.length,
        provider: 'spotify'
      };
    } catch (error) {
      console.error("Spotify search failed:", error);
      throw error;
    }
  }

  private async searchWithExternalProvider(
    query: string,
    offset: number = 0
  ): Promise<z.infer<typeof RawSearchResponseSchema>> {
    const { q, offset: validOffset } = SearchParamsSchema.parse({
      q: query,
      offset,
    });

    const searchUrl = new URL("/api/search", this.getProviderUrl());
    searchUrl.searchParams.set("q", q);
    searchUrl.searchParams.set("offset", validOffset.toString());

    const response = await fetch(searchUrl.toString());

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return RawSearchResponseSchema.parse(data);
  }

  async stream(trackId: number) {
    try {
      const { id } = TrackParamsSchema.parse({ id: trackId });

      const streamUrl = new URL("/api/track", this.getProviderUrl());
      streamUrl.searchParams.set("id", id.toString());

      const response = await fetch(streamUrl.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return StreamResponseSchema.parse(data);
    } catch (error) {
      throw new Error(
        `Download failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Provides mock search results when no music provider is configured
   * This allows the app to function without external dependencies
   */
  private getMockSearchResults(
    query: string,
    offset: number
  ): z.infer<typeof RawSearchResponseSchema> {
    const mockTracks = [
      {
        id: 1,
        title: "Sample Track 1",
        version: null,
        performer: { id: 1, name: "Demo Artist" },
        album: {
          id: "demo1",
          title: "Demo Album",
          image: {
            small: "https://via.placeholder.com/150x150/333/fff?text=Music",
            thumbnail: "https://via.placeholder.com/300x300/333/fff?text=Music",
            large: "https://via.placeholder.com/600x600/333/fff?text=Music",
            back: null,
          },
          duration: 180,
          released_at: Date.now() / 1000,
          release_date_original: new Date().toISOString().split('T')[0],
          parental_warning: false,
        },
        track_number: 1,
        duration: 180,
        parental_warning: false,
        isrc: null,
      },
      {
        id: 2,
        title: "Another Demo Song",
        version: "Radio Edit",
        performer: { id: 2, name: "Test Musician" },
        album: {
          id: "demo2",
          title: "Test Collection",
          image: {
            small: "https://via.placeholder.com/150x150/666/fff?text=Demo",
            thumbnail: "https://via.placeholder.com/300x300/666/fff?text=Demo",
            large: "https://via.placeholder.com/600x600/666/fff?text=Demo",
            back: null,
          },
          duration: 210,
          released_at: Date.now() / 1000,
          release_date_original: new Date().toISOString().split('T')[0],
          parental_warning: false,
        },
        track_number: 1,
        duration: 210,
        parental_warning: false,
        isrc: null,
      },
    ];

    // Filter tracks based on query (simple text matching)
    const filteredTracks = mockTracks.filter(track =>
      track.title.toLowerCase().includes(query.toLowerCase()) ||
      track.performer.name.toLowerCase().includes(query.toLowerCase()) ||
      track.album.title.toLowerCase().includes(query.toLowerCase())
    );

    // If no matches, return all tracks (like "no results found" but still showing something)
    const resultTracks = filteredTracks.length > 0 ? filteredTracks : mockTracks;

    return {
      data: {
        tracks: {
          limit: 20,
          offset,
          total: resultTracks.length,
          items: resultTracks.slice(offset, offset + 20),
        },
      },
    };
  }

  /**
   * Get all tracks from a Spotify album and convert them to our AudioSource format
   */
  async getAlbumTracks(albumId: string): Promise<Array<{
    url: string;
    title: string;
    artist: string;
    duration?: number;
    thumbnail?: string;
    source: 'spotify';
    spotifyId: string;
    previewUrl?: string;
  }>> {
    if (!this.spotifyProvider) {
      throw new Error("Spotify provider not available for album tracks");
    }

    try {
      console.log(`🎵 Getting album tracks for: ${albumId}`);
      const tracks = await this.spotifyProvider.getAlbumTracks(albumId);
      return tracks.map(track => this.spotifyProvider!.spotifyTrackToAudioSource(track));
    } catch (error) {
      console.error(`Failed to get album tracks for ${albumId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const MUSIC_PROVIDER_MANAGER = new MusicProviderManager();
