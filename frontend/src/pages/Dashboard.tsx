import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMusic } from '../contexts/MusicContext';
import { useMood } from '../contexts/MoodContext';
import SpotifyButton from '../components/spotify/SpotifyButton';
import MoodChart from '../components/MoodChart';
import { 
  FaPlay, 
  FaPause, 
  FaStepForward, 
  FaStepBackward, 
  FaHeart,
  FaPlus,
  FaSearch,
  FaChartLine,
  FaLightbulb,
  FaHistory
} from 'react-icons/fa';

interface ListeningHistoryItem {
  id: string;
  name: string;
  artist: string;
  album: string;
  album_art: string;
  played_at: string;
  duration_ms: number;
  uri: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    currentTrack, 
    isPlaying, 
    progress, 
    duration,
    playTrack,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekTo,
    isLoading
  } = useMusic();
  
  const { 
    moodHistory,
    moodAnalysis,
    recommendations,
    moodStats,
    logMood,
    getRecommendations,
    isLoading: moodLoading
  } = useMood();

  const [greeting, setGreeting] = useState('');
  const [showMoodLogger, setShowMoodLogger] = useState(false);
  const [moodForm, setMoodForm] = useState({
    mood: '',
    intensity: 5,
    note: ''
  });
  const [listeningHistory, setListeningHistory] = useState<ListeningHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }

    // Load real listening history
    loadListeningHistory();
  }, []);

  const loadListeningHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await fetch('http://localhost:3001/api/spotify/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setListeningHistory(data);
      }
    } catch (error) {
      console.error('Failed to load listening history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moodForm.mood) return;

    await logMood(moodForm.mood, moodForm.intensity, moodForm.note, currentTrack);
    await getRecommendations(moodForm.mood);
    setMoodForm({ mood: '', intensity: 5, note: '' });
    setShowMoodLogger(false);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newPosition = Math.floor(percentage * duration);
    seekTo(newPosition);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-spotify-dark-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-white">Loading your music...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-spotify-dark-gray">
      {/* Left Panel - Music Player */}
      <div className="w-1/2 bg-spotify-black p-6 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="spotify-text-heading-large text-white mb-2">
            {greeting}, {user?.display_name || user?.username || 'User'}
          </h1>
          <p className="spotify-text-body-medium spotify-text-gray">
            What's your mood today?
          </p>
        </div>

        {/* Current Track Display */}
        {currentTrack ? (
          <div className="bg-spotify-medium-gray rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={currentTrack.album.images[0]?.url || 'https://via.placeholder.com/80x80'}
                alt={currentTrack.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="spotify-text-heading-small text-white mb-1">
                  {currentTrack.name}
                </h3>
                <p className="spotify-text-body-medium spotify-text-gray">
                  {currentTrack.artists.map(a => a.name).join(', ')}
                </p>
                <p className="spotify-text-body-small spotify-text-gray">
                  {currentTrack.album.name}
                </p>
              </div>
              <div className="flex gap-2">
                <SpotifyButton variant="small" onClick={() => {}}>
                  <FaHeart />
                </SpotifyButton>
                <SpotifyButton variant="small" onClick={() => {}}>
                  <FaPlus />
                </SpotifyButton>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div 
                className="w-full bg-spotify-border-gray rounded-full h-1 cursor-pointer"
                onClick={handleSeek}
              >
                <div 
                  className="bg-spotify-green h-1 rounded-full transition-all duration-300"
                  style={{ width: `${(progress / duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="spotify-text-caption spotify-text-gray">
                  {formatTime(progress)}
                </span>
                <span className="spotify-text-caption spotify-text-gray">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4">
              <SpotifyButton variant="small" onClick={previousTrack}>
                <FaStepBackward />
              </SpotifyButton>
              <SpotifyButton variant="primary" onClick={togglePlayPause}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </SpotifyButton>
              <SpotifyButton variant="small" onClick={nextTrack}>
                <FaStepForward />
              </SpotifyButton>
            </div>
          </div>
        ) : (
          <div className="bg-spotify-medium-gray rounded-lg p-6 mb-6 text-center">
            <div className="w-20 h-20 bg-spotify-border-gray rounded-lg mx-auto mb-4 flex items-center justify-center">
              <FaPlay className="text-spotify-text-gray text-2xl" />
            </div>
            <h3 className="spotify-text-heading-small text-white mb-2">
              No track playing
            </h3>
            <p className="spotify-text-body-small spotify-text-gray">
              Start playing music to see it here
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <SpotifyButton 
            variant="primary" 
            className="w-full"
            onClick={() => setShowMoodLogger(true)}
          >
            <FaLightbulb className="mr-2" />
            Log Your Mood
          </SpotifyButton>
          
          <SpotifyButton variant="secondary" className="w-full">
            <FaSearch className="mr-2" />
            Discover Music
          </SpotifyButton>
        </div>

        {/* Real Listening History */}
        {listeningHistory.length > 0 && (
          <div className="mt-6">
            <h3 className="spotify-text-heading-small text-white mb-3 flex items-center gap-2">
              <FaHistory className="text-spotify-green" />
              Recently Played
            </h3>
            <div className="space-y-2">
              {listeningHistory.slice(0, 3).map((track) => (
                <div 
                  key={track.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-spotify-light-gray cursor-pointer"
                  onClick={() => playTrack(track.uri)}
                >
                  <img
                    src={track.album_art || 'https://via.placeholder.com/40x40'}
                    alt={track.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="spotify-text-body-small text-white truncate">
                      {track.name}
                    </p>
                    <p className="spotify-text-caption spotify-text-gray truncate">
                      {track.artist}
                    </p>
                  </div>
                  <span className="spotify-text-caption spotify-text-gray">
                    {formatTime(track.duration_ms)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {historyLoading && (
          <div className="mt-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-spotify-green mx-auto mb-2"></div>
            <p className="spotify-text-caption spotify-text-gray">Loading history...</p>
          </div>
        )}
      </div>

      {/* Right Panel - Mood Dashboard */}
      <div className="w-1/2 bg-spotify-dark-gray p-6 overflow-y-auto">
        {/* Mood Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-spotify-medium-gray rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center">
                <FaChartLine className="text-black" />
              </div>
              <div>
                <p className="spotify-text-body-small spotify-text-gray">Total Moods</p>
                <p className="spotify-text-heading-small text-white">{moodStats.totalMoods}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-spotify-medium-gray rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-moodio-lavender rounded-full flex items-center justify-center">
                <span className="text-white text-lg">📊</span>
              </div>
              <div>
                <p className="spotify-text-body-small spotify-text-gray">Avg Intensity</p>
                <p className="spotify-text-heading-small text-white">{moodStats.averageIntensity}/10</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Mood Analysis */}
        {moodAnalysis && (
          <div className="bg-spotify-medium-gray rounded-lg p-6 mb-6">
            <h3 className="spotify-text-heading-small text-white mb-4">
              Mood Analysis
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {moodAnalysis.mood === 'happy' ? '😊' : 
                   moodAnalysis.mood === 'sad' ? '😢' : 
                   moodAnalysis.mood === 'calm' ? '😌' : '🎵'}
                </span>
                <div>
                  <p className="spotify-text-body-medium text-white capitalize">
                    {moodAnalysis.mood}
                  </p>
                  <p className="spotify-text-body-small spotify-text-gray">
                    Confidence: {Math.round(moodAnalysis.confidence * 100)}%
                  </p>
                </div>
              </div>
              <p className="spotify-text-body-small text-white">
                {moodAnalysis.reasoning}
              </p>
            </div>
          </div>
        )}

        {/* Music Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="spotify-text-heading-small text-white mb-4">
              Recommended for Your Mood
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {recommendations.slice(0, 4).map((rec, index) => (
                <div key={index} className="bg-spotify-medium-gray rounded-lg p-4">
                  <div className="w-12 h-12 bg-spotify-green rounded-lg mb-3 flex items-center justify-center">
                    <FaPlay className="text-black" />
                  </div>
                  <h4 className="spotify-text-body-medium text-white mb-1">
                    {rec.title}
                  </h4>
                  <p className="spotify-text-body-small spotify-text-gray mb-2">
                    {rec.artist}
                  </p>
                  <p className="spotify-text-caption spotify-text-gray">
                    {rec.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mood Chart */}
        {moodHistory.length > 0 && (
          <div className="mb-6">
            <h3 className="spotify-text-heading-small text-white mb-4 flex items-center gap-2">
              <FaChartLine className="text-spotify-green" />
              Mood Trends
            </h3>
            <MoodChart 
              moodData={moodHistory} 
              chartType="line" 
              timeRange="week"
              className="mb-4"
            />
            <div className="grid grid-cols-2 gap-4">
              <MoodChart 
                moodData={moodHistory} 
                chartType="doughnut" 
                timeRange="month"
              />
              <MoodChart 
                moodData={moodHistory} 
                chartType="radar" 
                timeRange="month"
              />
            </div>
          </div>
        )}

        {/* Recent Moods */}
        {moodHistory.length > 0 && (
          <div>
            <h3 className="spotify-text-heading-small text-white mb-4">
              Recent Moods
            </h3>
            <div className="space-y-3">
              {moodHistory.slice(0, 5).map((mood) => (
                <div key={mood.id} className="bg-spotify-medium-gray rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {mood.mood === 'happy' ? '😊' : 
                         mood.mood === 'sad' ? '😢' : 
                         mood.mood === 'calm' ? '😌' : '🎵'}
                      </span>
                      <div>
                        <p className="spotify-text-body-medium text-white capitalize">
                          {mood.mood}
                        </p>
                        <p className="spotify-text-caption spotify-text-gray">
                          Intensity: {mood.mood_intensity}/10
                        </p>
                      </div>
                    </div>
                    <span className="spotify-text-caption spotify-text-gray">
                      {new Date(mood.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {mood.note && (
                    <p className="spotify-text-body-small text-white">
                      "{mood.note}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mood Logger Modal */}
      {showMoodLogger && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-spotify-medium-gray rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="spotify-text-heading-small text-white mb-4">
              How are you feeling?
            </h3>
            
            <form onSubmit={handleMoodSubmit} className="space-y-4">
              {/* Mood Selection */}
              <div>
                <label className="block spotify-text-body-medium text-white mb-2">
                  Mood
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['happy', 'sad', 'calm', 'excited', 'angry', 'anxious', 'relaxed', 'energetic'].map((mood) => (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => setMoodForm(prev => ({ ...prev, mood }))}
                      className={`p-3 rounded-lg text-center transition-colors ${
                        moodForm.mood === mood
                          ? 'bg-spotify-green text-black'
                          : 'bg-spotify-border-gray text-white hover:bg-spotify-light-gray'
                      }`}
                    >
                      <div className="text-xl mb-1">
                        {mood === 'happy' ? '😊' : 
                         mood === 'sad' ? '😢' : 
                         mood === 'calm' ? '😌' : 
                         mood === 'excited' ? '🤩' : 
                         mood === 'angry' ? '😠' : 
                         mood === 'anxious' ? '😰' : 
                         mood === 'relaxed' ? '😴' : '⚡'}
                      </div>
                      <div className="spotify-text-caption capitalize">
                        {mood}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity Slider */}
              <div>
                <label className="block spotify-text-body-medium text-white mb-2">
                  Intensity: {moodForm.intensity}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodForm.intensity}
                  onChange={(e) => setMoodForm(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block spotify-text-body-medium text-white mb-2">
                  Note (optional)
                </label>
                <textarea
                  value={moodForm.note}
                  onChange={(e) => setMoodForm(prev => ({ ...prev, note: e.target.value }))}
                  className="spotify-input w-full h-20 resize-none"
                  placeholder="What's on your mind?"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <SpotifyButton
                  type="submit"
                  variant="primary"
                  disabled={!moodForm.mood || moodLoading}
                  className="flex-1"
                >
                  {moodLoading ? 'Logging...' : 'Log Mood'}
                </SpotifyButton>
                <SpotifyButton
                  type="button"
                  variant="secondary"
                  onClick={() => setShowMoodLogger(false)}
                  className="flex-1"
                >
                  Cancel
                </SpotifyButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 