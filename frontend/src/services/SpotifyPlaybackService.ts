// Spotify Web Playback SDK Integration
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (config: any) => any;
    };
  }
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTrack: any;
  progress: number;
  duration: number;
  deviceId: string | null;
}

class SpotifyPlaybackService {
  private player: any = null;
  private deviceId: string | null = null;
  private accessToken: string | null = null;
  private isInitialized = false;

  // Initialize the Spotify Web Playback SDK
  async initialize(token: string): Promise<boolean> {
    this.accessToken = token;
    
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
            cb(this.accessToken || '');
          }
        });

        // Error handling
        this.player.addListener('initialization_error', ({ message }: { message: string }) => {
          console.error('Failed to initialize Spotify player:', message);
          resolve(false);
        });

        this.player.addListener('authentication_error', ({ message }: { message: string }) => {
          console.error('Failed to authenticate Spotify player:', message);
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
          console.log('Spotify player ready with Device ID:', device_id);
          this.deviceId = device_id;
          this.isInitialized = true;
          resolve(true);
        });

        // Not Ready
        this.player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
          console.log('Spotify player device ID has gone offline:', device_id);
        });

        this.player.connect();
      };
    });
  }

  // Play a specific track
  async playTrack(trackUri: string): Promise<void> {
    if (!this.isInitialized || !this.deviceId) {
      console.error('Spotify player not initialized');
      return;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: [trackUri]
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to play track: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error playing track:', error);
    }
  }

  // Toggle play/pause
  async togglePlayPause(): Promise<void> {
    if (!this.isInitialized) {
      console.error('Spotify player not initialized');
      return;
    }

    try {
      const currentState = await this.getCurrentPlaybackState();
      
      if (currentState?.is_playing) {
        await fetch('https://api.spotify.com/v1/me/player/pause', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        });
      } else {
        await fetch('https://api.spotify.com/v1/me/player/play', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        });
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }

  // Skip to next track
  async nextTrack(): Promise<void> {
    if (!this.isInitialized) {
      console.error('Spotify player not initialized');
      return;
    }

    try {
      await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
    } catch (error) {
      console.error('Error skipping to next track:', error);
    }
  }

  // Skip to previous track
  async previousTrack(): Promise<void> {
    if (!this.isInitialized) {
      console.error('Spotify player not initialized');
      return;
    }

    try {
      await fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
    } catch (error) {
      console.error('Error skipping to previous track:', error);
    }
  }

  // Seek to position
  async seekTo(position: number): Promise<void> {
    if (!this.isInitialized) {
      console.error('Spotify player not initialized');
      return;
    }

    try {
      await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${position}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
    } catch (error) {
      console.error('Error seeking to position:', error);
    }
  }

  // Get current playback state
  async getCurrentPlaybackState(): Promise<any> {
    if (!this.accessToken) {
      return null;
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting playback state:', error);
      return null;
    }
  }

  // Disconnect player
  disconnect(): void {
    if (this.player) {
      this.player.disconnect();
    }
    this.isInitialized = false;
    this.deviceId = null;
  }

  // Check if player is ready
  isReady(): boolean {
    return this.isInitialized && this.deviceId !== null;
  }
}

export default new SpotifyPlaybackService(); 