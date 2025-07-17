import React, { createContext, useContext, useState, ReactNode } from 'react';
import { musicAPI } from '../adapters/api';

interface Music {
  id: number;
  title: string;
  artist: string;
  album?: string;
  genre: string;
  mood_type: string;
  url?: string;
  duration?: number;
  created_at: string;
  updated_at: string;
}

interface CreateMusicData {
  title: string;
  artist: string;
  album?: string;
  genre: string;
  mood_type: string;
  url?: string;
  duration?: number;
}

interface MusicContextType {
  music: Music[];
  isLoading: boolean;
  error: string | null;
  fetchAllMusic: () => Promise<void>;
  fetchMusicByMood: (moodType: string) => Promise<void>;
  fetchMusicByGenre: (genre: string) => Promise<void>;
  searchMusic: (query: string) => Promise<void>;
  createMusic: (musicData: CreateMusicData) => Promise<void>;
  updateMusic: (id: number, musicData: Partial<CreateMusicData>) => Promise<void>;
  deleteMusic: (id: number) => Promise<void>;
  clearError: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

interface MusicProviderProps {
  children: ReactNode;
}

export const MusicProvider: React.FC<MusicProviderProps> = ({ children }) => {
  const [music, setMusic] = useState<Music[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllMusic = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await musicAPI.getAll();
      setMusic(response.data);
    } catch (err) {
      setError('Failed to fetch music');
      console.error('Error fetching music:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMusicByMood = async (moodType: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await musicAPI.getByMood(moodType);
      setMusic(response.data);
    } catch (err) {
      setError('Failed to fetch music by mood');
      console.error('Error fetching music by mood:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMusicByGenre = async (genre: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await musicAPI.getByGenre(genre);
      setMusic(response.data);
    } catch (err) {
      setError('Failed to fetch music by genre');
      console.error('Error fetching music by genre:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const searchMusic = async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await musicAPI.search(query);
      setMusic(response.data);
    } catch (err) {
      setError('Failed to search music');
      console.error('Error searching music:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createMusic = async (musicData: CreateMusicData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await musicAPI.create(musicData);
      setMusic(prev => [response.data.music, ...prev]);
    } catch (err) {
      setError('Failed to create music');
      console.error('Error creating music:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMusic = async (id: number, musicData: Partial<CreateMusicData>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await musicAPI.update(id, musicData);
      setMusic(prev => 
        prev.map(music => 
          music.id === id ? response.data.music : music
        )
      );
    } catch (err) {
      setError('Failed to update music');
      console.error('Error updating music:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMusic = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await musicAPI.delete(id);
      setMusic(prev => prev.filter(music => music.id !== id));
    } catch (err) {
      setError('Failed to delete music');
      console.error('Error deleting music:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    music,
    isLoading,
    error,
    fetchAllMusic,
    fetchMusicByMood,
    fetchMusicByGenre,
    searchMusic,
    createMusic,
    updateMusic,
    deleteMusic,
    clearError
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}; 