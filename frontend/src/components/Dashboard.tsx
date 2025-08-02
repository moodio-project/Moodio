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

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [userMoods, setUserMoods] = useState<Mood[]>([]);
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [recommendedTracks, setRecommendedTracks] = useState<any[]>([]);
  const [newMood, setNewMood] = useState({
    mood: 'happy',
    intensity: 5,
    note: ''
  });

  useEffect(() => {
    loadMoods();
  }, []);

  useEffect(() => {
    if (userMoods.length > 0) {
      loadRecommendations(userMoods[0].mood);
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

  const loadRecommendations = async (mood: string) => {
    try {
      const response: any = await spotify.getRecommendations(mood);
      setRecommendedTracks(response.tracks || []);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await moods.create(newMood.mood, newMood.intensity, newMood.note);
      setNewMood({ mood: 'happy', intensity: 5, note: '' });
      setShowMoodForm(false);
      loadMoods();
    } catch (error) {
      console.error('Failed to save mood:', error);
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

        {/* Main Content - Spotify Player & Mood Logging */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
          
          {/* Spotify Player */}
          <SpotifyPlayer />
          
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

        {/* Mood-based Recommendations */}
        {recommendedTracks.length > 0 && (
          <div className="card" style={{ marginBottom: '32px' }}>
            <h2 style={{ color: 'white', marginBottom: '16px' }}>
              🎵 Songs for your {userMoods[0]?.mood} mood
            </h2>
            <p style={{ color: '#B3B3B3', marginBottom: '24px', fontSize: '14px' }}>
              Based on your listening history and current mood
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {recommendedTracks.map((track: any) => (
                <div 
                  key={track.id} 
                  style={{
                    background: '#181818',
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#282828';
                    e.currentTarget.style.borderColor = '#1DB954';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#181818';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <img 
                    src={track.album.images[0]?.url}
                    alt={track.album.name}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      objectFit: 'cover'
                    }}
                  />
                  <h4 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>
                    {track.name}
                  </h4>
                  <p style={{ color: '#B3B3B3', margin: 0, fontSize: '13px' }}>
                    {track.artists[0].name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

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