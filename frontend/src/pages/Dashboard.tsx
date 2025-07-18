import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentSong, setCurrentSong] = useState({
    title: 'No song playing',
    artist: 'Unknown Artist',
    albumArt: '/default-album-art.svg',
    progress: 0,
    duration: 100
  });

  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dashboard-container">
      {/* Left Side - Music Player Panel */}
      <div className="music-player-panel">
        <div className="music-player-header">
          <div className="moodio-logo">
            <span className="logo-text">Moodio</span>
          </div>
        </div>
        
        <div className="music-player-content">
          <div className="album-art-container">
            <div className="album-art">
              <img src={currentSong.albumArt} alt="Album Art" />
            </div>
          </div>
          
          <div className="song-info">
            <h3 className="song-title">{currentSong.title}</h3>
            <p className="song-artist">{currentSong.artist}</p>
          </div>
          
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentSong.progress / currentSong.duration) * 100}%` }}
              ></div>
            </div>
            <div className="time-display">
              <span>{formatTime(currentSong.progress)}</span>
              <span>{formatTime(currentSong.duration)}</span>
            </div>
          </div>
          
          <div className="playback-controls">
            <button className="control-btn shuffle-btn">
              <i className="fas fa-random"></i>
            </button>
            <button className="control-btn skip-btn">
              <i className="fas fa-step-backward"></i>
            </button>
            <button className="control-btn play-btn" onClick={handlePlayPause}>
              <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
            </button>
            <button className="control-btn skip-btn">
              <i className="fas fa-step-forward"></i>
            </button>
            <button className="control-btn repeat-btn">
              <i className="fas fa-redo"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Mood Dashboard Panel */}
      <div className="mood-dashboard-panel">
        <div className="dashboard-header">
          <div className="search-container">
            <div className="search-bar">
              <i className="fas fa-search search-icon"></i>
              <input 
                type="text" 
                placeholder="Search for an artist..." 
                className="search-input"
              />
            </div>
          </div>
          <div className="header-actions">
            <button className="menu-btn">
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Mood Suggestions Section */}
          <div className="mood-suggestions-section">
            <h2 className="section-title">FEELING SAD?</h2>
            <div className="song-suggestions">
                             <div className="song-card">
                 <div className="song-card-art">
                   <img src="/default-album-art.svg" alt="Album Art" />
                 </div>
                 <div className="song-card-info">
                   <h4>Comforting Song</h4>
                   <p>Uplifting Artist</p>
                 </div>
               </div>
               <div className="song-card">
                 <div className="song-card-art">
                   <img src="/default-album-art.svg" alt="Album Art" />
                 </div>
                 <div className="song-card-info">
                   <h4>Melancholy Melody</h4>
                   <p>Emotional Artist</p>
                 </div>
               </div>
               <div className="song-card">
                 <div className="song-card-art">
                   <img src="/default-album-art.svg" alt="Album Art" />
                 </div>
                 <div className="song-card-info">
                   <h4>Hopeful Harmony</h4>
                   <p>Inspirational Artist</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Suggested Songs Section */}
          <div className="suggested-songs-section">
            <h2 className="section-title">SUGGESTED SONGS</h2>
                         <div className="song-suggestions">
               <div className="song-card">
                 <div className="song-card-art">
                   <img src="/default-album-art.svg" alt="Album Art" />
                 </div>
                 <div className="song-card-info">
                   <h4>Based on your mood</h4>
                   <p>AI Recommended</p>
                 </div>
               </div>
               <div className="song-card">
                 <div className="song-card-art">
                   <img src="/default-album-art.svg" alt="Album Art" />
                 </div>
                 <div className="song-card-info">
                   <h4>Similar to your favorites</h4>
                   <p>Discovery</p>
                 </div>
               </div>
             </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <button className="action-btn primary-btn">
              <i className="fas fa-heart"></i>
              Track Mood
            </button>
            <button className="action-btn secondary-btn">
              <i className="fas fa-music"></i>
              Discover Music
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 