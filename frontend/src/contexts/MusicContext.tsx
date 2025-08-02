import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SpotifyService, { SpotifyTrack, SpotifyArtist, SpotifyAlbum } from '../services/SpotifyService';
import SpotifyPlaybackService from '../services/SpotifyPlaybackService';

interface MusicContextType {
  // Current playback state
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  
  // Playback controls
  playTrack: (trackUri: string) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  
  // Search and discovery
  searchResults: {
    tracks: SpotifyTrack[];
    artists: SpotifyArtist[];
    albums: SpotifyAlbum[];
  };
  searchMusic: (query: string, type?: 'track' | 'artist' | 'album') => Promise<void>;
  
  // User's music library
  topTracks: SpotifyTrack[];
  playlists: any[];
  recentlyPlayed: SpotifyTrack[];
  
  // Favorites
  favorites: {
    tracks: SpotifyTrack[];
    artists: SpotifyArtist[];
    albums: SpotifyAlbum[];
  };
  addToFavorites: (type: 'track' | 'artist' | 'album', item: any) => void;
  removeFromFavorites: (type: 'track' | 'artist' | 'album', itemId: string) => void;
  
  // Loading states
  isLoading: boolean;
  isSearching: boolean;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

interface MusicProviderProps {
  children: ReactNode;
}

export const MusicProvider: React.FC<MusicProviderProps> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [searchResults, setSearchResults] = useState({
    tracks: [],
    artists: [],
    albums: []
  });
  
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<SpotifyTrack[]>([]);
  
  const [favorites, setFavorites] = useState({
    tracks: [],
    artists: [],
    albums: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Spotify player and load user data
  useEffect(() => {
    const initializeMusic = async () => {
      const token = localStorage.getItem('spotify_token');
      if (!token) return;

      try {
        setIsLoading(true);
        
        // Initialize Spotify Web Playback SDK
        const playbackInitialized = await SpotifyPlaybackService.initialize(token);
        if (playbackInitialized) {
          console.log('Spotify Web Playback SDK initialized successfully');
        }

        // Set access token for API calls
        SpotifyService.setAccessToken(token);
        
        // Load user's music library
        await loadUserLibrary();
        
        // Start polling for playback state
        if (playbackInitialized) {
          pollPlaybackState();
        }
        
      } catch (err) {
        setError('Failed to initialize music player');
        console.error('Music initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeMusic();
  }, []);

  // Poll for playback state updates
  const pollPlaybackState = () => {
    const pollInterval = setInterval(async () => {
      try {
        const playback = await SpotifyPlaybackService.getCurrentPlaybackState();
        if (playback && playback.item) {
          setCurrentTrack(playback.item);
          setIsPlaying(playback.is_playing);
          setProgress(playback.progress_ms || 0);
          setDuration(playback.item.duration_ms);
        }
      } catch (error) {
        // Silently handle polling errors
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  };

  // Load user's music library from Spotify API
  const loadUserLibrary = async () => {
    const token = localStorage.getItem('spotify_token');
    if (!token) return;

    try {
      // Load top tracks
      const tracks = await SpotifyService.getTopTracks();
      setTopTracks(tracks);
      
      // Load playlists
      const userPlaylists = await SpotifyService.getPlaylists();
      setPlaylists(userPlaylists);
      
      // Load recently played
      const recent = await SpotifyService.getRecentlyPlayed();
      setRecentlyPlayed(recent);
      
    } catch (err) {
      console.error('Failed to load music library:', err);
      setError('Failed to load music library');
    }
  };

  // Playback controls using real Spotify API
  const playTrack = async (trackUri: string) => {
    try {
      await SpotifyPlaybackService.playTrack(trackUri);
    } catch (err) {
      setError('Failed to play track');
    }
  };

  const togglePlayPause = async () => {
    try {
      await SpotifyPlaybackService.togglePlayPause();
    } catch (err) {
      setError('Failed to toggle playback');
    }
  };

  const nextTrack = async () => {
    try {
      await SpotifyPlaybackService.nextTrack();
    } catch (err) {
      setError('Failed to skip to next track');
    }
  };

  const previousTrack = async () => {
    try {
      await SpotifyPlaybackService.previousTrack();
    } catch (err) {
      setError('Failed to skip to previous track');
    }
  };

  const seekTo = async (position: number) => {
    try {
      await SpotifyPlaybackService.seekTo(position);
    } catch (err) {
      setError('Failed to seek to position');
    }
  };

  // Search functionality using real Spotify API
  const searchMusic = async (query: string, type: 'track' | 'artist' | 'album' = 'track') => {
    if (!query.trim()) return;

    try {
      setIsSearching(true);
      const results = await SpotifyService.search(query, type, 20);
      
      if (type === 'track') {
        setSearchResults(prev => ({ ...prev, tracks: results.tracks?.items || [] }));
      } else if (type === 'artist') {
        setSearchResults(prev => ({ ...prev, artists: results.artists?.items || [] }));
      } else if (type === 'album') {
        setSearchResults(prev => ({ ...prev, albums: results.albums?.items || [] }));
      }
    } catch (err) {
      setError('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  // Favorites management
  const addToFavorites = (type: 'track' | 'artist' | 'album', item: any) => {
    setFavorites(prev => ({
      ...prev,
      [type + 's']: [...prev[type + 's' as keyof typeof prev], item]
    }));
  };

  const removeFromFavorites = (type: 'track' | 'artist' | 'album', itemId: string) => {
    setFavorites(prev => ({
      ...prev,
      [type + 's']: prev[type + 's' as keyof typeof prev].filter((item: any) => item.id !== itemId)
    }));
  };

  const clearError = () => setError(null);

  const value: MusicContextType = {
    currentTrack,
    isPlaying,
    progress,
    duration,
    playTrack,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    searchResults,
    searchMusic,
    topTracks,
    playlists,
    recentlyPlayed,
    favorites,
    addToFavorites,
    removeFromFavorites,
    isLoading,
    isSearching,
    error,
    clearError
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}; 