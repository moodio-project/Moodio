import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface MoodAnalysisResult {
  mood: string;
  confidence: number;
  reasoning: string;
}

interface SongRecommendation {
  title: string;
  artist: string;
  reason: string;
  mood_match: string;
}

class OpenAIClient {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    try {
      const response = await axios.post(`${this.baseURL}${endpoint}`, data, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`OpenAI API request failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async analyzeMood(description: string, intensity: number): Promise<MoodAnalysisResult> {
    const prompt = `
      Analyze the following mood description and intensity level:
      Description: "${description}"
      Intensity: ${intensity}/10
      
      Please categorize this into one of these mood types: happy, sad, angry, calm, excited, anxious, melancholy, energetic
      
      Respond with a JSON object in this exact format:
      {
        "mood": "mood_type",
        "confidence": 0.95,
        "reasoning": "Brief explanation of why this mood was chosen"
      }
    `;

    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a mood analysis AI. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.3
    });

    try {
      const content = response.choices[0].message.content;
      const result = JSON.parse(content);
      return result as MoodAnalysisResult;
    } catch (error) {
      throw new Error('Failed to parse OpenAI response for mood analysis');
    }
  }

  async getSongRecommendations(mood: string, limit: number = 5): Promise<SongRecommendation[]> {
    const prompt = `
      Recommend ${limit} songs that match the mood: "${mood}"
      
      For each song, provide:
      - A popular, well-known song title
      - The artist name
      - A brief reason why it matches the mood
      - The mood it matches (should be "${mood}")
      
      Respond with a JSON array in this exact format:
      [
        {
          "title": "Song Title",
          "artist": "Artist Name",
          "reason": "Brief explanation of why this song matches the mood",
          "mood_match": "${mood}"
        }
      ]
    `;

    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a music recommendation AI. Always respond with valid JSON arrays.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    try {
      const content = response.choices[0].message.content;
      const result = JSON.parse(content);
      return result as SongRecommendation[];
    } catch (error) {
      throw new Error('Failed to parse OpenAI response for song recommendations');
    }
  }

  async getSmartRecommendations(userMoodHistory: any[], currentMood: string): Promise<SongRecommendation[]> {
    const moodHistory = userMoodHistory.slice(-5).map(mood => `${mood.mood_type} (${mood.intensity}/10)`).join(', ');
    
    const prompt = `
      Based on the user's recent mood history and current mood, recommend 3 songs:
      
      Recent mood history: ${moodHistory}
      Current mood: ${currentMood}
      
      Consider:
      1. Songs that match the current mood
      2. Songs that might help improve the mood if it's negative
      3. Songs that complement the mood pattern
      
      Respond with a JSON array in this exact format:
      [
        {
          "title": "Song Title",
          "artist": "Artist Name",
          "reason": "Detailed explanation of why this song was recommended",
          "mood_match": "target_mood"
        }
      ]
    `;

    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an intelligent music recommendation AI that considers user mood patterns.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 600,
      temperature: 0.8
    });

    try {
      const content = response.choices[0].message.content;
      const result = JSON.parse(content);
      return result as SongRecommendation[];
    } catch (error) {
      throw new Error('Failed to parse OpenAI response for smart recommendations');
    }
  }
}

export const openAiClient = new OpenAIClient(); 