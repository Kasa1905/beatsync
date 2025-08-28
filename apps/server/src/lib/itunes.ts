// iTunes API Provider for BeatSync
// Free music search using Apple's iTunes API

import { CategorizedSearchResponseType, SearchCategoryType } from "@beatsync/shared/";

interface iTunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  artworkUrl60: string;
  previewUrl: string;
  trackTimeMillis: number;
  releaseDate: string;
  primaryGenreName: string;
}

interface iTunesResponse {
  resultCount: number;
  results: iTunesTrack[];
}

export class iTunesMusicProvider {
  private baseUrl = 'https://itunes.apple.com/search';

  async search(query: string, limit = 20): Promise<CategorizedSearchResponseType> {
    try {
      const url = new URL(this.baseUrl);
      url.searchParams.set('term', query);
      url.searchParams.set('media', 'music');
      url.searchParams.set('entity', 'song');
      url.searchParams.set('limit', limit.toString());

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`iTunes API error: ${response.status}`);
      }

      const data: iTunesResponse = await response.json();
      
      // Convert iTunes format to BeatSync format
      return {
        tracks: {
          items: data.results.map(track => ({
            id: track.trackId?.toString() || `itunes-${Date.now()}`,
            title: track.trackName || 'Unknown Title',
            url: track.previewUrl || '',
            artist: track.artistName || 'Unknown Artist',
            duration: track.trackTimeMillis ? Math.floor(track.trackTimeMillis / 1000) : 30,
            thumbnail: track.artworkUrl100 || track.artworkUrl60 || '',
            source: 'external' as const,
            spotifyId: `itunes-${track.trackId}`,
            previewUrl: track.previewUrl || '',
            album: {
              name: track.collectionName || 'Unknown Album',
              image: track.artworkUrl100 || track.artworkUrl60 || '',
            },
          })).filter(track => track.url), // Only include tracks with preview URLs
          total: data.resultCount || 0,
          hasMore: false,
        },
        provider: 'iTunes'
      };
    } catch (error) {
      console.error('iTunes API search failed:', error);
      throw error;
    }
  }

  async searchCategorized(
    query: string, 
    category: SearchCategoryType = 'tracks', 
    limit = 20, 
    offset = 0
  ): Promise<CategorizedSearchResponseType> {
    if (category !== 'tracks') {
      // iTunes API primarily supports track search
      return {
        tracks: { items: [], total: 0, hasMore: false },
        albums: { items: [], total: 0, hasMore: false },
        artists: { items: [], total: 0, hasMore: false },
        provider: 'iTunes'
      };
    }
    
    return await this.search(query, limit);
  }

  async stream(trackId: string): Promise<never> {
    // iTunes only provides 30-second previews
    // For full tracks, you'd need the actual audio file URLs
    throw new Error('iTunes API only provides 30-second previews. Full streaming not available.');
  }

  /**
   * Create a configured iTunes provider instance
   */
  static create(): iTunesMusicProvider {
    return new iTunesMusicProvider();
  }
}
