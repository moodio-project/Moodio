export interface MoodAnalysis {
  mood: string;
  confidence: number;
  reasoning: string;
  intensity: number;
  suggested_activities: string[];
  music_recommendations: MusicRecommendation[];
}

export interface MusicRecommendation {
  title: string;
  artist: string;
  reason: string;
  mood_match: string;
  energy_level: 'low' | 'medium' | 'high';
  genre: string;
  spotify_id?: string;
}

export interface AIInsight {
  type: 'weekly_summary' | 'monthly_summary' | 'mood_pattern' | 'music_correlation';
  title: string;
  content: string;
  data: any;
  generated_at: string;
}

export interface MoodPattern {
  dominant_mood: string;
  mood_frequency: Record<string, number>;
  average_intensity: number;
  common_triggers: string[];
  music_preferences: string[];
  recommendations: string[];
}

class OpenAIService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
  }

  // Analyze mood from user input
  async analyzeMood(mood: string, note: string, currentSong?: any): Promise<MoodAnalysis> {
    if (!this.apiKey) {
      // Fallback to mock analysis
      return this.getMockMoodAnalysis(mood, note);
    }

    try {
      const prompt = `
        Analyze the user's mood based on the following information:
        - Selected mood: ${mood}
        - User note: ${note}
        ${currentSong ? `- Currently listening to: ${currentSong.name} by ${currentSong.artists[0].name}` : ''}
        
        Provide a detailed analysis including:
        1. Confirmed mood with confidence level (0-1)
        2. Reasoning for the mood assessment
        3. Mood intensity (1-10)
        4. Suggested activities for this mood
        5. Music recommendations that would complement this mood
        
        Format the response as JSON with the following structure:
        {
          "mood": "confirmed_mood",
          "confidence": 0.95,
          "reasoning": "detailed explanation",
          "intensity": 7,
          "suggested_activities": ["activity1", "activity2"],
          "music_recommendations": [
            {
              "title": "Song Title",
              "artist": "Artist Name",
              "reason": "Why this song fits the mood",
              "mood_match": "mood_category",
              "energy_level": "medium",
              "genre": "genre"
            }
          ]
        }
      `;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a music and mood analysis expert. Provide detailed, empathetic analysis of user moods and suggest appropriate music recommendations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI API request failed');
      }

      const data = await response.json();
      const analysisText = data.choices[0].message.content;
      
      try {
        return JSON.parse(analysisText);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        return this.getMockMoodAnalysis(mood, note);
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getMockMoodAnalysis(mood, note);
    }
  }

  // Generate personalized music recommendations
  async getPersonalizedRecommendations(
    userMood: string,
    listeningHistory: any[],
    favoriteGenres: string[],
    currentSong?: any
  ): Promise<MusicRecommendation[]> {
    if (!this.apiKey) {
      return this.getMockRecommendations(userMood);
    }

    try {
      const prompt = `
        Based on the user's current mood (${userMood}) and their music preferences, suggest personalized music recommendations.
        
        User context:
        - Current mood: ${userMood}
        - Recent listening history: ${listeningHistory.slice(0, 5).map(song => `${song.name} by ${song.artist}`).join(', ')}
        - Favorite genres: ${favoriteGenres.join(', ')}
        ${currentSong ? `- Currently playing: ${currentSong.name} by ${currentSong.artist}` : ''}
        
        Provide 5-8 music recommendations that:
        1. Match the current mood
        2. Consider the user's listening history
        3. Include variety in genres and energy levels
        4. Provide specific reasons for each recommendation
        
        Format as JSON array:
        [
          {
            "title": "Song Title",
            "artist": "Artist Name",
            "reason": "Specific reason this song fits",
            "mood_match": "mood_category",
            "energy_level": "low/medium/high",
            "genre": "genre"
          }
        ]
      `;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a music recommendation expert. Suggest songs that match the user\'s mood and preferences.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI API request failed');
      }

      const data = await response.json();
      const recommendationsText = data.choices[0].message.content;
      
      try {
        return JSON.parse(recommendationsText);
      } catch (parseError) {
        console.error('Failed to parse recommendations:', parseError);
        return this.getMockRecommendations(userMood);
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getMockRecommendations(userMood);
    }
  }

  // Generate weekly/monthly mood insights
  async generateMoodInsights(
    moodHistory: any[],
    listeningHistory: any[],
    insightType: 'weekly' | 'monthly'
  ): Promise<AIInsight> {
    if (!this.apiKey) {
      return this.getMockMoodInsight(moodHistory, insightType);
    }

    try {
      const prompt = `
        Analyze the user's ${insightType} mood and music patterns to generate insights.
        
        Mood history: ${JSON.stringify(moodHistory.slice(-10))}
        Listening history: ${JSON.stringify(listeningHistory.slice(-20))}
        
        Generate a comprehensive insight that includes:
        1. Overall mood trend
        2. Most common moods and their frequency
        3. Music listening patterns
        4. Correlation between moods and music choices
        5. Personalized recommendations for improvement
        6. Interesting patterns or discoveries
        
        Format as JSON:
        {
          "type": "${insightType}_summary",
          "title": "Insightful title",
          "content": "Detailed analysis in markdown format",
          "data": {
            "mood_trend": "trend_description",
            "top_moods": ["mood1", "mood2"],
            "music_correlations": ["correlation1", "correlation2"],
            "recommendations": ["rec1", "rec2"]
          },
          "generated_at": "timestamp"
        }
      `;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a mood and music analytics expert. Generate insightful analysis of user patterns.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1200
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI API request failed');
      }

      const data = await response.json();
      const insightText = data.choices[0].message.content;
      
      try {
        return JSON.parse(insightText);
      } catch (parseError) {
        console.error('Failed to parse insight:', parseError);
        return this.getMockMoodInsight(moodHistory, insightType);
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getMockMoodInsight(moodHistory, insightType);
    }
  }

  // Analyze mood patterns over time
  async analyzeMoodPatterns(moodHistory: any[]): Promise<MoodPattern> {
    if (!this.apiKey) {
      return this.getMockMoodPattern(moodHistory);
    }

    try {
      const prompt = `
        Analyze the user's mood patterns over time:
        ${JSON.stringify(moodHistory)}
        
        Identify:
        1. Dominant mood patterns
        2. Mood frequency distribution
        3. Average mood intensity
        4. Common triggers or contexts
        5. Music preferences by mood
        6. Recommendations for mood improvement
        
        Format as JSON:
        {
          "dominant_mood": "most_common_mood",
          "mood_frequency": {"mood1": 5, "mood2": 3},
          "average_intensity": 6.5,
          "common_triggers": ["trigger1", "trigger2"],
          "music_preferences": ["genre1", "genre2"],
          "recommendations": ["rec1", "rec2"]
        }
      `;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a mood pattern analysis expert. Identify trends and provide insights.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.6,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI API request failed');
      }

      const data = await response.json();
      const patternText = data.choices[0].message.content;
      
      try {
        return JSON.parse(patternText);
      } catch (parseError) {
        console.error('Failed to parse mood pattern:', parseError);
        return this.getMockMoodPattern(moodHistory);
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getMockMoodPattern(moodHistory);
    }
  }

  // Generate AI-powered mood interpretation with music context
  async generateMoodInterpretation(
    mood: string,
    intensity: number,
    note: string,
    currentSong?: any,
    recentMoods: any[] = []
  ): Promise<{
    interpretation: string;
    musicInsights: string;
    recommendations: string[];
    moodTrend: string;
  }> {
    if (!this.apiKey) {
      return this.getMockMoodInterpretation(mood, intensity, note, currentSong);
    }

    try {
      const prompt = `
        Analyze the user's mood and provide a comprehensive interpretation with music insights.
        
        Current Mood Data:
        - Mood: ${mood}
        - Intensity: ${intensity}/10
        - Note: ${note}
        ${currentSong ? `- Currently listening to: ${currentSong.name} by ${currentSong.artists[0].name}` : ''}
        - Recent moods: ${recentMoods.slice(-5).map(m => `${m.mood}(${m.mood_intensity}/10)`).join(', ')}
        
        Provide a response in JSON format with:
        1. interpretation: A detailed analysis of their emotional state
        2. musicInsights: How their music choices relate to their mood
        3. recommendations: 3 specific activities or music suggestions
        4. moodTrend: Brief trend analysis (improving, stable, declining)
        
        Format as JSON:
        {
          "interpretation": "detailed mood analysis",
          "musicInsights": "music-mood correlation insights",
          "recommendations": ["rec1", "rec2", "rec3"],
          "moodTrend": "trend description"
        }
      `;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a music and mood analysis expert. Provide empathetic, insightful analysis that helps users understand their emotional patterns and music preferences.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI API request failed');
      }

      const data = await response.json();
      const interpretationText = data.choices[0].message.content;
      
      try {
        return JSON.parse(interpretationText);
      } catch (parseError) {
        console.error('Failed to parse mood interpretation:', parseError);
        return this.getMockMoodInterpretation(mood, intensity, note, currentSong);
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getMockMoodInterpretation(mood, intensity, note, currentSong);
    }
  }

  // Generate "Spotify Wrapped" style insights
  async generateSpotifyWrappedInsights(
    moodHistory: any[],
    listeningHistory: any[],
    timeRange: 'week' | 'month' = 'week'
  ): Promise<{
    title: string;
    summary: string;
    topMood: string;
    moodFrequency: Record<string, number>;
    musicCorrelations: string[];
    recommendations: string[];
  }> {
    if (!this.apiKey) {
      return this.getMockSpotifyWrappedInsights(moodHistory, listeningHistory, timeRange);
    }

    try {
      const prompt = `
        Generate "Spotify Wrapped" style insights for the user's mood and music patterns.
        
        Data:
        - Mood history: ${JSON.stringify(moodHistory.slice(-20))}
        - Listening history: ${JSON.stringify(listeningHistory.slice(-30))}
        - Time range: ${timeRange}
        
        Create insights in JSON format:
        {
          "title": "Catchy title for the insights",
          "summary": "Overall mood and music summary",
          "topMood": "most common mood",
          "moodFrequency": {"mood1": 5, "mood2": 3},
          "musicCorrelations": ["correlation1", "correlation2"],
          "recommendations": ["rec1", "rec2", "rec3"]
        }
      `;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a music analytics expert. Create engaging, personalized insights similar to Spotify Wrapped.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI API request failed');
      }

      const data = await response.json();
      const insightsText = data.choices[0].message.content;
      
      try {
        return JSON.parse(insightsText);
      } catch (parseError) {
        console.error('Failed to parse Spotify Wrapped insights:', parseError);
        return this.getMockSpotifyWrappedInsights(moodHistory, listeningHistory, timeRange);
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getMockSpotifyWrappedInsights(moodHistory, listeningHistory, timeRange);
    }
  }

  // Mock methods for fallback
  private getMockMoodAnalysis(mood: string, note: string): MoodAnalysis {
    const moodRecommendations: Record<string, MusicRecommendation[]> = {
      happy: [
        { title: 'Happy', artist: 'Pharrell Williams', reason: 'Perfect for a happy mood', mood_match: 'happy', energy_level: 'high', genre: 'Pop' },
        { title: 'Good Vibrations', artist: 'The Beach Boys', reason: 'Uplifting and positive', mood_match: 'happy', energy_level: 'high', genre: 'Rock' }
      ],
      sad: [
        { title: 'Mad World', artist: 'Gary Jules', reason: 'Melancholic and reflective', mood_match: 'sad', energy_level: 'low', genre: 'Alternative' },
        { title: 'Hallelujah', artist: 'Jeff Buckley', reason: 'Emotional and cathartic', mood_match: 'sad', energy_level: 'low', genre: 'Folk' }
      ],
      calm: [
        { title: 'Weightless', artist: 'Marconi Union', reason: 'Scientifically proven to reduce anxiety', mood_match: 'calm', energy_level: 'low', genre: 'Ambient' },
        { title: 'Claire de Lune', artist: 'Debussy', reason: 'Peaceful and serene', mood_match: 'calm', energy_level: 'low', genre: 'Classical' }
      ]
    };

    return {
      mood,
      confidence: 0.9,
      reasoning: `Based on your input, you're feeling ${mood}. ${note ? `Your note "${note}" provides additional context.` : ''}`,
      intensity: 7,
      suggested_activities: ['Listen to music', 'Take a walk', 'Practice mindfulness'],
      music_recommendations: moodRecommendations[mood.toLowerCase()] || moodRecommendations.happy
    };
  }

  private getMockRecommendations(mood: string): MusicRecommendation[] {
    const recommendations: Record<string, MusicRecommendation[]> = {
      happy: [
        { title: 'Walking on Sunshine', artist: 'Katrina & The Waves', reason: 'Energetic and joyful', mood_match: 'happy', energy_level: 'high', genre: 'Pop' },
        { title: 'Don\'t Stop Believin\'', artist: 'Journey', reason: 'Inspiring and motivational', mood_match: 'happy', energy_level: 'high', genre: 'Rock' }
      ],
      sad: [
        { title: 'Fix You', artist: 'Coldplay', reason: 'Comforting and healing', mood_match: 'sad', energy_level: 'medium', genre: 'Alternative' },
        { title: 'The Scientist', artist: 'Coldplay', reason: 'Thoughtful and introspective', mood_match: 'sad', energy_level: 'low', genre: 'Alternative' }
      ],
      calm: [
        { title: 'River Flows in You', artist: 'Yiruma', reason: 'Gentle and flowing', mood_match: 'calm', energy_level: 'low', genre: 'Piano' },
        { title: 'Comptine d\'un autre été', artist: 'Yann Tiersen', reason: 'Delicate and calming', mood_match: 'calm', energy_level: 'low', genre: 'Classical' }
      ]
    };

    return recommendations[mood.toLowerCase()] || recommendations.happy;
  }

  private getMockMoodInsight(_moodHistory: any[], insightType: 'weekly' | 'monthly'): AIInsight {
    return {
      type: `${insightType}_summary`,
      title: `${insightType.charAt(0).toUpperCase() + insightType.slice(1)} Mood Summary`,
      content: `Your ${insightType} mood analysis shows a balanced emotional state with moments of joy and reflection.`,
      data: {
        mood_trend: 'Stable with positive moments',
        top_moods: ['happy', 'calm'],
        music_correlations: ['Upbeat music when happy', 'Calm music when relaxed'],
        recommendations: ['Continue listening to uplifting music', 'Try new genres for variety']
      },
      generated_at: new Date().toISOString()
    };
  }

  private getMockMoodPattern(_moodHistory: any[]): MoodPattern {
    return {
      dominant_mood: 'happy',
      mood_frequency: { happy: 5, calm: 3, sad: 1 },
      average_intensity: 6.5,
      common_triggers: ['Music listening', 'Work stress', 'Social interactions'],
      music_preferences: ['Pop', 'Rock', 'Alternative'],
      recommendations: ['Listen to more upbeat music', 'Try new artists', 'Create mood-based playlists']
    };
  }

  private getMockMoodInterpretation(mood: string, intensity: number, note: string, currentSong?: any) {
    return {
      interpretation: `You're feeling ${mood} with an intensity of ${intensity}/10. ${note ? `Your note "${note}" provides additional context about your emotional state.` : ''} This mood suggests you're in a ${intensity > 7 ? 'strong' : intensity > 4 ? 'moderate' : 'mild'} emotional state.`,
      musicInsights: currentSong ? `You're currently listening to "${currentSong.name}" by ${currentSong.artists[0].name}, which ${mood === 'happy' ? 'complements your positive mood' : mood === 'sad' ? 'might be providing comfort' : 'seems to match your current energy'}.` : 'Your music choices can help enhance or process your current mood.',
      recommendations: [
        'Try listening to music that matches your mood intensity',
        'Consider exploring new genres that align with your emotional state',
        'Take a moment to reflect on what music helps you feel better'
      ],
      moodTrend: intensity > 7 ? 'Strong emotional expression' : intensity > 4 ? 'Balanced emotional state' : 'Gentle emotional awareness'
    };
  }

  private getMockSpotifyWrappedInsights(moodHistory: any[], _listeningHistory: any[], timeRange: 'week' | 'month') {
    const moodFrequency: Record<string, number> = {};
    moodHistory.forEach(mood => {
      moodFrequency[mood.mood] = (moodFrequency[mood.mood] || 0) + 1;
    });

    const topMood = Object.entries(moodFrequency)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'balanced';

    return {
      title: `Your ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} in Music & Mood`,
      summary: `You've been tracking your moods for ${moodHistory.length} entries this ${timeRange}. Your most common mood was ${topMood}, showing a pattern of emotional awareness.`,
      topMood,
      moodFrequency,
      musicCorrelations: [
        'You tend to listen to upbeat music when feeling happy',
        'Calm music helps you process difficult emotions',
        'Your music choices often reflect your current mood intensity'
      ],
      recommendations: [
        'Try exploring new artists that match your mood patterns',
        'Create playlists for different emotional states',
        'Use music as a tool for emotional processing and growth'
      ]
    };
  }
}

export default new OpenAIService(); 