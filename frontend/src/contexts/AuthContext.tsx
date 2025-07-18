import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../adapters/api';

interface User {
  id: number;
  spotify_id?: string;
  display_name?: string;
  email: string;
  avatar_url?: string;
}

interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string; height: number; width: number }>;
  external_urls: { spotify: string };
  followers: { total: number };
  country: string;
  product: string;
}

interface AuthContextType {
  user: User | null;
  spotifyProfile: SpotifyProfile | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  spotifyLogin: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  getProfile: () => Promise<void>;
  isLoading: boolean;
  spotifyProfileLoading: boolean;
  spotifyProfileError: string | null;
  fetchSpotifyProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [spotifyProfile, setSpotifyProfile] = useState<SpotifyProfile | null>(null);
  const [spotifyProfileLoading, setSpotifyProfileLoading] = useState(false);
  const [spotifyProfileError, setSpotifyProfileError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    if (token) {
      getProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchSpotifyProfile = async () => {
    setSpotifyProfileLoading(true);
    setSpotifyProfileError(null);
    try {
      const response = await api.get('/spotify/profile', { withCredentials: true });
      setSpotifyProfile(response.data);
    } catch (error: any) {
      setSpotifyProfile(null);
      setSpotifyProfileError('Failed to fetch Spotify profile');
    } finally {
      setSpotifyProfileLoading(false);
    }
  };

  const getProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      const { user: userData, spotify_profile } = response.data;
      
      setUser(userData);
      setSpotifyProfile(spotify_profile);
      // Fetch Spotify profile from backend if authenticated
      await fetchSpotifyProfile();
    } catch (error) {
      console.error('Failed to get profile:', error);
      // If profile fetch fails, clear auth state
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/users/login', { email, password });
      const { user, token } = response.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const spotifyLogin = async () => {
    try {
      const response = await api.get('/auth/login');
      const { authUrl } = response.data;
      
      // Redirect to Spotify OAuth
      window.location.href = authUrl;
    } catch (error) {
      throw new Error('Spotify login failed');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/users/register', { username, email, password });
      const { user, token } = response.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setSpotifyProfile(null);
    setToken(null);
    localStorage.removeItem('token');
    
    // Call backend logout
    api.post('/auth/logout').catch(console.error);
  };

  const value = {
    user,
    spotifyProfile,
    token,
    login,
    spotifyLogin,
    register,
    logout,
    getProfile,
    isLoading,
    spotifyProfileLoading,
    spotifyProfileError,
    fetchSpotifyProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 