/**
 * Spotify Web API integration for BeatSync
 * Provides real music search capabilities using Spotify's vast catalog
 */

import { 
  SearchCategoryType, 
  CategorizedSearchResponseType,
  ArtistResultType,
  AlbumResultType,
  TrackResultType 
} from "@beatsync/shared/types/search";

interface SpotifyConfig {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; width: number; height: number }>;
    release_date: string;
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  popularity: number;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  images: Array<{ url: string; width: number; height: number }>;
  release_date: string;
  total_tracks: number;
  album_type: string;
  external_urls: {
    spotify: string;
  };
}

interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{ url: string; width: number; height: number }>;
  genres: string[];
  popularity: number;
  followers: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
}

interface SpotifySearchResponse {
  tracks?: {
    items: SpotifyTrack[];
    total: number;
    limit: number;
    offset: number;
  };
  albums?: {
    items: SpotifyAlbum[];
    total: number;
    limit: number;
    offset: number;
  };
  artists?: {
    items: SpotifyArtist[];
    total: number;
    limit: number;
    offset: number;
  };
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class SpotifyMusicProvider {
  private config: SpotifyConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: SpotifyConfig) {
    this.config = config;
  }

  /**
   * Get access token using Client Credentials flow
   * This is suitable for backend operations that don't require user authorization
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error(`Spotify auth failed: ${response.status} ${response.statusText}`);
      }

      const data: SpotifyTokenResponse = await response.json();
      
      this.accessToken = data.access_token;
      // Set expiry with 5-minute buffer
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
      
      return this.accessToken;
    } catch (error) {
      console.error('Failed to get Spotify access token:', error);
      throw error;
    }
  }

  /**
   * Enhanced search supporting multiple categories like Spotify
   */
  async searchAll(
    query: string, 
    category: SearchCategoryType = "tracks",
    limit: number = 20,
    offset: number = 0
  ): Promise<CategorizedSearchResponseType> {
    try {
      const token = await this.getAccessToken();
      
      let searchTypes: string[] = [];
      switch (category) {
        case "tracks":
          searchTypes = ["track"];
          break;
        case "albums":
          searchTypes = ["album"];
          break;
        case "artists":
          searchTypes = ["artist"];
          break;
        case "all":
          searchTypes = ["track", "album", "artist"];
          break;
      }

      const searchParams = new URLSearchParams({
        q: query,
        type: searchTypes.join(','),
        limit: limit.toString(),
        offset: offset.toString(),
        market: 'US',
      });

      const response = await fetch(`https://api.spotify.com/v1/search?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Spotify search failed: ${response.status} ${response.statusText}`);
      }

      const data: SpotifySearchResponse = await response.json();
      
      // Convert Spotify response to our format
      const result: CategorizedSearchResponseType = {
        provider: 'spotify',
      };

      if (data.tracks) {
        result.tracks = {
          items: data.tracks.items.map(track => this.spotifyTrackToTrackResult(track)),
          total: data.tracks.total,
          hasMore: data.tracks.offset + data.tracks.items.length < data.tracks.total,
        };
      }

      if (data.albums) {
        result.albums = {
          items: data.albums.items.map(album => this.spotifyAlbumToAlbumResult(album)),
          total: data.albums.total,
          hasMore: data.albums.offset + data.albums.items.length < data.albums.total,
        };
      }

      if (data.artists) {
        result.artists = {
          items: data.artists.items.map(artist => this.spotifyArtistToArtistResult(artist)),
          total: data.artists.total,
          hasMore: data.artists.offset + data.artists.items.length < data.artists.total,
        };
      }

      return result;
    } catch (error) {
      console.error('Spotify search failed:', error);
      throw error;
    }
  }

  /**
   * Search for tracks on Spotify (legacy method for backward compatibility)
   */
  async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
    try {
      const token = await this.getAccessToken();
      
      const searchParams = new URLSearchParams({
        q: query,
        type: 'track',
        limit: limit.toString(),
        market: 'US', // Default market, could be configurable
      });

      const response = await fetch(`https://api.spotify.com/v1/search?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Spotify search failed: ${response.status} ${response.statusText}`);
      }

      const data: SpotifySearchResponse = await response.json();
      return data.tracks?.items || [];
    } catch (error) {
      console.error('Spotify search failed:', error);
      throw error;
    }
  }

  /**
   * Get track details by Spotify ID
   */
  async getTrack(trackId: string): Promise<SpotifyTrack> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get track: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get Spotify track:', error);
      throw error;
    }
  }

  /**
   * Convert Spotify track to our AudioSource format
   */
  spotifyTrackToAudioSource(track: SpotifyTrack): {
    url: string;
    title: string;
    artist: string;
    duration?: number;
    thumbnail?: string;
    source: 'spotify';
    spotifyId: string;
    previewUrl?: string;
  } {
    return {
      url: track.external_urls.spotify, // Spotify track URL (not playable directly)
      title: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      duration: Math.round(track.duration_ms / 1000),
      thumbnail: track.album.images[0]?.url,
      source: 'spotify' as const,
      spotifyId: track.id,
      previewUrl: track.preview_url || undefined,
    };
  }

  /**
   * Convert Spotify track to our TrackResult format (for categorized search)
   */
  private spotifyTrackToTrackResult(track: SpotifyTrack): TrackResultType {
    return {
      id: track.id,
      title: track.name,
      url: track.external_urls.spotify,
      artist: track.artists.map(a => a.name).join(', '),
      duration: Math.round(track.duration_ms / 1000),
      thumbnail: track.album.images[0]?.url,
      source: 'spotify' as const,
      spotifyId: track.id,
      previewUrl: track.preview_url || undefined,
      album: {
        name: track.album.name,
        image: track.album.images[0]?.url,
      },
    };
  }

  /**
   * Convert Spotify album to our AlbumResult format
   */
  private spotifyAlbumToAlbumResult(album: SpotifyAlbum): AlbumResultType {
    return {
      id: album.id,
      name: album.name,
      artists: album.artists.map(artist => ({
        id: artist.id,
        name: artist.name,
      })),
      images: album.images.map(img => ({
        url: img.url,
        width: img.width,
        height: img.height,
      })),
      release_date: album.release_date,
      total_tracks: album.total_tracks,
      album_type: album.album_type,
      external_urls: {
        spotify: album.external_urls.spotify,
      },
    };
  }

  /**
   * Convert Spotify artist to our ArtistResult format
   */
  private spotifyArtistToArtistResult(artist: SpotifyArtist): ArtistResultType {
    return {
      id: artist.id,
      name: artist.name,
      images: artist.images.map(img => ({
        url: img.url,
        width: img.width,
        height: img.height,
      })),
      genres: artist.genres,
      popularity: artist.popularity,
      followers: artist.followers.total,
      external_urls: {
        spotify: artist.external_urls.spotify,
      },
    };
  }

  /**
   * Get all tracks from an album
   */
  async getAlbumTracks(albumId: string): Promise<SpotifyTrack[]> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get album tracks: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Get full track details for each track
      const trackIds = data.items.map((track: any) => track.id).join(',');
      const tracksResponse = await fetch(`https://api.spotify.com/v1/tracks?ids=${trackIds}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!tracksResponse.ok) {
        throw new Error(`Failed to get track details: ${tracksResponse.status} ${tracksResponse.statusText}`);
      }

      const tracksData = await tracksResponse.json();
      return tracksData.tracks;
    } catch (error) {
      console.error('Failed to get album tracks:', error);
      throw error;
    }
  }

  /**
   * Check if Spotify is properly configured
   */
  static isConfigured(): boolean {
    return !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
  }

  /**
   * Create a configured Spotify provider instance
   */
  static create(): SpotifyMusicProvider | null {
    if (!this.isConfigured()) {
      console.warn('Spotify API not configured. Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET');
      return null;
    }

    return new SpotifyMusicProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
    });
  }
}

export type { SpotifyTrack, SpotifySearchResponse };
