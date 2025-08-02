import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import OpenAIService, { MoodAnalysis, AIInsight, MoodPattern, MusicRecommendation } from '../services/OpenAIService';

interface Mood {
  id: number;
  mood: string;
  mood_intensity: number;
  note: string;
  current_song_id?: string;
  listening_context?: string;
  created_at: string;
}

interface MoodContextType {
  // Current mood state
  currentMood: Mood | null;
  moodHistory: Mood[];
  isLoading: boolean;
  
  // Mood logging
  logMood: (mood: string, intensity: number, note: string, currentSong?: any) => Promise<void>;
  updateMood: (moodId: number, updates: Partial<Mood>) => Promise<void>;
  deleteMood: (moodId: number) => Promise<void>;
  
  // AI analysis
  moodAnalysis: MoodAnalysis | null;
  isAnalyzing: boolean;
  analyzeCurrentMood: () => Promise<void>;
  
  // Music recommendations
  recommendations: MusicRecommendation[];
  getRecommendations: (mood: string) => Promise<void>;
  
  // Insights and patterns
  insights: AIInsight[];
  moodPatterns: MoodPattern | null;
  generateInsights: (type: 'weekly' | 'monthly') => Promise<void>;
  analyzePatterns: () => Promise<void>;
  
  // Statistics
  moodStats: {
    totalMoods: number;
    averageIntensity: number;
    mostCommonMood: string;
    moodTrend: string;
    daysTracked: number;
  };
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};

interface MoodProviderProps {
  children: ReactNode;
}

