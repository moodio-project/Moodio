export interface GeniusArtist {
  id: number;
  name: string;
  url: string;
  image_url: string;
  header_image_url: string;
  is_verified: boolean;
  description: {
    plain: string;
    html: string;
  };
  followers_count: number;
}

export interface GeniusSong {
  id: number;
  title: string;
  url: string;
  lyrics_state: string;
  header_image_url: string;
  song_art_image_url: string;
  release_date_for_display: string;
  release_date_with_abbreviated_month_for_display: string;
  stats: {
    unreviewed_annotations: number;
    hot: boolean;
    pageviews: number;
  };
  primary_artist: {
    id: number;
    name: string;
    url: string;
    image_url: string;
  };
  featured_artists: Array<{
    id: number;
    name: string;
    url: string;
    image_url: string;
  }>;
  producer_artists: Array<{
    id: number;
    name: string;
    url: string;
    image_url: string;
  }>;
  media: Array<{
    provider: string;
    start: number;
    type: string;
    url: string;
  }>;
  description: {
    plain: string;
    html: string;
  };
}

class GeniusService {
  private baseUrl = 'https://api.genius.com';
  private accessToken: string | null = null;

  constructor() {
    // In a real app, you'd get this from your backend
    this.accessToken = import.meta.env.VITE_GENIUS_ACCESS_TOKEN || null;
  }

  // Search for artists
  async searchArtists(query: string): Promise<GeniusArtist[]> {
    const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to search artists');
    }

    const data = await response.json();
    return data.response.hits
      .filter((hit: any) => hit.type === 'artist')
      .map((hit: any) => hit.result);
  }

  // Get artist details
  async getArtist(artistId: number): Promise<GeniusArtist> {
    const response = await fetch(`${this.baseUrl}/artists/${artistId}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get artist details');
    }

    const data = await response.json();
    return data.response.artist;
  }

  // Get artist's songs
  async getArtistSongs(artistId: number, page: number = 1, perPage: number = 20): Promise<GeniusSong[]> {
    const response = await fetch(
      `${this.baseUrl}/artists/${artistId}/songs?page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get artist songs');
    }

    const data = await response.json();
    return data.response.songs;
  }

  // Search for songs
  async searchSongs(query: string): Promise<GeniusSong[]> {
    const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to search songs');
    }

    const data = await response.json();
    return data.response.hits
      .filter((hit: any) => hit.type === 'song')
      .map((hit: any) => hit.result);
  }

  // Get song details
  async getSong(songId: number): Promise<GeniusSong> {
    const response = await fetch(`${this.baseUrl}/songs/${songId}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get song details');
    }

    const data = await response.json();
    return data.response.song;
  }

  // Get song lyrics (requires additional API call to lyrics.genius.com)
  async getSongLyrics(_songUrl: string): Promise<string> {
    try {
      // This would require server-side implementation to avoid CORS issues
      // For now, we'll return a placeholder
      return 'Lyrics would be fetched from Genius here...';
    } catch (error) {
      console.error('Failed to get lyrics:', error);
      return 'Lyrics not available';
    }
  }

  // Get artist's albums
  async getArtistAlbums(artistId: number): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/artists/${artistId}/albums`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get artist albums');
    }

    const data = await response.json();
    return data.response.albums;
  }

  // Get trending artists
  async getTrendingArtists(): Promise<GeniusArtist[]> {
    const response = await fetch(`${this.baseUrl}/artists/trending`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get trending artists');
    }

    const data = await response.json();
    return data.response.artists;
  }

  // Get artist's featured songs
  async getArtistFeaturedSongs(artistId: number): Promise<GeniusSong[]> {
    const response = await fetch(`${this.baseUrl}/artists/${artistId}/songs?sort=popularity`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get artist featured songs');
    }

    const data = await response.json();
    return data.response.songs.slice(0, 10); // Get top 10
  }

  // Search for artists by genre or style
  async searchArtistsByGenre(genre: string): Promise<GeniusArtist[]> {
    const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(genre)}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to search artists by genre');
    }

    const data = await response.json();
    return data.response.hits
      .filter((hit: any) => hit.type === 'artist')
      .map((hit: any) => hit.result);
  }

  // Get artist's biography summary
  async getArtistBio(artistId: number): Promise<string> {
    try {
      const artist = await this.getArtist(artistId);
      return artist.description.plain || 'Biography not available';
    } catch (error) {
      console.error('Failed to get artist bio:', error);
      return 'Biography not available';
    }
  }

  // Get artist's social media links
  async getArtistSocialLinks(artistId: number): Promise<any> {
    try {
      const artist = await this.getArtist(artistId);
      // Extract social media links from artist description
      const socialLinks: any = {
        website: artist.url,
        twitter: null,
        instagram: null,
        facebook: null
      };

      // Parse description for social media links
      const description = artist.description.plain || '';
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = description.match(urlRegex) || [];

      urls.forEach(url => {
        if (url.includes('twitter.com')) socialLinks.twitter = url;
        if (url.includes('instagram.com')) socialLinks.instagram = url;
        if (url.includes('facebook.com')) socialLinks.facebook = url;
      });

      return socialLinks;
    } catch (error) {
      console.error('Failed to get artist social links:', error);
      return {};
    }
  }
}

export default new GeniusService(); 