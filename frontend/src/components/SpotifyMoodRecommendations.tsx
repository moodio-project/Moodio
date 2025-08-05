// Replace your AIRecommendations.tsx with this Spotify-only version

import React, { useState, useEffect } from 'react';
import { spotify, moods as moodsApi } from '../api';

interface SpotifyMoodRecommendationsProps {
  user: any;
}

const SpotifyMoodRecommendations: React.FC<SpotifyMoodRecommendationsProps> = ({ user }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [userMoods, setUserMoods] = useState<any[]>([]);
  const [moodInsights, setMoodInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentMoodFilter, setCurrentMoodFilter] = useState<string>('');

  useEffect(() => {
    loadMoodBasedRecommendations();
  }, []);

  const loadMoodBasedRecommendations = async () => {
    setLoading(true);
    try {
      // Get user's mood history
      const moodResponse = await moodsApi.getAll() as any;
      const moods = moodResponse.moods || [];
      setUserMoods(moods);

      // Analyze mood patterns
      const moodAnalysis = analyzeMoodPatterns(moods);
      setMoodInsights(moodAnalysis);

      // Get recommendations based on dominant mood
      if (moodAnalysis.dominantMood) {
        const recs = await getSpotifyMoodRecommendations(moodAnalysis.dominantMood);
        setRecommendations(recs);
        setCurrentMoodFilter(moodAnalysis.dominantMood);
      } else {
        // Default recommendations if no mood data
        const defaultRecs = await getSpotifyMoodRecommendations('happy');
        setRecommendations(defaultRecs);
        setCurrentMoodFilter('happy');
      }

    } catch (error) {
      console.error('Failed to load mood recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeMoodPatterns = (moods: any[]) => {
    if (!moods.length) {
      return { 
        dominantMood: null, 
        averageIntensity: 0, 
        totalLogs: 0,
        moodCounts: {},
        insight: "Start logging your moods to get personalized recommendations!"
      };
    }

    const moodCounts: { [key: string]: number } = {};
    let totalIntensity = 0;

    moods.forEach((mood: any) => {
      moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
      totalIntensity += mood.intensity;
    });

    const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b
    );

    const averageIntensity = totalIntensity / moods.length;

    // Generate insight based on mood patterns
    const recentMoods = moods.slice(0, 5).map(m => m.mood);
    const moodVariety = Object.keys(moodCounts).length;
    
    let insight = `You've been feeling mostly ${dominantMood} lately`;
    if (averageIntensity > 7) {
      insight += " with high intensity. ";
    } else if (averageIntensity < 4) {
      insight += " with gentle intensity. ";
    } else {
      insight += " with moderate intensity. ";
    }

    if (moodVariety > 4) {
      insight += "You experience a rich variety of emotions!";
    } else if (moodVariety < 3) {
      insight += "Your emotions tend to be consistent.";
    }

    return {
      dominantMood,
      averageIntensity: Number(averageIntensity.toFixed(1)),
      totalLogs: moods.length,
      moodCounts,
      insight,
      recentMoods: recentMoods.slice(0, 3)
    };
  };

  const getSpotifyMoodRecommendations = async (mood: string) => {
    try {
      console.log('🎵 Getting recommendations for mood:', mood);
      
      // Skip the broken backend endpoint entirely
      const moodSearchTerms: { [key: string]: string[] } = {
        happy: ['upbeat pop', 'feel good music', 'happy songs', 'uplifting music'],
        sad: ['sad songs', 'melancholy music', 'emotional ballads', 'heartbreak songs'],
        energetic: ['workout music', 'high energy', 'pump up songs', 'dance music'],
        calm: ['chill music', 'relaxing songs', 'ambient music', 'peaceful music'],
        excited: ['party music', 'celebration songs', 'exciting music', 'hype music'],
        anxious: ['calming music', 'stress relief', 'meditation music', 'soothing songs'],
        peaceful: ['zen music', 'tranquil sounds', 'peaceful songs', 'nature sounds']
      };
      
      // Get random search term for variety
      const searchTerms = moodSearchTerms[mood] || moodSearchTerms.happy;
      const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      
      console.log('🎵 Searching for:', randomTerm);
      const searchResult = await spotify.search(randomTerm, 'track', 12) as any;
      console.log('🎵 Search result:', searchResult);
      
      if (searchResult.tracks?.items?.length > 0) {
        // Shuffle the results for variety
        const shuffled = [...searchResult.tracks.items].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 8);
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ Failed to get recommendations:', error);
      return [];
    }
  };

  const playTrack = (trackUri: string, trackName: string) => {
    if ((window as any).moodioPlayTrack) {
      (window as any).moodioPlayTrack(trackUri);
      console.log('🎵 Playing mood-based track:', trackName);
    } else {
      alert('Music player not ready. Please wait a moment and try again.');
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getMoodEmoji = (mood: string) => {
    const emojis: { [key: string]: string } = {
      happy: '😊', sad: '😢', excited: '🤩', calm: '😌',
      anxious: '😰', angry: '😠', energetic: '⚡', tired: '😴'
    };
    return emojis[mood] || '🎵';
  };

  const getMoodColor = (mood: string) => {
    const colors: { [key: string]: string } = {
      happy: '#22C55E', sad: '#60A5FA', excited: '#F472B6',
      calm: '#A78BFA', anxious: '#FBBF24', angry: '#EF4444',
      energetic: '#F59E0B', tired: '#8B5CF6'
    };
    return colors[mood] || '#22C55E';
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #333',
            borderTop: '3px solid #22C55E',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#B3B3B3', margin: 0 }}>Analyzing your mood patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      
      {/* Mood Insights Card */}
      {moodInsights && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ fontSize: '24px' }}>📊</div>
            <h2 style={{ color: 'white', margin: 0, fontSize: '20px' }}>
              Your Mood Insights
            </h2>
            <div style={{
              background: 'linear-gradient(135deg, #22C55E, #16A34A)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              POWERED BY SPOTIFY
            </div>
          </div>
          
          <div style={{
            background: `linear-gradient(135deg, ${getMoodColor(moodInsights.dominantMood)}20, ${getMoodColor(moodInsights.dominantMood)}10)`,
            padding: '20px',
            borderRadius: '12px',
            border: `1px solid ${getMoodColor(moodInsights.dominantMood)}40`,
            marginBottom: '16px'
          }}>
            <p style={{ 
              color: '#E5E7EB', 
              fontSize: '16px', 
              lineHeight: '1.6',
              margin: 0,
              fontStyle: 'italic'
            }}>
              "{moodInsights.insight}"
            </p>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: getMoodColor(moodInsights.dominantMood),
                textTransform: 'capitalize',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}>
                {getMoodEmoji(moodInsights.dominantMood)} {moodInsights.dominantMood}
              </div>
              <p style={{ color: '#B3B3B3', fontSize: '12px', margin: 0 }}>
                Dominant mood
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#A78BFA' }}>
                {moodInsights.averageIntensity}/10
              </div>
              <p style={{ color: '#B3B3B3', fontSize: '12px', margin: 0 }}>
                Average intensity
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#F472B6' }}>
                {moodInsights.totalLogs}
              </div>
              <p style={{ color: '#B3B3B3', fontSize: '12px', margin: 0 }}>
                Total mood logs
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mood-Based Recommendations */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ fontSize: '24px' }}>🎯</div>
          <h2 style={{ color: 'white', margin: 0, fontSize: '20px' }}>
          Songs For Your {currentMoodFilter.charAt(0).toUpperCase() + currentMoodFilter.slice(1)} Mood
          </h2>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#B3B3B3', fontSize: '14px', margin: '0 0 16px 0' }}>
            Based on your mood patterns, here are songs that match your {currentMoodFilter} vibe:
          </p>
          
          {/* Mood Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {['happy', 'sad', 'excited', 'calm', 'energetic'].map((mood) => (
              <button
                key={mood}
                onClick={async () => {
                  setLoading(true);
                  try {
                    const recs = await getSpotifyMoodRecommendations(mood);
                    setRecommendations(recs);
                    setCurrentMoodFilter(mood);
                  } catch (error) {
                    console.error('Failed to load recommendations:', error);
                    // Fallback to direct search if API fails
                    const fallbackSearch = await spotify.search(`${mood} music`, 'track', 8) as any;
                    setRecommendations(fallbackSearch.tracks?.items || []);
                    setCurrentMoodFilter(mood);
                  }
                  setLoading(false);
                }}
                style={{
                  background: currentMoodFilter === mood ? getMoodColor(mood) : 'rgba(255,255,255,0.1)',
                  color: currentMoodFilter === mood ? 'white' : '#B3B3B3',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {getMoodEmoji(mood)} {mood}
              </button>
            ))}
          </div>
        </div>

        {/* Recommended Tracks */}
        {recommendations.length > 0 ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            {recommendations.slice(0, 8).map((track: any) => (
              <div
                key={track.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px',
                  background: '#181818',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#282828'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#181818'}
              >
                <img
                  src={track.album?.images?.[0]?.url}
                  alt={track.album?.name}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '4px',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '14px' }}>
                    {track.name}
                  </h4>
                  <p style={{ color: '#B3B3B3', margin: 0, fontSize: '12px' }}>
                    {track.artists?.[0]?.name} • {formatDuration(track.duration_ms || 180000)}
                  </p>
                </div>
                <div style={{
                  background: `${getMoodColor(currentMoodFilter)}20`,
                  color: getMoodColor(currentMoodFilter),
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: '600'
                }}>
                  {getMoodEmoji(currentMoodFilter)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playTrack(track.uri, track.name);
                  }}
                  style={{
                    background: getMoodColor(currentMoodFilter),
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ▶️
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#B3B3B3', textAlign: 'center', padding: '32px' }}>
            No recommendations available. Try logging some moods first!
          </p>
        )}

        <button
          onClick={loadMoodBasedRecommendations}
          style={{
            background: 'linear-gradient(135deg, #22C55E, #16A34A)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '20px'
          }}
        >
          🔄 Refresh Recommendations
        </button>
      </div>
      
    </div>
  );
};

export default SpotifyMoodRecommendations;