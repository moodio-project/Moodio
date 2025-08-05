import React, { useState, useEffect } from 'react';
import { moods } from '../api';
import Navigation from './Navigation';
import SpotifyPlayer from './SpotifyPlayer';
import SpotifyMoodRecommendations from './SpotifyMoodRecommendations';

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

interface DashboardProps {
  user: User;
  onLogout: () => void;
  spotifyToken?: string | null;
  hasPremium?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, spotifyToken, hasPremium }) => {
  const [userMoods, setUserMoods] = useState<Mood[]>([]);
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [newMood, setNewMood] = useState({
    mood: 'happy',
    intensity: 5,
    note: ''
  });

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

  const loadMoods = async () => {
    try {
      const response = await moods.getAll() as any;
      setUserMoods(response.moods || []);
    } catch (error) {
      console.error('Failed to load moods:', error);
    }
  };

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('🔍 Dashboard newMood data:', newMood);
      console.log('🔍 Individual values:', {
        mood: newMood.mood,
        intensity: newMood.intensity,
        note: newMood.note,
        intensityType: typeof newMood.intensity
      });
      
      await moods.create(newMood.mood, newMood.intensity, newMood.note);
      setNewMood({ mood: 'happy', intensity: 5, note: '' });
      setShowMoodForm(false);
      loadMoods();
      
      // Show success notification
      showNotification('Mood logged successfully! 🎵');
    } catch (error) {
      console.error('❌ Failed to save mood:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
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
          <p style={{ color: '#B3B3B3', margin: 0, fontSize: '18px' }}>
          How are you feeling today?
          </p>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
          
          {/* Spotify Player */}
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

        {/* Spotify Recommendations - Replacing Recent Moods */}
        <SpotifyMoodRecommendations user={user} />

      </div>
    </div>
  );
};

export default Dashboard;