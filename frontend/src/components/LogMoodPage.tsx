// LogMoodPage.tsx - New component for mood logging

import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { moods } from '../api';

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

  const moodOptions = [
    { value: 'happy', label: '😊 Happy', color: '#FFEB3B' },      // Yellow
    { value: 'sad', label: '😢 Sad', color: '#2196F3' },           // Blue  
    { value: 'energetic', label: '⚡ Energetic', color: '#F44336' }, // Red
    { value: 'anxious', label: '😰 Anxious', color: '#FF9800' },    // Orange
    { value: 'peaceful', label: '☮️ Peaceful', color: '#9C27B0' }   // Purple
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
  
      if (response.status === 401) {
        console.log('Spotify token expired');
        return;
      }
  
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

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;
    
    setIsLoading(true);
    try {
      // Use the working API method (like Dashboard does)
      await moods.create(selectedMood, moodIntensity, notes);
      
      // Reset form
      setSelectedMood('');
      setMoodIntensity(5);
      setNotes('');
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
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
      }}>
        <div style={{
  background: '#1E1E1E',
  borderRadius: '12px',
  padding: '32px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  minHeight: 'calc(100vh - 64px)'
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
                {moodOptions.map((mood) => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => setSelectedMood(mood.value)}
                    style={{
                      background: selectedMood === mood.value ? `${mood.color}20` : 'transparent',
                      border: `2px solid ${selectedMood === mood.value ? mood.color : 'rgba(255, 255, 255, 0.1)'}`,
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
          
          {/* Success Message */}
          {showSuccess && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              background: '#22C55E',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
              zIndex: 1000,
              fontWeight: '600'
            }}>
              ✅ Mood logged successfully!
            </div>
          )}

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