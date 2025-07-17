import React, { useState, useEffect } from 'react';
import { useMusic } from '../contexts/MusicContext';
import '../styles/MusicDiscovery.css';

const MusicDiscovery: React.FC = () => {
  const { music, fetchAllMusic, fetchMusicByMood, searchMusic, isLoading } = useMusic();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('');

  const moodTypes = ['happy', 'sad', 'angry', 'calm', 'excited', 'anxious', 'melancholy', 'energetic'];

  useEffect(() => {
    fetchAllMusic();
  }, [fetchAllMusic]);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    fetchMusicByMood(mood);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMusic(searchQuery);
    }
  };

  return (
    <div className="music-discovery">
      <h1>Music Discovery</h1>
      
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search for music..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      <div className="mood-filters">
        <h3>Filter by Mood</h3>
        <div className="mood-buttons">
          <button
            className={`mood-btn ${selectedMood === '' ? 'active' : ''}`}
            onClick={() => {
              setSelectedMood('');
              fetchAllMusic();
            }}
          >
            All
          </button>
          {moodTypes.map(mood => (
            <button
              key={mood}
              className={`mood-btn ${selectedMood === mood ? 'active' : ''}`}
              onClick={() => handleMoodSelect(mood)}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      <div className="music-results">
        <h3>Music Recommendations</h3>
        {isLoading ? (
          <p>Loading music...</p>
        ) : music.length === 0 ? (
          <p>No music found. Try a different search or mood filter.</p>
        ) : (
          <div className="music-grid">
            {music.map(song => (
              <div key={song.id} className="music-card">
                <h4>{song.title}</h4>
                <p className="artist">{song.artist}</p>
                {song.album && <p className="album">{song.album}</p>}
                <div className="music-tags">
                  <span className="tag genre">{song.genre}</span>
                  <span className="tag mood">{song.mood_type}</span>
                </div>
                {song.duration && (
                  <p className="duration">
                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicDiscovery; 