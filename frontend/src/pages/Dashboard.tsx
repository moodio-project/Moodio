import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlbumCard, PlaylistCard } from '../components/spotify/SpotifyCard';
import SpotifyButton from '../components/spotify/SpotifyButton';
import { FaPlay, FaHeart, FaPlus } from 'react-icons/fa';

interface Mood {
  id: number;
  mood: string;
  mood_intensity: number;
  note: string;
  created_at: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string; images: Array<{ url: string }> };
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [recentMoods, setRecentMoods] = useState<Mood[]>([]);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent moods
      const moodsResponse = await fetch('http://localhost:3001/api/moods', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (moodsResponse.ok) {
        const moodsData = await moodsResponse.json();
        setRecentMoods(moodsData.slice(0, 3)); // Get last 3 moods
      }

      // Fetch Spotify profile and top tracks
      const profileResponse = await fetch('http://localhost:3001/api/spotify/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (profileResponse.ok) {
        // In a real app, you would fetch actual top tracks from Spotify API
        // For now, we'll use mock data that looks realistic
        setTopTracks([
          {
            id: '1',
            name: 'Blinding Lights',
            artists: [{ name: 'The Weeknd' }],
            album: { 
              name: 'After Hours',
              images: [{ url: 'https://via.placeholder.com/200x200/1DB954/FFFFFF?text=After+Hours' }]
            }
          },
          {
            id: '2',
            name: 'Dance Monkey',
            artists: [{ name: 'Tones and I' }],
            album: { 
              name: 'The Kids Are Coming',
              images: [{ url: 'https://via.placeholder.com/200x200/A78BFA/FFFFFF?text=Kids+Coming' }]
            }
          },
          {
            id: '3',
            name: 'Shape of You',
            artists: [{ name: 'Ed Sheeran' }],
            album: { 
              name: '÷ (Divide)',
              images: [{ url: 'https://via.placeholder.com/200x200/F472B6/FFFFFF?text=Divide' }]
            }
          },
          {
            id: '4',
            name: 'Someone Like You',
            artists: [{ name: 'Adele' }],
            album: { 
              name: '21',
              images: [{ url: 'https://via.placeholder.com/200x200/1DB954/FFFFFF?text=21' }]
            }
          },
          {
            id: '5',
            name: 'Uptown Funk',
            artists: [{ name: 'Mark Ronson ft. Bruno Mars' }],
            album: { 
              name: 'Uptown Special',
              images: [{ url: 'https://via.placeholder.com/200x200/A78BFA/FFFFFF?text=Uptown' }]
            }
          },
          {
            id: '6',
            name: 'Despacito',
            artists: [{ name: 'Luis Fonsi & Daddy Yankee' }],
            album: { 
              name: 'Vida',
              images: [{ url: 'https://via.placeholder.com/200x200/F472B6/FFFFFF?text=Vida' }]
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const moodPlaylists = [
    {
      id: 1,
      name: 'Happy Vibes',
      description: 'Songs to lift your mood',
      image: 'https://via.placeholder.com/200x200/22C55E/FFFFFF?text=Happy'
    },
    {
      id: 2,
      name: 'Chill & Relaxed',
      description: 'Perfect for unwinding',
      image: 'https://via.placeholder.com/200x200/A78BFA/FFFFFF?text=Chill'
    },
    {
      id: 3,
      name: 'Energetic Beats',
      description: 'Get pumped up',
      image: 'https://via.placeholder.com/200x200/F472B6/FFFFFF?text=Energy'
    },
    {
      id: 4,
      name: 'Focus Flow',
      description: 'Concentration music',
      image: 'https://via.placeholder.com/200x200/1DB954/FFFFFF?text=Focus'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-spotify-medium-gray rounded w-64 mb-4"></div>
          <div className="h-4 bg-spotify-medium-gray rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
      {/* Greeting Header */}
      <div className="flex items-center justify-between">
        <h1 className="spotify-text-heading-large text-white">
          {greeting}, {user?.display_name || user?.username || 'User'}
        </h1>
        <SpotifyButton variant="primary" icon={<FaPlus />}>
          Log Mood
        </SpotifyButton>
      </div>

      {/* Recent Moods Section */}
      <section>
        <h2 className="spotify-text-heading-medium text-white mb-4">
          Recent Moods
        </h2>
        {recentMoods.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-spotify-medium-gray rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎵</span>
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
          <div className="spotify-grid spotify-grid-3">
            {recentMoods.map((mood) => (
              <div
                key={mood.id}
                className="spotify-card p-4"
                style={{ borderLeft: `4px solid ${getMoodColor(mood.mood)}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
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
                  <p className="spotify-text-body-small text-white mb-3">
                    "{mood.note}"
                  </p>
                )}
                <SpotifyButton variant="small" icon={<FaPlay />}>
                  Play Mood Music
                </SpotifyButton>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Made For You Section */}
      <section>
        <h2 className="spotify-text-heading-medium text-white mb-4">
          Made For You
        </h2>
        <div className="spotify-grid spotify-grid-6">
          {topTracks.map((track) => (
            <AlbumCard
              key={track.id}
              title={track.name}
              artist={track.artists[0].name}
              image={track.album.images[0]?.url || 'https://via.placeholder.com/200x200/1DB954/FFFFFF?text=Album'}
              onClick={() => console.log('Play track:', track.name)}
            />
          ))}
        </div>
      </section>

      {/* Mood-Based Playlists */}
      <section>
        <h2 className="spotify-text-heading-medium text-white mb-4">
          Mood-Based Playlists
        </h2>
        <div className="spotify-grid spotify-grid-4">
          {moodPlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              name={playlist.name}
              description={playlist.description}
              image={playlist.image}
              onClick={() => console.log('Play playlist:', playlist.name)}
            />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="spotify-text-heading-medium text-white mb-4">
          Quick Actions
        </h2>
        <div className="spotify-grid spotify-grid-3">
          <div className="spotify-card p-6 text-center">
            <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-4">
              <FaPlus className="text-black text-xl" />
            </div>
            <h3 className="spotify-text-heading-small text-white mb-2">
              Log New Mood
            </h3>
            <p className="spotify-text-body-small spotify-text-gray mb-4">
              Track how you're feeling right now
            </p>
            <SpotifyButton variant="primary">
              Get Started
            </SpotifyButton>
          </div>

          <div className="spotify-card p-6 text-center">
            <div className="w-12 h-12 bg-moodio-lavender rounded-full flex items-center justify-center mx-auto mb-4">
              <FaHeart className="text-white text-xl" />
            </div>
            <h3 className="spotify-text-heading-small text-white mb-2">
              View Insights
            </h3>
            <p className="spotify-text-body-small spotify-text-gray mb-4">
              See your mood patterns over time
            </p>
            <SpotifyButton variant="secondary">
              Explore
            </SpotifyButton>
          </div>

          <div className="spotify-card p-6 text-center">
            <div className="w-12 h-12 bg-moodio-pink rounded-full flex items-center justify-center mx-auto mb-4">
              <FaPlay className="text-white text-xl" />
            </div>
            <h3 className="spotify-text-heading-small text-white mb-2">
              Discover Music
            </h3>
            <p className="spotify-text-body-small spotify-text-gray mb-4">
              Find songs that match your mood
            </p>
            <SpotifyButton variant="secondary">
              Browse
            </SpotifyButton>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard; 