export const MoodProvider: React.FC<MoodProviderProps> = ({ children }) => {
  const [currentMood, setCurrentMood] = useState<Mood | null>(null);
  const [moodHistory, setMoodHistory] = useState<Mood[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [moodAnalysis, setMoodAnalysis] = useState<MoodAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [recommendations, setRecommendations] = useState<MusicRecommendation[]>([]);
  
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [moodPatterns, setMoodPatterns] = useState<MoodPattern | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  // Load mood history on mount
  useEffect(() => {
    loadMoodHistory();
  }, []);

  // Calculate mood statistics
  const moodStats = React.useMemo(() => {
    if (moodHistory.length === 0) {
      return {
        totalMoods: 0,
        averageIntensity: 0,
        mostCommonMood: 'None',
        moodTrend: 'No data',
        daysTracked: 0
      };
    }

    const moodFrequency: Record<string, number> = {};
    let totalIntensity = 0;
    const uniqueDays = new Set();

    moodHistory.forEach(mood => {
      moodFrequency[mood.mood] = (moodFrequency[mood.mood] || 0) + 1;
      totalIntensity += mood.mood_intensity;
      uniqueDays.add(new Date(mood.created_at).toDateString());
    });

    const mostCommonMood = Object.entries(moodFrequency)
      .sort(([,a], [,b]) => b - a)[0][0];

    const averageIntensity = totalIntensity / moodHistory.length;

    // Calculate mood trend (last 7 days vs previous 7 days)
    const lastWeek = moodHistory.filter(mood => 
      new Date(mood.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    const previousWeek = moodHistory.filter(mood => {
      const date = new Date(mood.created_at);
      return date <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && 
             date > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    });

    const lastWeekAvg = lastWeek.length > 0 ? 
      lastWeek.reduce((sum, mood) => sum + mood.mood_intensity, 0) / lastWeek.length : 0;
    const previousWeekAvg = previousWeek.length > 0 ? 
      previousWeek.reduce((sum, mood) => sum + mood.mood_intensity, 0) / previousWeek.length : 0;

    let moodTrend = 'Stable';
    if (lastWeekAvg > previousWeekAvg + 1) moodTrend = 'Improving';
    else if (lastWeekAvg < previousWeekAvg - 1) moodTrend = 'Declining';

    return {
      totalMoods: moodHistory.length,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
      mostCommonMood,
      moodTrend,
      daysTracked: uniqueDays.size
    };
  }, [moodHistory]);

  // Load mood history from API
  const loadMoodHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3001/api/moods', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMoodHistory(data);
      } else {
        setError('Failed to load mood history');
      }
    } catch (err) {
      setError('Failed to load mood history');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced mood logging with error handling
  const logMood = async (mood: string, intensity: number, note: string, currentSong?: any) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch('http://localhost:3001/api/moods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          mood,
          mood_intensity: intensity,
          note,
          current_song_id: currentSong?.id,
          listening_context: currentSong ? `${currentSong.name} by ${currentSong.artists[0].name}` : null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to log mood');
      }

      const newMood = await response.json();
      setMoodHistory(prev => [newMood, ...prev]);
      setCurrentMood(newMood);
      
      // Generate AI interpretation with fallback
      try {
        const interpretation = await OpenAIService.generateMoodInterpretation(
          mood, 
          intensity, 
          note, 
          currentSong, 
          moodHistory.slice(0, 5)
        );
        setMoodAnalysis({
          mood: mood,
          confidence: 0.8,
          reasoning: interpretation.interpretation,
          intensity: intensity,
          suggested_activities: interpretation.recommendations,
          music_recommendations: []
        });
      } catch (aiError) {
        console.error('AI interpretation failed:', aiError);
        setMoodAnalysis({
          mood: mood,
          confidence: 0.8,
          reasoning: `You logged feeling ${mood} with intensity ${intensity}/10.`,
          intensity: intensity,
          suggested_activities: [
            'Try listening to music that matches your mood',
            'Consider exploring new genres',
            'Take a moment to reflect on your feelings'
          ],
          music_recommendations: []
        });
      }

      // Update statistics
      // updateMoodStats(); // This function is not defined in the original file
    } catch (error) {
      console.error('Error logging mood:', error);
      setError('Failed to log mood. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update existing mood
  const updateMood = async (moodId: number, updates: Partial<Mood>) => {
    try {
      const response = await fetch(`http://localhost:3001/api/moods/${moodId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedMood = await response.json();
        setMoodHistory(prev => 
          prev.map(mood => mood.id === moodId ? updatedMood : mood)
        );
      } else {
        setError('Failed to update mood');
      }
    } catch (err) {
      setError('Failed to update mood');
    }
  };

  // Delete mood
  const deleteMood = async (moodId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/moods/${moodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMoodHistory(prev => prev.filter(mood => mood.id !== moodId));
      } else {
        setError('Failed to delete mood');
      }
    } catch (err) {
      setError('Failed to delete mood');
    }
  };

  // Analyze current mood with AI
  const analyzeCurrentMood = async () => {
    if (!currentMood) return;

    try {
      setIsAnalyzing(true);
      const analysis = await OpenAIService.analyzeMood(
        currentMood.mood,
        currentMood.note,
        currentMood.current_song_id ? { id: currentMood.current_song_id } : undefined
      );
      setMoodAnalysis(analysis);
    } catch (err) {
      setError('Failed to analyze mood');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Enhanced recommendations with fallback
  const getRecommendations = async (mood: string) => {
    try {
      setError(null);
      setIsLoading(true);

      // Try to get AI recommendations first
      try {
        // const aiRecommendations = await openAIService.getMoodBasedRecommendations(mood);
        // setRecommendations(aiRecommendations);
        setRecommendations([ // Placeholder recommendations
          {
            title: 'Uplifting Song',
            artist: 'Positive Vibes',
            reason: 'Perfect for your current mood',
            mood_match: mood,
            energy_level: 'high' as const,
            genre: 'Pop'
          },
          {
            title: 'Chill Vibes',
            artist: 'Relaxing Sounds',
            reason: 'Helps process your feelings',
            mood_match: mood,
            energy_level: 'low' as const,
            genre: 'Ambient'
          },
          {
            title: 'Energetic Beat',
            artist: 'High Energy',
            reason: 'Matches your mood intensity',
            mood_match: mood,
            energy_level: 'medium' as const,
            genre: 'Electronic'
          }
        ]);
      } catch (aiError) {
        console.error('AI recommendations failed:', aiError);
        
        // Fallback to Spotify recommendations
        try {
          // Assuming spotifyService is defined elsewhere or needs to be imported
          // For now, using a placeholder or removing if not available
          // const spotifyRecommendations = await spotifyService.getMoodBasedRecommendations(mood, 5);
          // setRecommendations(spotifyRecommendations);
          setRecommendations([ // Placeholder for Spotify recommendations
            {
              title: 'Uplifting Song',
              artist: 'Positive Vibes',
              reason: 'Perfect for your current mood',
              mood_match: mood,
              energy_level: 'high' as const,
              genre: 'Pop'
            },
            {
              title: 'Chill Vibes',
              artist: 'Relaxing Sounds',
              reason: 'Helps process your feelings',
              mood_match: mood,
              energy_level: 'low' as const,
              genre: 'Ambient'
            },
            {
              title: 'Energetic Beat',
              artist: 'High Energy',
              reason: 'Matches your mood intensity',
              mood_match: mood,
              energy_level: 'medium' as const,
              genre: 'Electronic'
            }
          ]);
        } catch (spotifyError) {
          console.error('Spotify recommendations failed:', spotifyError);
          
          // Final fallback to mock recommendations
          setRecommendations([
            {
              title: 'Uplifting Song',
              artist: 'Positive Vibes',
              reason: 'Perfect for your current mood',
              mood_match: mood,
              energy_level: 'high' as const,
              genre: 'Pop'
            },
            {
              title: 'Chill Vibes',
              artist: 'Relaxing Sounds',
              reason: 'Helps process your feelings',
              mood_match: mood,
              energy_level: 'low' as const,
              genre: 'Ambient'
            },
            {
              title: 'Energetic Beat',
              artist: 'High Energy',
              reason: 'Matches your mood intensity',
              mood_match: mood,
              energy_level: 'medium' as const,
              genre: 'Electronic'
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setError('Unable to load recommendations. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate insights
  const generateInsights = async (type: 'weekly' | 'monthly') => {
    try {
      const insight = await OpenAIService.generateMoodInsights(
        moodHistory,
        [], // listening history would be passed here
        type
      );
      setInsights(prev => [insight, ...prev]);
    } catch (err) {
      setError('Failed to generate insights');
    }
  };

  // Analyze mood patterns
  const analyzePatterns = async () => {
    try {
      const patterns = await OpenAIService.analyzeMoodPatterns(moodHistory);
      setMoodPatterns(patterns);
    } catch (err) {
      setError('Failed to analyze patterns');
    }
  };

  const clearError = () => setError(null);

  const value: MoodContextType = {
    currentMood,
    moodHistory,
    isLoading,
    logMood,
    updateMood,
    deleteMood,
    moodAnalysis,
    isAnalyzing,
    analyzeCurrentMood,
    recommendations,
    getRecommendations,
    insights,
    moodPatterns,
    generateInsights,
    analyzePatterns,
    moodStats,
    error,
    clearError
  };

  return (
    <MoodContext.Provider value={value}>
      {children}
    </MoodContext.Provider>
  );
}; 