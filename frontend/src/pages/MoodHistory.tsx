import React, { useState, useEffect } from 'react';
import SpotifyButton from '../components/spotify/SpotifyButton';
import { FaCalendar, FaChartLine, FaFilter, FaPlus } from 'react-icons/fa';

interface Mood {
  id: number;
  mood: string;
  mood_intensity: number;
  note: string;
  song_id?: string;
  created_at: string;
}

const MoodHistory: React.FC = () => {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchMoods();
  }, []);

  const fetchMoods = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/moods', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMoods(data);
      } else {
        console.error('Failed to fetch moods');
      }
    } catch (error) {
      console.error('Error fetching moods:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (mood: string) => {
    const moodColors: Record<string, string> = {
      happy: '#22C55E',
      sad: '#3B82F6',
      angry: '#EF4444',
      calm: '#A78BFA',
      excited: '#F472B6',
      anxious: '#F59E0B',
      relaxed: '#10B981',
      energetic: '#F97316'
    };
    return moodColors[mood.toLowerCase()] || '#A78BFA';
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      calm: '😌',
      excited: '🤩',
      anxious: '😰',
      relaxed: '😴',
      energetic: '⚡'
    };
    return moodEmojis[mood.toLowerCase()] || '🎵';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMoods = moods.filter(mood => {
    if (filter === 'all') return true;
    return mood.mood.toLowerCase() === filter;
  });

  const sortedMoods = [...filteredMoods].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'intensity') {
      return b.mood_intensity - a.mood_intensity;
    }
    return 0;
  });

  const moodStats = moods.reduce((stats, mood) => {
    const moodKey = mood.mood.toLowerCase();
    stats[moodKey] = (stats[moodKey] || 0) + 1;
    return stats;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="spotify-text-heading-large text-white">Mood History</h1>
          <div className="animate-pulse bg-spotify-medium-gray rounded-full w-32 h-10"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-spotify-medium-gray rounded-lg p-6 h-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="spotify-text-heading-large text-white">Mood History</h1>
          <p className="spotify-text-body-medium spotify-text-gray mt-2">
            Track your emotional journey through music
          </p>
        </div>
        <SpotifyButton variant="primary" icon={<FaPlus />}>
          Log New Mood
        </SpotifyButton>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-spotify-medium-gray rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center">
              <FaCalendar className="text-black" />
            </div>
            <div>
              <p className="spotify-text-body-small spotify-text-gray">Total Entries</p>
              <p className="spotify-text-heading-small text-white">{moods.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-spotify-medium-gray rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-moodio-lavender rounded-full flex items-center justify-center">
              <FaChartLine className="text-white" />
            </div>
            <div>
              <p className="spotify-text-body-small spotify-text-gray">Avg Intensity</p>
              <p className="spotify-text-heading-small text-white">
                {moods.length > 0 
                  ? Math.round(moods.reduce((sum, m) => sum + m.mood_intensity, 0) / moods.length)
                  : 0
                }/10
              </p>
            </div>
          </div>
        </div>

        <div className="bg-spotify-medium-gray rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-moodio-pink rounded-full flex items-center justify-center">
              <span className="text-white text-lg">😊</span>
            </div>
            <div>
              <p className="spotify-text-body-small spotify-text-gray">Most Common</p>
              <p className="spotify-text-heading-small text-white">
                {Object.keys(moodStats).length > 0 
                  ? Object.entries(moodStats).sort(([,a], [,b]) => b - a)[0][0]
                  : 'None'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-spotify-medium-gray rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center">
              <span className="text-black text-lg">📅</span>
            </div>
            <div>
              <p className="spotify-text-body-small spotify-text-gray">Days Tracked</p>
              <p className="spotify-text-heading-small text-white">
                {new Set(moods.map(m => new Date(m.created_at).toDateString())).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <FaFilter className="text-spotify-text-gray" />
          <span className="spotify-text-body-medium text-white">Filter:</span>
        </div>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="spotify-input bg-spotify-medium-gray border-spotify-border-gray text-white"
        >
          <option value="all">All Moods</option>
          <option value="happy">Happy</option>
          <option value="sad">Sad</option>
          <option value="calm">Calm</option>
          <option value="excited">Excited</option>
          <option value="angry">Angry</option>
          <option value="anxious">Anxious</option>
          <option value="relaxed">Relaxed</option>
          <option value="energetic">Energetic</option>
        </select>

        <div className="flex items-center gap-2">
          <span className="spotify-text-body-medium text-white">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="spotify-input bg-spotify-medium-gray border-spotify-border-gray text-white"
          >
            <option value="date">Date</option>
            <option value="intensity">Intensity</option>
          </select>
        </div>
      </div>

      {/* Mood Entries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedMoods.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-spotify-medium-gray rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎵</span>
            </div>
            <h3 className="spotify-text-heading-small text-white mb-2">No moods logged yet</h3>
            <p className="spotify-text-body-medium spotify-text-gray mb-4">
              Start tracking your moods to see your emotional journey
            </p>
            <SpotifyButton variant="primary" icon={<FaPlus />}>
              Log Your First Mood
            </SpotifyButton>
          </div>
        ) : (
          sortedMoods.map((mood) => (
            <div
              key={mood.id}
              className="spotify-card p-6 hover:bg-spotify-light-gray transition-colors"
              style={{ borderLeft: `4px solid ${getMoodColor(mood.mood)}` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${getMoodColor(mood.mood)}20` }}
                  >
                    {getMoodEmoji(mood.mood)}
                  </div>
                  <div>
                    <h3 className="spotify-text-heading-small text-white capitalize">
                      {mood.mood}
                    </h3>
                    <p className="spotify-text-body-small spotify-text-gray">
                      Intensity: {mood.mood_intensity}/10
                    </p>
                  </div>
                </div>
                <span className="spotify-text-caption spotify-text-gray">
                  {formatDate(mood.created_at)}
                </span>
              </div>

              {mood.note && (
                <p className="spotify-text-body-medium text-white mb-4">
                  "{mood.note}"
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {mood.song_id && (
                    <SpotifyButton variant="small">
                      View Song
                    </SpotifyButton>
                  )}
                </div>
                <div className="flex gap-2">
                  <SpotifyButton variant="small">
                    Edit
                  </SpotifyButton>
                  <SpotifyButton variant="small">
                    Delete
                  </SpotifyButton>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MoodHistory; 