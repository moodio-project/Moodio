import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { useNavigate } from 'react-router-dom';
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
  song_name?: string;  // NEW - optional song data
  artist_name?: string; // NEW - optional artist data
  song_id?: string;    // NEW - optional song ID
}

interface MoodHistoryProps {
  user: User;
  onLogout: () => void;
}

const MoodHistory: React.FC<MoodHistoryProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [userMoods, setUserMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMoods();
  }, []);

  const loadMoods = async () => {
    try {
      const response: any = await moods.getAll();
      console.log('🔍 MoodHistory API response:', response);
      console.log('🔍 Moods array:', response.moods);
      setUserMoods(response.moods || []);
    } catch (error) {
      console.error('Failed to load moods:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add this delete function after loadMoods()
const deleteMood = async (moodId: number) => {
  try {
    const response = await fetch(`http://localhost:3001/api/moods/${moodId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      console.log('✅ Mood deleted successfully');
      // Remove from local state immediately
      setUserMoods(prevMoods => prevMoods.filter(mood => mood.id !== moodId));
      
      // Show success notification
      showNotification('Mood deleted successfully! 🗑️');
    } else {
      throw new Error('Failed to delete mood');
    }
  } catch (error) {
    console.error('❌ Failed to delete mood:', error);
    showNotification('Failed to delete mood. Please try again.', 'error');
  }
};

// Add notification function
const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#22C55E' : '#FF6B6B'};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 1000;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 3000);
};

  const moodEmojis: { [key: string]: string } = {
    happy: '😊',
    sad: '😢',
    excited: '🤩',
    calm: '😌',
    anxious: '😰',
    angry: '😠',
    energetic: '⚡',
    tired: '😴',
    peaceful: '☮️'  // Added peaceful emoji
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
              className="btn-primary"
              onClick={() => navigate('/mood-log')}
              style={{ cursor: 'pointer' }}
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
                                background: mood.mood === 'happy' ? '#FFEB3B' :     // Yellow
                                mood.mood === 'sad' ? '#2196F3' :        // Blue
                                mood.mood === 'energetic' ? '#F44336' :  // Red
                                mood.mood === 'anxious' ? '#FF9800' :    // Orange
                                mood.mood === 'peaceful' ? '#9C27B0' :   // Purple
                                '#B3B3B3',  // Default gray for any other moods
                                color: 'black',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                {mood.intensity}/10
                              </div>
                              <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Delete this mood entry?')) {
                                deleteMood(mood.id);
                              }
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#666',
                              cursor: 'pointer',
                              fontSize: '14px',
                              padding: '4px',
                              borderRadius: '4px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#FF6B6B'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                            title="Delete mood entry"
                          >
                            🗑️
                          </button>
                              
                              <span style={{ color: '#535353', fontSize: '12px' }}>
                                {new Date(mood.created_at).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                                })}
                              </span>
                            </div>
                            
                            {/* Show song if available - NEW FEATURE! */}
                            {mood.song_name && mood.artist_name && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px',
                                padding: '8px 12px',
                                background: '#2A2A2A',
                                borderRadius: '6px',
                                border: '1px solid #333'
                              }}>
                                <span style={{ fontSize: '16px' }}>🎵</span>
                                <div>
                                  <p style={{ 
                                    color: '#1DB954', 
                                    margin: 0, 
                                    fontSize: '13px', 
                                    fontWeight: '600' 
                                  }}>
                                    "{mood.song_name}"
                                  </p>
                                  <p style={{ 
                                    color: '#B3B3B3', 
                                    margin: 0, 
                                    fontSize: '12px' 
                                  }}>
                                    by {mood.artist_name}
                                  </p>
                                </div>
                              </div>
                            )}
                            
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