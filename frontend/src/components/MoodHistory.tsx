import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { moods } from '../api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface Mood {
  id: number;
  mood: string;
  intensity: number;
  note: string;
  created_at: string;
}

interface MoodHistoryProps {
  user: User;
  onLogout: () => void;
}

const MoodHistory: React.FC<MoodHistoryProps> = ({ user, onLogout }) => {
  const [userMoods, setUserMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMoods();
  }, []);

  const loadMoods = async () => {
    try {
      const response: any = await moods.getAll();
      setUserMoods(response.moods);
    } catch (error) {
      console.error('Failed to load moods:', error);
    } finally {
      setLoading(false);
    }
  };

  const moodEmojis: { [key: string]: string } = {
    happy: '😊',
    sad: '😢',
    excited: '🤩',
    calm: '😌',
    anxious: '😰',
    angry: '😠',
    energetic: '⚡',
    tired: '😴'
  };

  const groupMoodsByDate = (moods: Mood[]) => {
    const grouped: { [key: string]: Mood[] } = {};
    moods.forEach(mood => {
      const date = new Date(mood.created_at).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(mood);
    });
    return grouped;
  };

  const groupedMoods = groupMoodsByDate(userMoods);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#121212' }}>
      <Navigation user={user} currentPage="mood-history" onLogout={onLogout} />
      
      <div style={{ 
        marginLeft: '240px', 
        flex: 1, 
        padding: '32px',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: 'white', fontSize: '32px', margin: '0 0 8px 0' }}>
            Your Mood Journey 📊
          </h1>
          <p style={{ color: '#B3B3B3', margin: 0 }}>
            Track your emotional patterns over time
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
            <p style={{ color: '#B3B3B3' }}>Loading your mood history...</p>
          </div>
        ) : userMoods.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '64px' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>😊</div>
            <h2 style={{ color: 'white', marginBottom: '16px' }}>No moods logged yet</h2>
            <p style={{ color: '#B3B3B3', marginBottom: '24px' }}>
              Start tracking your emotions to see patterns over time
            </p>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="btn-primary"
            >
              Log Your First Mood
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '24px' }}>
            {Object.entries(groupedMoods)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, dayMoods]) => (
                <div key={date} className="card">
                  <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '18px' }}>
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {dayMoods
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((mood) => (
                        <div 
                          key={mood.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            background: '#181818',
                            borderRadius: '8px',
                            padding: '16px',
                            border: '1px solid #282828'
                          }}
                        >
                          <span style={{ fontSize: '32px' }}>
                            {moodEmojis[mood.mood] || '😊'}
                          </span>
                          
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <h4 style={{ color: 'white', margin: 0, textTransform: 'capitalize', fontSize: '16px' }}>
                                {mood.mood}
                              </h4>
                              
                              <div style={{
                                background: mood.intensity >= 8 ? '#FF6B6B' : 
                                           mood.intensity >= 6 ? '#4ECDC4' : 
                                           mood.intensity >= 4 ? '#45B7D1' : '#96CEB4',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                {mood.intensity}/10
                              </div>
                              
                              <span style={{ color: '#535353', fontSize: '12px' }}>
                                {new Date(mood.created_at).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            
                            {mood.note && (
                              <p style={{ color: '#B3B3B3', margin: 0, fontSize: '14px', fontStyle: 'italic' }}>
                                "{mood.note}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodHistory;