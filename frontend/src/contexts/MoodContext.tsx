import React, { createContext, useContext, useState, ReactNode } from 'react';
import { moodAPI } from '../adapters/api';

interface Mood {
  id: number;
  user_id: number;
  mood_type: string;
  intensity: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface CreateMoodData {
  user_id: number;
  mood_type: string;
  intensity: number;
  description?: string;
}

interface MoodContextType {
  moods: Mood[];
  isLoading: boolean;
  error: string | null;
  fetchMoods: (userId: number) => Promise<void>;
  createMood: (moodData: CreateMoodData) => Promise<void>;
  updateMood: (id: number, moodData: Partial<CreateMoodData>) => Promise<void>;
  deleteMood: (id: number) => Promise<void>;
  clearError: () => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const useMood = () => {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};

interface MoodProviderProps {
  children: ReactNode;
}

export const MoodProvider: React.FC<MoodProviderProps> = ({ children }) => {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMoods = async (userId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await moodAPI.getByUserId(userId);
      setMoods(response.data);
    } catch (err) {
      setError('Failed to fetch moods');
      console.error('Error fetching moods:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createMood = async (moodData: CreateMoodData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await moodAPI.create(moodData);
      setMoods(prev => [response.data.mood, ...prev]);
    } catch (err) {
      setError('Failed to create mood');
      console.error('Error creating mood:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMood = async (id: number, moodData: Partial<CreateMoodData>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await moodAPI.update(id, moodData);
      setMoods(prev => 
        prev.map(mood => 
          mood.id === id ? response.data.mood : mood
        )
      );
    } catch (err) {
      setError('Failed to update mood');
      console.error('Error updating mood:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMood = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await moodAPI.delete(id);
      setMoods(prev => prev.filter(mood => mood.id !== id));
    } catch (err) {
      setError('Failed to delete mood');
      console.error('Error deleting mood:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    moods,
    isLoading,
    error,
    fetchMoods,
    createMood,
    updateMood,
    deleteMood,
    clearError
  };

  return (
    <MoodContext.Provider value={value}>
      {children}
    </MoodContext.Provider>
  );
}; 