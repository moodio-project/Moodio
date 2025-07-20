import axios from 'axios';
import { Client } from 'genius-lyrics';

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
  private client: Client;

  constructor() {
    this.apiKey = process.env.GENIUS_API_KEY || '';
    if (!this.apiKey) {
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('GENIUS')));
      throw new Error('Genius API key not found in environment variables');
    }
    this.client = new Client(this.apiKey);
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
    try {
      const searches = await this.client.songs.search(query);
      return searches.slice(0, limit).map(song => ({
        id: song.id,
        title: song.title,
        title_with_featured: song.title,
        artist: song.artist.name,
        artist_id: song.artist.id,
        url: song.url,
        path: song.url, // Using url as path since path doesn't exist
        thumbnail: song.thumbnail,
      }));
    } catch (error: any) {
      console.error('Genius search error:', error);
      return [];
    }
  }

  async getSongDetails(songId: number): Promise<any> {
    try {
      const song = await this.client.songs.get(songId);
      return {
        id: song.id,
        title: song.title,
        title_with_featured: song.title,
        artist: song.artist.name,
        artist_id: song.artist.id,
        url: song.url,
        path: song.url, // Using url as path since path doesn't exist
        thumbnail: song.thumbnail,
        releaseDate: song.releasedAt, // Using releasedAt instead of releaseDate
      };
    } catch (error: any) {
      throw new Error(`Failed to get song details: ${error.message}`);
    }
  }

  async getArtistDetails(artistId: number): Promise<any> {
    try {
      const artist = await this.client.artists.get(artistId);
      return {
        id: artist.id,
        name: artist.name,
        url: artist.url,
        image_url: artist.image,
        header_image_url: artist.image,
        description: '', // Description doesn't exist on Artist type
      };
    } catch (error: any) {
      throw new Error(`Failed to get artist details: ${error.message}`);
    }
  }

  async getArtistSongs(artistId: number, limit: number = 20): Promise<any[]> {
    try {
      const artist = await this.client.artists.get(artistId);
      const songs = await artist.songs();
      return songs.slice(0, limit).map(song => ({
        id: song.id,
        title: song.title,
        title_with_featured: song.title,
        url: song.url,
        path: song.url, // Using url as path since path doesn't exist
        release_date: song.releasedAt, // Using releasedAt instead of releaseDate
        primary_artist: song.artist.name,
      }));
    } catch (error: any) {
      console.error('Genius artist songs error:', error);
      return [];
    }
  }

  async getLyrics(songId: number): Promise<string> {
    try {
      const song = await this.client.songs.get(songId);
      const lyrics = await song.lyrics();
      return lyrics;
    } catch (error: any) {
      throw new Error(`Failed to get lyrics: ${error.message}`);
    }
  }

  async getLyricsUrl(songPath: string): Promise<string> {
    return `https://genius.com${songPath}`;
  }

  async searchByArtistAndTitle(artist: string, title: string): Promise<any[]> {
    const query = `${artist} ${title}`;
    return this.searchSongs(query, 5);
  }

  async getPopularSongsByArtist(artistName: string, limit: number = 10): Promise<any[]> {
    try {
      const searches = await this.client.songs.search(artistName);
      const artistSongs = searches.filter(song => 
        song.artist.name.toLowerCase().includes(artistName.toLowerCase())
      );
      return artistSongs.slice(0, limit).map(song => ({
        id: song.id,
        title: song.title,
        artist: song.artist.name,
        url: song.url,
        thumbnail: song.thumbnail,
      }));
    } catch (error: any) {
      console.error('Genius popular songs error:', error);
      return [];
    }
  }
}

export const geniusClient = new GeniusClient();