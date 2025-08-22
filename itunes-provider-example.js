// iTunes API Provider for BeatSync
// Free music search using Apple's iTunes API

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

  async search(query: string, limit: number = 20): Promise<any> {
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
        data: {
          tracks: {
            limit,
            offset: 0,
            total: data.resultCount,
            items: data.results.map(track => ({
              id: track.trackId,
              title: track.trackName,
              version: null,
              performer: {
                id: track.trackId,
                name: track.artistName
              },
              album: {
                id: `album-${track.trackId}`,
                title: track.collectionName,
                image: {
                  small: track.artworkUrl60,
                  thumbnail: track.artworkUrl100,
                  large: track.artworkUrl100.replace('100x100', '600x600'),
                  back: null,
                },
                duration: Math.floor(track.trackTimeMillis / 1000),
                released_at: new Date(track.releaseDate).getTime() / 1000,
                release_date_original: track.releaseDate.split('T')[0],
                parental_warning: false,
              },
              track_number: 1,
              duration: Math.floor(track.trackTimeMillis / 1000),
              parental_warning: false,
              isrc: null,
              previewUrl: track.previewUrl,
              spotifyId: `itunes-${track.trackId}`, // Unique ID for BeatSync
            }))
          }
        },
        provider: 'iTunes'
      };
    } catch (error) {
      console.error('iTunes API search failed:', error);
      throw error;
    }
  }

  async stream(trackId: string): Promise<any> {
    // iTunes only provides 30-second previews
    // For full tracks, you'd need the actual audio file URLs
    throw new Error('iTunes API only provides 30-second previews. Full streaming not available.');
  }
}

// Usage example:
// const provider = new iTunesMusicProvider();
// const results = await provider.search('Taylor Swift');
// console.log(results);
