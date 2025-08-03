// LogMoodPage.tsx - New component for mood logging

import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';

interface User {
  id: number;
  username: string;
  email: string;
}

interface LogMoodPageProps {
  user: User;
  onLogout: () => void;
  spotifyToken?: string | null;
  hasPremium?: boolean;
}

interface CurrentTrack {
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  id: string;
}

const LogMoodPage: React.FC<LogMoodPageProps> = ({ user, onLogout, spotifyToken }) => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [moodIntensity, setMoodIntensity] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const moods = [
    { value: 'happy', label: '😊 Happy', color: '#22C55E' },
    { value: 'sad', label: '😢 Sad', color: '#F472B6' },
    { value: 'calm', label: '😌 Calm', color: '#A78BFA' },
    { value: 'energetic', label: '⚡ Energetic', color: '#22C55E' },
    { value: 'anxious', label: '😰 Anxious', color: '#F472B6' },
    { value: 'excited', label: '🤩 Excited', color: '#22C55E' },
    { value: 'melancholy', label: '😔 Melancholy', color: '#A78BFA' },
    { value: 'peaceful', label: '☮️ Peaceful', color: '#A78BFA' },
    { value: 'frustrated', label: '😤 Frustrated', color: '#F472B6' },
    { value: 'content', label: '😊 Content', color: '#22C55E' }
  ];

  // Get current playing track from Spotify
  useEffect(() => {
    fetchCurrentTrack();
  }, []);

  const fetchCurrentTrack = async () => {
    if (!spotifyToken) return;

    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${spotifyToken}`
        }
      });

      if (response.ok && response.status !== 204) {
        const data = await response.json();
        if (data && data.item) {
          setCurrentTrack(data.item);
        }
      }
    } catch (error) {
      console.log('No current track playing');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/moods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          mood: selectedMood,
          mood_intensity: moodIntensity,
          note: notes,
          song_id: currentTrack?.id || null
        })
      });

      if (response.ok) {
        // Reset form
        setSelectedMood('');
        setMoodIntensity(5);
        setNotes('');
        alert('Mood logged successfully! 🎵');
      } else {
        throw new Error('Failed to log mood');
      }
    } catch (error) {
      console.error('Error logging mood:', error);
      alert('Error logging mood. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#121212' }}>
      <Navigation user={user} currentPage="mood-log" onLogout={onLogout} />
      
      <div style={{ 
        marginLeft: '240px', 
        flex: 1, 
        padding: '32px',
        maxWidth: '800px',
        margin: '0 auto 0 240px'
      }}>
        <div style={{
          background: '#1E1E1E',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}>
          <h1 style={{
            color: '#22C55E',
            fontSize: '32px',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            Log Your Mood
          </h1>
          
          {/* Current Track Display */}
          {currentTrack && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#2A2A2A',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '32px',
              border: '1px solid #333'
            }}>
              <img 
                src={currentTrack.album.images[0]?.url} 
                alt="Album cover"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  marginRight: '16px',
                  objectFit: 'cover'
                }}
              />
              <div>
                <h3 style={{
                  color: '#A78BFA',
                  fontSize: '14px',
                  margin: '0 0 8px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Currently Playing
                </h3>
                <p style={{
                  color: '#FFFFFF',
                  fontWeight: '600',
                  margin: '0 0 4px 0',
                  fontSize: '16px'
                }}>
                  {currentTrack.name}
                </p>
                <p style={{
                  color: '#B3B3B3',
                  fontSize: '14px',
                  margin: 0
                }}>
                  {currentTrack.artists[0]?.name}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Mood Selection */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                color: '#FFFFFF',
                marginBottom: '16px',
                fontSize: '20px'
              }}>
                How are you feeling?
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px'
              }}>
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => setSelectedMood(mood.value)}
                    style={{
                      background: selectedMood === mood.value ? `${mood.color}20` : 'transparent',
                      border: `2px solid ${selectedMood === mood.value ? mood.color : 'transparent'}`,
                      borderRadius: '8px',
                      padding: '12px 16px',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '14px',
                      textAlign: 'center'
                    }}
                    onMouseOver={(e) => {
                      if (selectedMood !== mood.value) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedMood !== mood.value) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity Slider */}
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <h3 style={{
                color: '#FFFFFF',
                marginBottom: '16px',
                fontSize: '20px'
              }}>
                Intensity Level: {moodIntensity}/10
              </h3>
              <input
                type="range"
                min="1"
                max="10"
                value={moodIntensity}
                onChange={(e) => setMoodIntensity(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: `linear-gradient(to right, #22C55E 0%, #22C55E ${(moodIntensity - 1) * 11.11}%, #333 ${(moodIntensity - 1) * 11.11}%, #333 100%)`,
                  outline: 'none',
                  WebkitAppearance: 'none',
                  margin: '16px 0',
                  cursor: 'pointer'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#B3B3B3',
                fontSize: '12px'
              }}>
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                color: '#FFFFFF',
                marginBottom: '16px',
                fontSize: '20px'
              }}>
                Notes (Optional)
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What's on your mind? How is this song making you feel?"
                maxLength={500}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  background: '#2A2A2A',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '16px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#22C55E';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(34, 197, 94, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <small style={{
                color: '#B3B3B3',
                fontSize: '12px',
                display: 'block',
                textAlign: 'right',
                marginTop: '8px'
              }}>
                {notes.length}/500 characters
              </small>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedMood || isLoading}
              style={{
                background: !selectedMood || isLoading ? '#333' : 'linear-gradient(135deg, #22C55E, #16A249)',
                border: 'none',
                borderRadius: '8px',
                padding: '16px 32px',
                color: !selectedMood || isLoading ? '#666' : '#FFFFFF',
                fontSize: '18px',
                fontWeight: '600',
                cursor: !selectedMood || isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
              onMouseOver={(e) => {
                if (!isLoading && selectedMood) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading && selectedMood) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {isLoading ? 'Logging Mood...' : 'Log Mood 🎵'}
            </button>
          </form>

          {/* Add slider styling */}
          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #22C55E;
              cursor: pointer;
              box-shadow: 0 2px 6px rgba(34, 197, 94, 0.3);
              border: 2px solid #1a1a1a;
            }

            input[type="range"]::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #22C55E;
              cursor: pointer;
              border: 2px solid #1a1a1a;
              box-shadow: 0 2px 6px rgba(34, 197, 94, 0.3);
            }

            input[type="range"]::-webkit-slider-track {
              height: 8px;
              border-radius: 4px;
            }

            input[type="range"]::-moz-range-track {
              height: 8px;
              border-radius: 4px;
              border: none;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default LogMoodPage;