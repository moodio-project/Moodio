import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface GeniusSearchResult {
  response: {
    hits: Array<{
      result: {
        id: number;
        title: string;
        title_with_featured: string;
        primary_artist: {
          name: string;
          id: number;
        };
        url: string;
        path: string;
      };
    }>;
  };
}

interface GeniusSong {
  response: {
    song: {
      id: number;
      title: string;
      title_with_featured: string;
      lyrics_state: string;
      lyrics_owner_id: number;
      primary_artist: {
        name: string;
        id: number;
        url: string;
      };
      url: string;
      path: string;
      lyrics: string;
    };
  };
}

interface GeniusArtist {
  response: {
    artist: {
      id: number;
      name: string;
      url: string;
      image_url: string;
      header_image_url: string;
      description_annotation: {
        annotation: {
          body: {
            plain: string;
          };
        };
      };
    };
  };
}

class GeniusClient {
  private apiKey: string;
  private baseURL = 'https://api.genius.com';

  constructor() {
    this.apiKey = process.env.GENIUS_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Genius API key not found in environment variables');
    }
  }

  private async makeRequest(endpoint: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Genius API request failed: ${error.response?.data?.error || error.message}`);
    }
  }

  async searchSongs(query: string, limit: number = 10): Promise<any[]> {
    const data = await this.makeRequest(`/search?q=${encodeURIComponent(query)}`);
    
    if (!data.response?.hits) {
      return [];
    }

    return data.response.hits
      .slice(0, limit)
      .map((hit: any) => ({
        id: hit.result.id,
        title: hit.result.title,
        title_with_featured: hit.result.title_with_featured,
        artist: hit.result.primary_artist.name,
        artist_id: hit.result.primary_artist.id,
        url: hit.result.url,
        path: hit.result.path,
      }));
  }

  async getSongDetails(songId: number): Promise<any> {
    const data = await this.makeRequest(`/songs/${songId}`);
    
    if (!data.response?.song) {
      throw new Error('Song not found');
    }

    const song = data.response.song;
    return {
      id: song.id,
      title: song.title,
      title_with_featured: song.title_with_featured,
      artist: song.primary_artist.name,
      artist_id: song.primary_artist.id,
      url: song.url,
      path: song.path,
      lyrics_state: song.lyrics_state,
    };
  }

  async getArtistDetails(artistId: number): Promise<any> {
    const data = await this.makeRequest(`/artists/${artistId}`);
    
    if (!data.response?.artist) {
      throw new Error('Artist not found');
    }

    const artist = data.response.artist;
    return {
      id: artist.id,
      name: artist.name,
      url: artist.url,
      image_url: artist.image_url,
      header_image_url: artist.header_image_url,
      description: artist.description_annotation?.annotation?.body?.plain || '',
    };
  }

  async getArtistSongs(artistId: number, limit: number = 20): Promise<any[]> {
    const data = await this.makeRequest(`/artists/${artistId}/songs?per_page=${limit}&sort=popularity`);
    
    if (!data.response?.songs) {
      return [];
    }

    return data.response.songs.map((song: any) => ({
      id: song.id,
      title: song.title,
      title_with_featured: song.title_with_featured,
      url: song.url,
      path: song.path,
      release_date: song.release_date,
      primary_artist: song.primary_artist.name,
    }));
  }

  // Note: Genius API doesn't provide lyrics directly through their API
  // This would require scraping the lyrics page, which is against their terms of service
  // For production use, you would need to use a different lyrics API or service
  async getLyricsUrl(songPath: string): Promise<string> {
    // Return the Genius URL where lyrics can be found
    return `https://genius.com${songPath}`;
  }

  async searchByArtistAndTitle(artist: string, title: string): Promise<any[]> {
    const query = `${artist} ${title}`;
    return this.searchSongs(query, 5);
  }

  async getPopularSongsByArtist(artistName: string, limit: number = 10): Promise<any[]> {
    // First search for the artist
    const artistSearch = await this.searchSongs(artistName, 5);
    
    if (artistSearch.length === 0) {
      return [];
    }

    // Get the first artist's songs
    const artistId = artistSearch[0].artist_id;
    return this.getArtistSongs(artistId, limit);
  }
}

export const geniusClient = new GeniusClient(); 