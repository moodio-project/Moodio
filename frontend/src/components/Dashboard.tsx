// ===== UPDATE YOUR Dashboard.tsx component signature and SpotifyPlayer usage =====

import React, { useState, useEffect } from 'react';
import { moods } from '../api';
import Navigation from './Navigation';
import SpotifyPlayer from './SpotifyPlayer';
import { spotify } from '../api';

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

// ✅ UPDATE THIS INTERFACE
interface DashboardProps {
  user: User;
  onLogout: () => void;
  spotifyToken?: string | null;  // Add this prop
  hasPremium?: boolean;          // Add this prop
}

// ✅ UPDATE THE COMPONENT SIGNATURE
const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, spotifyToken, hasPremium }) => {
  const [userMoods, setUserMoods] = useState<Mood[]>([]);
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [recommendedTracks, setRecommendedTracks] = useState<any[]>([]);
  const [recommendationData, setRecommendationData] = useState<any>(null);
  const [newMood, setNewMood] = useState({
    mood: 'happy',
    intensity: 5,
    note: ''
  });

  // ✅ ADD DEBUG LOGGING
  useEffect(() => {
    console.log('🎯 Dashboard received props:', {
      hasUser: !!user,
      hasSpotifyToken: !!spotifyToken,
      hasPremium: hasPremium,
      spotifyTokenLength: spotifyToken?.length,
      spotifyTokenPreview: spotifyToken ? spotifyToken.substring(0, 20) + '...' : 'None'
    });
  }, [user, spotifyToken, hasPremium]);

  useEffect(() => {
    loadMoods();
  }, []);

  useEffect(() => {
    if (userMoods.length > 0) {
      loadEnhancedRecommendations(userMoods[0].mood);
    }
  }, [userMoods]);

  const loadMoods = async () => {
    try {
      const response: any = await moods.getAll();
      setUserMoods(response.moods);
    } catch (error) {
      console.error('Failed to load moods:', error);
    }
  };

  const loadEnhancedRecommendations = async (mood: string) => {
    try {
      // Try enhanced recommendations first
      const response: any = await spotify.getEnhancedRecommendations(mood);
      setRecommendedTracks(response.recommendations || []);
      setRecommendationData(response);
    } catch (error) {
      console.error('Failed to load enhanced recommendations:', error);
      // Fallback to basic recommendations
      try {
        const fallbackResponse: any = await spotify.getRecommendations(mood);
        setRecommendedTracks(fallbackResponse.tracks || []);
      } catch (fallbackError) {
        console.error('Fallback recommendations also failed:', fallbackError);
      }
    }
  };

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await moods.create(newMood.mood, newMood.intensity, newMood.note);
      setNewMood({ mood: 'happy', intensity: 5, note: '' });
      setShowMoodForm(false);
      loadMoods();
      
      // Show success notification
      showNotification('Mood logged successfully! 🎵');
    } catch (error) {
      console.error('Failed to save mood:', error);
      showNotification('Failed to save mood. Please try again.', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    // Simple toast notification
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#1DB954' : '#FF6B6B'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 1000;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
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
    tired: '😴'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#121212' }}>
      <Navigation user={user} currentPage="dashboard" onLogout={onLogout} />
      
      <div style={{ 
        marginLeft: '240px', 
        flex: 1, 
        padding: '32px',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: 'white', fontSize: '32px', margin: '0 0 8px 0' }}>
            Welcome back, {user.username}! 👋
          </h1>
          <p style={{ color: '#B3B3B3', margin: 0 }}>
            How are you feeling today?
          </p>
        </div>

        {/* ✅ DEBUG INFO SECTION - Remove this after testing */}
        <div style={{ 
          background: '#282828', 
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '32px',
          fontSize: '12px',
          color: '#B3B3B3'
        }}>
          <h3 style={{ color: 'white', margin: '0 0 8px 0' }}>Debug Info:</h3>
          <p>Spotify Token: {spotifyToken ? 'Present (' + spotifyToken.length + ' chars)' : 'Missing'}</p>
          <p>Has Premium: {hasPremium ? 'Yes' : 'No'}</p>
          <p>Token Preview: {spotifyToken ? spotifyToken.substring(0, 30) + '...' : 'None'}</p>
          <p>Local Storage Token: {localStorage.getItem('spotify_token') ? 'Present' : 'Missing'}</p>
          <p>Local Storage Premium: {localStorage.getItem('has_premium')}</p>
        </div>

        {/* Main Content - ✅ PASS ALL PROPS TO SPOTIFY PLAYER */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
          
          {/* ✅ UPDATED SPOTIFY PLAYER WITH ALL PROPS */}
          <SpotifyPlayer 
            accessToken={spotifyToken} 
            hasPremium={hasPremium}
          />
          
          {/* Quick Mood Log */}
          <div className="card">
            <h2 style={{ color: 'white', marginBottom: '24px' }}>Quick Mood Check</h2>
            
            {!showMoodForm ? (
              <button 
                onClick={() => setShowMoodForm(true)}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                How are you feeling? ✨
              </button>
            ) : (
              <form onSubmit={handleMoodSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#B3B3B3', display: 'block', marginBottom: '8px' }}>
                    Mood:
                  </label>
                  <select 
                    value={newMood.mood}
                    onChange={(e) => setNewMood({ ...newMood, mood: e.target.value })}
                    className="input-field"
                  >
                    <option value="happy">😊 Happy</option>
                    <option value="sad">😢 Sad</option>
                    <option value="excited">🤩 Excited</option>
                    <option value="calm">😌 Calm</option>
                    <option value="anxious">😰 Anxious</option>
                    <option value="angry">😠 Angry</option>
                    <option value="energetic">⚡ Energetic</option>
                    <option value="tired">😴 Tired</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#B3B3B3', display: 'block', marginBottom: '8px' }}>
                    Intensity: {newMood.intensity}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newMood.intensity}
                    onChange={(e) => setNewMood({ ...newMood, intensity: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>

                <textarea
                  className="input-field"
                  placeholder="How are you feeling? (optional)"
                  value={newMood.note}
                  onChange={(e) => setNewMood({ ...newMood, note: e.target.value })}
                  rows={3}
                />

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    Save Mood
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowMoodForm(false)}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Rest of your dashboard content stays the same... */}
        {/* Recent Moods */}
        <div className="card">
          <h2 style={{ color: 'white', marginBottom: '24px' }}>Recent Moods</h2>
          
          {userMoods.length === 0 ? (
            <p style={{ color: '#B3B3B3', textAlign: 'center', padding: '32px' }}>
              No moods logged yet. Start tracking your emotions! 🎵
            </p>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {userMoods.slice(0, 5).map((mood) => (
                <div 
                  key={mood.id}
                  style={{
                    background: '#181818',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '12px',
                    border: '1px solid #282828'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px', marginRight: '12px' }}>
                      {moodEmojis[mood.mood] || '😊'}
                    </span>
                    <div>
                      <h4 style={{ color: 'white', margin: 0, textTransform: 'capitalize' }}>
                        {mood.mood}
                      </h4>
                      <p style={{ color: '#B3B3B3', margin: '4px 0 0 0', fontSize: '14px' }}>
                        Intensity: {mood.intensity}/10 • {new Date(mood.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {mood.note && (
                    <p style={{ color: '#B3B3B3', margin: 0, fontSize: '14px' }}>
                      "{mood.note}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;