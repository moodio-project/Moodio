import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SpotifyButton from '../components/spotify/SpotifyButton';
import { FaEdit, FaSave, FaTimes, FaUser, FaCalendar, FaSpotify, FaCog } from 'react-icons/fa';

interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string; height: number; width: number }>;
  external_urls: { spotify: string };
  followers: { total: number };
  country: string;
  product: string;
}

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [spotifyProfile, setSpotifyProfile] = useState<SpotifyProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    display_name: user?.display_name || '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMoods: 0,
    avgIntensity: 0,
    mostCommonMood: '',
    daysTracked: 0
  });

  useEffect(() => {
    fetchProfileData();
    fetchUserStats();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/spotify/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSpotifyProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/moods', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const moods = await response.json();
        const moodStats = moods.reduce((stats: any, mood: any) => {
          const moodKey = mood.mood.toLowerCase();
          stats[moodKey] = (stats[moodKey] || 0) + 1;
          return stats;
        }, {});

        setStats({
          totalMoods: moods.length,
          avgIntensity: moods.length > 0 
            ? Math.round(moods.reduce((sum: number, m: any) => sum + m.mood_intensity, 0) / moods.length)
            : 0,
          mostCommonMood: Object.keys(moodStats).length > 0 
            ? Object.entries(moodStats).sort(([,a]: any, [,b]: any) => b - a)[0][0]
            : 'None',
          daysTracked: new Set(moods.map((m: any) => new Date(m.created_at).toDateString())).size
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSave = async () => {
    try {
      // In a real app, you would update the user profile here
      console.log('Saving profile data:', editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleCancel = () => {
    setEditData({
      display_name: user?.display_name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="bg-spotify-medium-gray rounded-lg p-8 h-64"></div>
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
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-spotify-green/20 to-spotify-green/5 rounded-lg p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={spotifyProfile?.images?.[0]?.url || user?.avatar_url || 'https://via.placeholder.com/120x120/1DB954/FFFFFF?text=M'}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-spotify-green"
              />
              {user?.spotify_id && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
                  <FaSpotify className="text-black text-sm" />
                </div>
              )}
            </div>
            
            <div>
              <h1 className="spotify-text-heading-large text-white mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.display_name}
                    onChange={(e) => setEditData(prev => ({ ...prev, display_name: e.target.value }))}
                    className="spotify-input bg-transparent border-none p-0 text-2xl font-bold"
                  />
                ) : (
                  spotifyProfile?.display_name || user?.display_name || 'User'
                )}
              </h1>
              
              <p className="spotify-text-body-medium spotify-text-gray mb-1">
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                    className="spotify-input bg-transparent border-none p-0"
                  />
                ) : (
                  spotifyProfile?.email || user?.email
                )}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-spotify-text-gray">
                <span>Member since {new Date().toLocaleDateString()}</span>
                {spotifyProfile?.followers && (
                  <span>{spotifyProfile.followers.total.toLocaleString()} followers</span>
                )}
                {spotifyProfile?.product && (
                  <span className="bg-spotify-green text-black px-2 py-1 rounded-full text-xs font-semibold">
                    {spotifyProfile.product}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <SpotifyButton variant="primary" onClick={handleSave} icon={<FaSave />}>
                  Save
                </SpotifyButton>
                <SpotifyButton variant="secondary" onClick={handleCancel} icon={<FaTimes />}>
                  Cancel
                </SpotifyButton>
              </>
            ) : (
              <SpotifyButton variant="secondary" onClick={() => setIsEditing(true)} icon={<FaEdit />}>
                Edit Profile
              </SpotifyButton>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-spotify-medium-gray rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
              <FaUser className="text-black" />
            </div>
            <div>
              <p className="spotify-text-body-small spotify-text-gray">Total Moods</p>
              <p className="spotify-text-heading-medium text-white">{stats.totalMoods}</p>
            </div>
          </div>
        </div>

        <div className="bg-spotify-medium-gray rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-moodio-lavender rounded-full flex items-center justify-center">
              <span className="text-white text-xl">📊</span>
            </div>
            <div>
              <p className="spotify-text-body-small spotify-text-gray">Avg Intensity</p>
              <p className="spotify-text-heading-medium text-white">{stats.avgIntensity}/10</p>
            </div>
          </div>
        </div>

        <div className="bg-spotify-medium-gray rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-moodio-pink rounded-full flex items-center justify-center">
              <span className="text-white text-xl">😊</span>
            </div>
            <div>
              <p className="spotify-text-body-small spotify-text-gray">Most Common</p>
              <p className="spotify-text-heading-medium text-white capitalize">{stats.mostCommonMood}</p>
            </div>
          </div>
        </div>

        <div className="bg-spotify-medium-gray rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
              <FaCalendar className="text-black" />
            </div>
            <div>
              <p className="spotify-text-body-small spotify-text-gray">Days Tracked</p>
              <p className="spotify-text-heading-medium text-white">{stats.daysTracked}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-spotify-medium-gray rounded-lg p-6">
        <h2 className="spotify-text-heading-medium text-white mb-6">Account Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-spotify-border-gray">
            <div>
              <h3 className="spotify-text-body-medium text-white">Email Notifications</h3>
              <p className="spotify-text-body-small spotify-text-gray">Receive updates about your mood insights</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-spotify-border-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-spotify-green"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-spotify-border-gray">
            <div>
              <h3 className="spotify-text-body-medium text-white">Spotify Integration</h3>
              <p className="spotify-text-body-small spotify-text-gray">Sync your listening history</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="spotify-text-body-small spotify-text-gray">
                {user?.spotify_id ? 'Connected' : 'Not connected'}
              </span>
              {user?.spotify_id ? (
                <div className="w-3 h-3 bg-spotify-green rounded-full"></div>
              ) : (
                <SpotifyButton variant="small">Connect</SpotifyButton>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-spotify-border-gray">
            <div>
              <h3 className="spotify-text-body-medium text-white">Data Export</h3>
              <p className="spotify-text-body-small spotify-text-gray">Download your mood data</p>
            </div>
            <SpotifyButton variant="small">Export</SpotifyButton>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="spotify-text-body-medium text-white">Delete Account</h3>
              <p className="spotify-text-body-small spotify-text-gray">Permanently delete your account and data</p>
            </div>
            <SpotifyButton variant="small" className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
              Delete
            </SpotifyButton>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <SpotifyButton variant="secondary" icon={<FaCog />}>
          Settings
        </SpotifyButton>
        <SpotifyButton variant="secondary" onClick={logout}>
          Log Out
        </SpotifyButton>
      </div>
    </div>
  );
};

export default Profile; 