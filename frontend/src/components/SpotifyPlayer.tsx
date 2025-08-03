import React, { useState, useEffect } from 'react';

interface SpotifyPlayerProps {
  accessToken?: string | null;
  hasPremium?: boolean;
}

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ accessToken, hasPremium }) => {
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = 'http://localhost:3001';

  useEffect(() => {
    if (accessToken && hasPremium) {
      console.log('✅ Have Spotify token and Premium status, initializing Web Playback SDK...');
      initializeWebPlaybackSDK();
    } else {
      setLoading(false);
      if (!accessToken) {
        setError('No Spotify access token available');
      } else if (!hasPremium) {
        setError('Spotify Premium account required for music playback');
      }
    }
  }, [accessToken, hasPremium]);

  const initializeWebPlaybackSDK = () => {
    // Check if SDK is already loaded
    if (window.Spotify) {
      createPlayer();
      return;
    }

    // Load the SDK script
    console.log('📥 Loading Spotify Web Playback SDK...');
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    // SDK ready callback
    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('✅ Spotify SDK loaded, creating player...');
      createPlayer();
    };
  };

  const createPlayer = () => {
    if (!accessToken) {
      setError('No access token available');
      setLoading(false);
      return;
    }

    const spotifyPlayer = new window.Spotify.Player({
      name: 'Moodio Player',
      getOAuthToken: (cb: (token: string) => void) => {
        console.log('🔑 Providing OAuth token to Spotify Player');
        cb(accessToken);
      },
      volume: 0.5
    });

    // Error handling
    spotifyPlayer.addListener('initialization_error', ({ message }: any) => {
      console.error('❌ Initialization error:', message);
      setError(`Player initialization failed: ${message}`);
      setLoading(false);
    });

    spotifyPlayer.addListener('authentication_error', ({ message }: any) => {
      console.error('❌ Authentication error:', message);
      setError(`Authentication failed: ${message}`);
      setLoading(false);
    });

    spotifyPlayer.addListener('account_error', ({ message }: any) => {
      console.error('❌ Account error:', message);
      setError(`Account error: ${message}`);
      setLoading(false);
    });

    spotifyPlayer.addListener('playback_error', ({ message }: any) => {
      console.error('❌ Playback error:', message);
      // Don't set error for playback errors, just log them
    });

    // Ready event - player is connected and ready
    spotifyPlayer.addListener('ready', ({ device_id }: any) => {
      console.log('✅ Spotify Player ready! Device ID:', device_id);
      setDeviceId(device_id);
      setPlayer(spotifyPlayer);
      setError(null);
      setLoading(false);
    });

    // Not ready event
    spotifyPlayer.addListener('not_ready', ({ device_id }: any) => {
      console.log('⚠️ Device went offline:', device_id);
    });

    // Player state changes (track info, play/pause, etc.)
    spotifyPlayer.addListener('player_state_changed', (state: any) => {
      if (!state) {
        console.log('📱 Player state: No active session');
        setCurrentTrack(null);
        setIsPlaying(false);
        return;
      }

      console.log('🎵 Player state changed:', {
        track: state.track_window.current_track?.name,
        paused: state.paused,
        position: state.position
      });

      setCurrentTrack(state.track_window.current_track);
      setIsPlaying(!state.paused);
    });

    // Connect to the player
    console.log('🔗 Connecting to Spotify Player...');
    spotifyPlayer.connect().then((success: boolean) => {
      if (success) {
        console.log('✅ Successfully connected to Spotify Player');
      } else {
        console.error('❌ Failed to connect to Spotify Player');
        setError('Failed to connect to Spotify');
        setLoading(false);
      }
    });
  };

  // Play a specific track
  const playTrack = async (trackUri: string) => {
    if (!deviceId || !accessToken) {
      console.log('❌ Cannot play track: no device or token');
      return;
    }

    console.log(`🎵 Playing track: ${trackUri} on device: ${deviceId}`);

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({
          uris: [trackUri]
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok || response.status === 204) {
        console.log('✅ Playback started successfully');
      } else {
        const errorText = await response.text();
        console.error('❌ Playback failed:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error starting playback:', error);
    }
  };

  // Player controls
  const togglePlayback = () => {
    if (!player) return;

    if (isPlaying) {
      console.log('⏸️ Pausing playback');
      player.pause();
    } else {
      console.log('▶️ Resuming playback');
      player.resume();
    }
  };

  const nextTrack = () => {
    if (!player) return;
    console.log('⏭️ Next track');
    player.nextTrack();
  };

  const previousTrack = () => {
    if (!player) return;
    console.log('⏮️ Previous track');
    player.previousTrack();
  };

  // Expose playTrack function to parent components via window
  React.useEffect(() => {
    if (deviceId && accessToken) {
      (window as any).moodioPlayTrack = playTrack;
    }
  }, [deviceId, accessToken]);

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        background: '#1E1E1E', 
        borderRadius: '8px', 
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          border: '3px solid #333',
          borderTop: '3px solid #22C55E',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <p style={{ color: '#B3B3B3', margin: 0 }}>Connecting to Spotify...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        background: '#1E1E1E', 
        borderRadius: '8px', 
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ color: '#FFFFFF', margin: '0 0 8px 0' }}>Spotify Player</h3>
        <p style={{ color: '#F472B6', fontSize: '14px', margin: '0 0 16px 0' }}>{error}</p>
        <button 
          onClick={() => {
            setError(null);
            setLoading(true);
            if (accessToken && hasPremium) {
              initializeWebPlaybackSDK();
            }
          }}
          style={{
            background: '#22C55E',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Player ready state
  return (
    <div style={{ 
      background: '#1E1E1E', 
      borderRadius: '8px', 
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{ color: '#FFFFFF', margin: 0, fontSize: '18px' }}>🎵 Music Player</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            background: '#22C55E',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
          <span style={{ color: '#22C55E', fontSize: '12px', fontWeight: '600' }}>
            CONNECTED
          </span>
        </div>
      </div>

      {currentTrack ? (
        // Now Playing View
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            <img
              src={currentTrack.album.images[0]?.url}
              alt={currentTrack.album.name}
              style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '8px',
                objectFit: 'cover'
              }}
            />
            <div style={{ flex: 1 }}>
              <h4 style={{ 
                color: '#FFFFFF', 
                margin: '0 0 4px 0',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                {currentTrack.name}
              </h4>
              <p style={{ 
                color: '#B3B3B3', 
                margin: 0,
                fontSize: '14px'
              }}>
                {currentTrack.artists.map((a: any) => a.name).join(', ')}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '16px'
          }}>
            <button
              onClick={previousTrack}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#B3B3B3',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '8px'
              }}
            >
              ⏮️
            </button>
            
            <button
              onClick={togglePlayback}
              style={{
                background: '#22C55E',
                border: 'none',
                color: 'white',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            
            <button
              onClick={nextTrack}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#B3B3B3',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '8px'
              }}
            >
              ⏭️
            </button>
          </div>
        </div>
      ) : (
        // Ready State
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
          <h4 style={{ 
            color: '#FFFFFF', 
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Ready to Play Music!
          </h4>
          <p style={{ 
            color: '#B3B3B3', 
            fontSize: '14px',
            margin: '0 0 8px 0'
          }}>
            Use search or mood recommendations to start playing music.
          </p>
          <div style={{ 
            color: '#666', 
            fontSize: '12px',
            marginTop: '8px'
          }}>
            Device: {deviceId.substring(0, 8)}...
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

// Global type declarations
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
    moodioPlayTrack: (trackUri: string) => void;
  }
}

export default SpotifyPlayer;