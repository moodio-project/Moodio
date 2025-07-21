import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlbumCard, PlaylistCard } from '../components/spotify/SpotifyCard';
import SpotifyButton from '../components/spotify/SpotifyButton';
import { FaPlay, FaHeart, FaPlus } from 'react-icons/fa';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  // Mock data - replace with real API calls
  const recentMoods = [
    { id: 1, mood: 'Happy', color: '#22C55E', timestamp: '2 hours ago' },
    { id: 2, mood: 'Calm', color: '#A78BFA', timestamp: '5 hours ago' },
    { id: 3, mood: 'Energetic', color: '#F472B6', timestamp: '1 day ago' },
  ];

  const recommendedAlbums = [
    {
      id: 1,
      title: 'Midnights',
      artist: 'Taylor Swift',
      image: 'https://via.placeholder.com/200x200/1DB954/FFFFFF?text=Album+1'
    },
    {
      id: 2,
      title: 'SOS',
      artist: 'SZA',
      image: 'https://via.placeholder.com/200x200/A78BFA/FFFFFF?text=Album+2'
    },
    {
      id: 3,
      title: 'Un Verano Sin Ti',
      artist: 'Bad Bunny',
      image: 'https://via.placeholder.com/200x200/F472B6/FFFFFF?text=Album+3'
    },
    {
      id: 4,
      title: 'Harry\'s House',
      artist: 'Harry Styles',
      image: 'https://via.placeholder.com/200x200/1DB954/FFFFFF?text=Album+4'
    },
    {
      id: 5,
      title: 'Renaissance',
      artist: 'Beyoncé',
      image: 'https://via.placeholder.com/200x200/A78BFA/FFFFFF?text=Album+5'
    },
    {
      id: 6,
      title: 'The Highlights',
      artist: 'The Weeknd',
      image: 'https://via.placeholder.com/200x200/F472B6/FFFFFF?text=Album+6'
    }
  ];

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

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div className="flex items-center justify-between">
        <h1 className="spotify-text-heading-large text-white">
          {greeting}, {user?.username || 'User'}
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
        <div className="spotify-grid spotify-grid-3">
          {recentMoods.map((mood) => (
            <div
              key={mood.id}
              className="spotify-card p-4"
              style={{ borderLeft: `4px solid ${mood.color}` }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="spotify-text-heading-small text-white">
                  {mood.mood}
                </h3>
                <span className="spotify-text-caption spotify-text-gray">
                  {mood.timestamp}
                </span>
              </div>
              <SpotifyButton variant="small" icon={<FaPlay />}>
                Play Mood Music
              </SpotifyButton>
            </div>
          ))}
        </div>
      </section>

      {/* Made For You Section */}
      <section>
        <h2 className="spotify-text-heading-medium text-white mb-4">
          Made For You
        </h2>
        <div className="spotify-grid spotify-grid-6">
          {recommendedAlbums.map((album) => (
            <AlbumCard
              key={album.id}
              title={album.title}
              artist={album.artist}
              image={album.image}
              onClick={() => console.log('Play album:', album.title)}
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