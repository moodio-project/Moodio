import SpotifyWebApi from 'spotify-web-api-js';

// Type declarations for Spotify Web Playback SDK
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (config: any) => any;
    };
  }
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  uri: string;
  is_playable: boolean;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{ url: string; height: number; width: number }>;
  genres: string[];
  followers: { total: number };
  popularity: number;
  external_urls: { spotify: string };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  images: Array<{ url: string; height: number; width: number }>;
  release_date: string;
  total_tracks: number;
  tracks: { items: SpotifyTrack[] };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string; height: number; width: number }>;
  tracks: { total: number; items: Array<{ track: SpotifyTrack }> };
  owner: { display_name: string };
}

class SpotifyService {
  private spotifyApi: any;
  private player: any = null;
  private deviceId: string | null = null;

  constructor() {
    this.spotifyApi = new SpotifyWebApi();
  }

  // Initialize with access token
  setAccessToken(token: string) {
    this.spotifyApi.setAccessToken(token);
  }

  // Initialize Spotify Web Playback SDK
  async initializePlayer(): Promise<boolean> {
    return new Promise((resolve) => {
      // Load the Spotify Web Playback SDK script
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;

      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        this.player = new window.Spotify.Player({
          name: 'Moodio Web Player',
          getOAuthToken: (cb: (token: string) => void) => { 
            cb(localStorage.getItem('spotify_token') || ''); 
          }
        });

        // Error handling
        this.player.addListener('initialization_error', ({ message }: { message: string }) => {
          console.error('Failed to initialize:', message);
          resolve(false);
        });

        this.player.addListener('authentication_error', ({ message }: { message: string }) => {
          console.error('Failed to authenticate:', message);
          resolve(false);
        });

        this.player.addListener('account_error', ({ message }: { message: string }) => {
          console.error('Failed to validate Spotify account:', message);
          resolve(false);
        });

        this.player.addListener('playback_error', ({ message }: { message: string }) => {
          console.error('Failed to perform playback:', message);
        });

        // Playback status updates
        this.player.addListener('player_state_changed', (state: any) => {
          console.log('Playback state changed:', state);
        });

        // Ready
        this.player.addListener('ready', ({ device_id }: { device_id: string }) => {
          console.log('Ready with Device ID', device_id);
          this.deviceId = device_id;
          resolve(true);
        });

        // Not Ready
        this.player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
          console.log('Device ID has gone offline', device_id);
        });

        this.player.connect();
      };
    });
  }

  // Get current playback state
  async getCurrentPlayback(): Promise<any> {
    try {
      return await this.spotifyApi.getMyCurrentPlaybackState();
    } catch (error) {
      console.error('Failed to get current playback:', error);
      return null;
    }
  }

  // Play a track
  async playTrack(trackUri: string): Promise<void> {
    try {
      await this.spotifyApi.play({
        uris: [trackUri],
        device_id: this.deviceId
      });
    } catch (error) {
      console.error('Failed to play track:', error);
    }
  }

  // Play/pause toggle
  async togglePlayPause(): Promise<void> {
    try {
      const playback = await this.getCurrentPlayback();
      if (playback && playback.is_playing) {
        await this.spotifyApi.pause();
      } else {
        await this.spotifyApi.play();
      }
    } catch (error) {
      console.error('Failed to toggle play/pause:', error);
    }
  }

  // Skip to next track
  async nextTrack(): Promise<void> {
    try {
      await this.spotifyApi.skipToNext();
    } catch (error) {
      console.error('Failed to skip to next track:', error);
    }
  }

  // Skip to previous track
  async previousTrack(): Promise<void> {
    try {
      await this.spotifyApi.skipToPrevious();
    } catch (error) {
      console.error('Failed to skip to previous track:', error);
    }
  }

  // Search for tracks, artists, albums
  async search(query: string, type: 'track' | 'artist' | 'album' = 'track', limit: number = 20): Promise<any> {
    try {
      return await this.spotifyApi.search(query, [type], { limit });
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  // Get user's top tracks
  async getTopTracks(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyTrack[]> {
    try {
      const response = await this.spotifyApi.getMyTopTracks({ 
        time_range: timeRange,
        limit: 20 
      });
      return response.items;
    } catch (error) {
      console.error('Failed to get top tracks:', error);
      throw error;
    }
  }

  // Get user's playlists
  async getPlaylists(): Promise<SpotifyPlaylist[]> {
    try {
      const response = await this.spotifyApi.getUserPlaylists({ limit: 50 });
      return response.items;
    } catch (error) {
      console.error('Failed to get playlists:', error);
      throw error;
    }
  }

  // Get artist details
  async getArtist(artistId: string): Promise<SpotifyArtist> {
    try {
      return await this.spotifyApi.getArtist(artistId);
    } catch (error) {
      console.error('Failed to get artist:', error);
      throw error;
    }
  }

  // Get artist's top tracks
  async getArtistTopTracks(artistId: string): Promise<SpotifyTrack[]> {
    try {
      const response = await this.spotifyApi.getArtistTopTracks(artistId, 'US');
      return response.tracks;
    } catch (error) {
      console.error('Failed to get artist top tracks:', error);
      throw error;
    }
  }

  // Get album details
  async getAlbum(albumId: string): Promise<SpotifyAlbum> {
    try {
      return await this.spotifyApi.getAlbum(albumId);
    } catch (error) {
      console.error('Failed to get album:', error);
      throw error;
    }
  }

  // Get recently played tracks
  async getRecentlyPlayed(limit: number = 20): Promise<SpotifyTrack[]> {
    try {
      const response = await this.spotifyApi.getMyRecentlyPlayedTracks({ limit });
      return response.items.map((item: any) => item.track);
    } catch (error) {
      console.error('Failed to get recently played:', error);
      throw error;
    }
  }

  // Get audio features for a track
  async getAudioFeatures(trackId: string): Promise<any> {
    try {
      return await this.spotifyApi.getAudioFeaturesForTrack(trackId);
    } catch (error) {
      console.error('Failed to get audio features:', error);
      throw error;
    }
  }

  // Create a playlist
  async createPlaylist(name: string, description: string = ''): Promise<string> {
    try {
      const user = await this.spotifyApi.getMe();
      const playlist = await this.spotifyApi.createPlaylist(user.id, {
        name,
        description,
        public: false
      });
      return playlist.id;
    } catch (error) {
      console.error('Failed to create playlist:', error);
      throw error;
    }
  }

  // Add tracks to playlist
  async addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<void> {
    try {
      await this.spotifyApi.addTracksToPlaylist(playlistId, trackUris);
    } catch (error) {
      console.error('Failed to add tracks to playlist:', error);
      throw error;
    }
  }

  // Get user profile
  async getUserProfile(): Promise<any> {
    try {
      return await this.spotifyApi.getMe();
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  }

  // Get user's saved tracks
  async getSavedTracks(limit: number = 20): Promise<SpotifyTrack[]> {
    try {
      const response = await this.spotifyApi.getMySavedTracks({ limit });
      return response.items.map((item: any) => item.track);
    } catch (error) {
      console.error('Failed to get saved tracks:', error);
      throw error;
    }
  }

  // Save track to user's library
  async saveTrack(trackId: string): Promise<void> {
    try {
      await this.spotifyApi.addToMySavedTracks([trackId]);
    } catch (error) {
      console.error('Failed to save track:', error);
      throw error;
    }
  }

  // Remove track from user's library
  async removeTrack(trackId: string): Promise<void> {
    try {
      await this.spotifyApi.removeFromMySavedTracks([trackId]);
    } catch (error) {
      console.error('Failed to remove track:', error);
      throw error;
    }
  }

  // Check if track is saved
  async isTrackSaved(trackId: string): Promise<boolean> {
    try {
      const response = await this.spotifyApi.containsMySavedTracks([trackId]);
      return response[0];
    } catch (error) {
      console.error('Failed to check if track is saved:', error);
      return false;
    }
  }

  // Disconnect player
  disconnect(): void {
    if (this.player) {
      this.player.disconnect();
    }
  }

  // Get mood-based song recommendations
  async getMoodBasedRecommendations(mood: string, intensity: number): Promise<any[]> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Map mood to Spotify seed parameters
      const moodSeeds = this.getMoodSeeds(mood, intensity);
      
      const response = await fetch(
        `https://api.spotify.com/v1/recommendations?${new URLSearchParams({
          limit: '20',
          seed_genres: moodSeeds.genres.join(','),
          target_valence: moodSeeds.valence.toString(),
          target_energy: moodSeeds.energy.toString(),
          target_tempo: moodSeeds.tempo.toString(),
          min_popularity: '30'
        })}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      return data.tracks.map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        album_art: track.album.images[0]?.url,
        duration_ms: track.duration_ms,
        uri: track.uri,
        popularity: track.popularity,
        audio_features: {
          valence: track.valence,
          energy: track.energy,
          tempo: track.tempo,
          danceability: track.danceability
        }
      }));
    } catch (error) {
      console.error('Error getting mood-based recommendations:', error);
      return this.getMockMoodRecommendations(mood, intensity);
    }
  }

  // Map mood and intensity to Spotify audio features
  private getMoodSeeds(mood: string, intensity: number): {
    genres: string[];
    valence: number;
    energy: number;
    tempo: number;
  } {
    const intensityFactor = intensity / 10;
    
    switch (mood.toLowerCase()) {
      case 'happy':
        return {
          genres: ['pop', 'dance', 'happy'],
          valence: 0.7 + (intensityFactor * 0.3),
          energy: 0.6 + (intensityFactor * 0.4),
          tempo: 120 + (intensityFactor * 40)
        };
      case 'sad':
        return {
          genres: ['sad', 'acoustic', 'indie'],
          valence: 0.3 - (intensityFactor * 0.2),
          energy: 0.3 - (intensityFactor * 0.2),
          tempo: 80 - (intensityFactor * 20)
        };
      case 'calm':
        return {
          genres: ['ambient', 'chill', 'acoustic'],
          valence: 0.5,
          energy: 0.3 - (intensityFactor * 0.2),
          tempo: 70 - (intensityFactor * 20)
        };
      case 'excited':
        return {
          genres: ['rock', 'electronic', 'dance'],
          valence: 0.6 + (intensityFactor * 0.4),
          energy: 0.8 + (intensityFactor * 0.2),
          tempo: 140 + (intensityFactor * 40)
        };
      case 'angry':
        return {
          genres: ['rock', 'metal', 'punk'],
          valence: 0.4,
          energy: 0.8 + (intensityFactor * 0.2),
          tempo: 150 + (intensityFactor * 30)
        };
      case 'anxious':
        return {
          genres: ['ambient', 'chill', 'classical'],
          valence: 0.4,
          energy: 0.3,
          tempo: 60
        };
      case 'relaxed':
        return {
          genres: ['jazz', 'ambient', 'chill'],
          valence: 0.6,
          energy: 0.3,
          tempo: 80
        };
      case 'energetic':
        return {
          genres: ['dance', 'electronic', 'pop'],
          valence: 0.7,
          energy: 0.8 + (intensityFactor * 0.2),
          tempo: 130 + (intensityFactor * 30)
        };
      default:
        return {
          genres: ['pop'],
          valence: 0.5,
          energy: 0.5,
          tempo: 100
        };
    }
  }

  // Mock recommendations for fallback
  private getMockMoodRecommendations(mood: string, intensity: number): any[] {
    const mockTracks = [
      {
        id: 'mock1',
        name: 'Uplifting Song',
        artist: 'Positive Vibes',
        album: 'Good Mood',
        album_art: 'https://via.placeholder.com/300x300/1DB954/FFFFFF?text=🎵',
        duration_ms: 180000,
        uri: 'spotify:track:mock1',
        popularity: 75,
        audio_features: { valence: 0.8, energy: 0.7, tempo: 120, danceability: 0.8 }
      },
      {
        id: 'mock2',
        name: 'Chill Vibes',
        artist: 'Relaxing Sounds',
        album: 'Peaceful',
        album_art: 'https://via.placeholder.com/300x300/1DB954/FFFFFF?text=🎵',
        duration_ms: 200000,
        uri: 'spotify:track:mock2',
        popularity: 65,
        audio_features: { valence: 0.6, energy: 0.4, tempo: 90, danceability: 0.6 }
      },
      {
        id: 'mock3',
        name: 'Energetic Beat',
        artist: 'High Energy',
        album: 'Power Up',
        album_art: 'https://via.placeholder.com/300x300/1DB954/FFFFFF?text=🎵',
        duration_ms: 160000,
        uri: 'spotify:track:mock3',
        popularity: 80,
        audio_features: { valence: 0.7, energy: 0.9, tempo: 140, danceability: 0.9 }
      }
    ];

    return mockTracks.map(track => ({
      ...track,
      reason: `Recommended for your ${mood} mood (intensity: ${intensity}/10)`
    }));
  }

  // Get audio features for mood analysis
  async getAudioFeaturesForMoodAnalysis(trackIds: string[]): Promise<any[]> {
    try {
      const response = await this.spotifyApi.getAudioFeaturesForTracks(trackIds);
      return response.audio_features;
    } catch (error) {
      console.error('Failed to get audio features:', error);
      throw error;
    }
  }

  // Get user's mood-based playlists
  async getMoodPlaylists(mood: string): Promise<SpotifyPlaylist[]> {
    try {
      const response = await this.spotifyApi.getUserPlaylists({ limit: 50 });

      return response.items.filter((playlist: any) =>
        playlist.name.toLowerCase().includes(mood.toLowerCase())
      );
    } catch (error) {
      console.error('Failed to get mood playlists:', error);
      throw error;
    }
  }

  // Get access token from localStorage or context
  private async getAccessToken(): Promise<string | null> {
    return localStorage.getItem('spotify_access_token');
  }

  async searchPlaylists(searchQuery: string): Promise<any[]> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(
        `https://api.spotify.com/v1/me/playlists?limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch playlists');
      }

      const data = await response.json();
      return data.items.filter((playlist: any) =>
        playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching playlists:', error);
      return [];
    }
  }
}

export default new SpotifyService(); 