import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth functions
export const auth = {
  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  spotifyExchange: async (code: string) => {
    const response = await api.post('/auth/spotify/exchange', { code });
    return response.data;
  },
    
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
    
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Mood functions
export const moods = {
  getAll: async () => {
    const response = await api.get('/moods');
    return response.data;
  },
  
  create: async (mood: string, intensity: number, note: string) => {
    const response = await api.post('/moods', { mood, intensity, note });
    return response.data;
  }
};

// Favorites functions
export const favorites = {
  getAll: async () => {
    const response = await api.get('/favorites');
    return response.data;
  },

  add: async (track: any) => {
    const favoriteData = {
      item_type: 'track',
      item_id: track.id,
      item_name: track.name,
      artist_name: track.artists?.[0]?.name || 'Unknown Artist',
      album_name: track.album?.name || 'Unknown Album',
      artwork_url: track.album?.images?.[0]?.url || null,
      track_uri: track.uri
    };
    
    const response = await api.post('/favorites', favoriteData);
    return response.data;
  },

  remove: async (trackId: string) => {
    const response = await api.delete(`/favorites/${trackId}`);
    return response.data;
  },

  check: async (trackId: string) => {
    const response = await api.get('/favorites');
    const favorites = (response.data as any).favorites || [];
    return favorites.some((fav: any) => fav.item_id === trackId);
  }
};

// Genius API functions - NEW!
export const genius = {
  // Get song lyrics from Genius
  getSongLyrics: async (geniusSongId: number) => {
    const response = await api.get(`/genius/song/${geniusSongId}/lyrics`);
    return response.data;
  },

  // Search Genius for artists or songs
  search: async (query: string, type: 'artist' | 'song' = 'song') => {
    const response = await api.get(`/genius/search?q=${encodeURIComponent(query)}&type=${type}`);
    return response.data;
  }
};

// Spotify functions
export const spotify = {
  getTopTracks: async () => {
    const response = await api.get('/spotify/top-tracks');
    return response.data;
  },
  
  // Enhanced artist data with Genius integration - UPDATED!
  getEnhancedArtist: async (artistId: string) => {
    const response = await api.get(`/spotify/artist/${artistId}/enhanced`);
    return response.data;
  },
  
  getEnhancedRecommendations: async (mood: string) => {
    const response = await api.get(`/recommendations/${mood}/enhanced`);
    return response.data;
  },
  
  search: async (query: string, type = 'track,artist,album', limit = 20) => {
    const response = await api.get(`/spotify/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);
    return response.data;
  },
  
  getArtist: async (artistId: string) => {
    const response = await api.get(`/spotify/artist/${artistId}`);
    return response.data;
  },
  
  getArtistTopTracks: async (artistId: string) => {
    const response = await api.get(`/spotify/artist/${artistId}/top-tracks`);
    return response.data;
  },
  
  getAudioFeatures: async (trackId: string) => {
    const response = await api.get(`/spotify/audio-features/${trackId}`);
    return response.data;
  },
  
  getRecommendations: async (mood: string) => {
    const response = await api.get(`/spotify/recommendations/${mood}`);
    return response.data;
  }
};


// AI functions
export const ai = {
  getMoodRecommendations: async () => {
    const response = await api.post('/ai/mood-recommendations', {}); // Add empty body
    return response.data;
  },

  getMoodInsights: async () => {
    const response = await api.get('/ai/mood-insights');
    return response.data;
  }
};