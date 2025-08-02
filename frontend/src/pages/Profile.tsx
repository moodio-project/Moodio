import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMood } from '../contexts/MoodContext';
import SpotifyButton from '../components/spotify/SpotifyButton';
import ErrorMessage from '../components/ErrorMessage';
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendar, 
  FaCog, 
  FaDownload, 
  FaTrash, 
  FaFilter,
  FaChartLine,
  FaSpotify,
  FaSignOutAlt
} from 'react-icons/fa';

interface FilterOptions {
  dateRange: 'all' | 'week' | 'month' | 'year';
  moodType: 'all' | 'happy' | 'sad' | 'calm' | 'excited' | 'angry' | 'anxious' | 'relaxed' | 'energetic';
  intensity: 'all' | 'low' | 'medium' | 'high';
}

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { moodHistory } = useMood();
  
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    dateRange: 'all',
    moodType: 'all',
    intensity: 'all'
  });
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter mood history based on options
  const filteredMoodHistory = moodHistory.filter(mood => {
    // Date range filter
    if (filterOptions.dateRange !== 'all') {
      const moodDate = new Date(mood.created_at);
      const now = new Date();
      const timeRanges = {
        week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        year: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      };
      if (moodDate < timeRanges[filterOptions.dateRange]) {
        return false;
      }
    }

    // Mood type filter
    if (filterOptions.moodType !== 'all' && mood.mood !== filterOptions.moodType) {
      return false;
    }

    // Intensity filter
    if (filterOptions.intensity !== 'all') {
      const intensityRanges = {
        low: mood.mood_intensity <= 3,
        medium: mood.mood_intensity > 3 && mood.mood_intensity <= 7,
        high: mood.mood_intensity > 7
      };
      if (!intensityRanges[filterOptions.intensity as keyof typeof intensityRanges]) {
        return false;
      }
    }

    return true;
  });

  // Calculate profile statistics
  const profileStats = {
    totalMoods: moodHistory.length,
    averageIntensity: moodHistory.length > 0 
      ? Math.round(moodHistory.reduce((sum, mood) => sum + mood.mood_intensity, 0) / moodHistory.length * 10) / 10
      : 0,
    mostCommonMood: moodHistory.length > 0 
      ? Object.entries(
          moodHistory.reduce((acc, mood) => {
            acc[mood.mood] = (acc[mood.mood] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).sort(([,a], [,b]) => b - a)[0][0]
      : 'None',
    memberSince: 'Recently joined'
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const exportData = {
        user: {
          display_name: user?.display_name,
          email: user?.email,
          member_since: 'Recently joined'
        },
        mood_history: filteredMoodHistory,
        export_date: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moodio-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // This would typically call an API endpoint
      setError('Account deletion not implemented yet');
      setShowDeleteConfirm(false);
    } catch (err) {
      setError('Failed to delete account');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      setError('Failed to logout');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-spotify-dark-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spotify-dark-gray p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="spotify-text-heading-large text-white mb-4 flex items-center gap-3">
            <FaUser className="text-spotify-green" />
            Profile & Settings
          </h1>
          <p className="spotify-text-body-medium spotify-text-gray">
            Manage your account, view your mood history, and customize your experience.
          </p>
        </div>

        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={() => setError(null)}
            className="mb-6"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <div className="bg-spotify-medium-gray rounded-lg p-6 mb-6">
              <h2 className="spotify-text-heading-small text-white mb-4 flex items-center gap-2">
                <FaUser className="text-spotify-green" />
                Profile Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center">
                    <FaUser className="text-black text-xl" />
                  </div>
                  <div>
                    <h3 className="spotify-text-body-medium text-white">
                      {user.display_name || user.username || 'User'}
                    </h3>
                    <p className="spotify-text-body-small spotify-text-gray">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-spotify-text-gray" />
                    <div>
                      <p className="spotify-text-body-small text-white">Email</p>
                      <p className="spotify-text-caption spotify-text-gray">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FaCalendar className="text-spotify-text-gray" />
                    <div>
                      <p className="spotify-text-body-small text-white">Member Since</p>
                      <p className="spotify-text-caption spotify-text-gray">{profileStats.memberSince}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FaSpotify className="text-spotify-text-gray" />
                    <div>
                      <p className="spotify-text-body-small text-white">Spotify Connected</p>
                      <p className="spotify-text-caption spotify-text-gray">
                        {user.spotify_id ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-spotify-medium-gray rounded-lg p-6 mb-6">
              <h2 className="spotify-text-heading-small text-white mb-4 flex items-center gap-2">
                <FaChartLine className="text-spotify-green" />
                Quick Stats
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="spotify-text-body-medium text-white">Total Moods</span>
                  <span className="spotify-text-heading-small text-spotify-green">
                    {profileStats.totalMoods}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="spotify-text-body-medium text-white">Avg Intensity</span>
                  <span className="spotify-text-heading-small text-spotify-green">
                    {profileStats.averageIntensity}/10
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="spotify-text-body-medium text-white">Most Common</span>
                  <span className="spotify-text-heading-small text-spotify-green capitalize">
                    {profileStats.mostCommonMood}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-spotify-medium-gray rounded-lg p-6">
              <h2 className="spotify-text-heading-small text-white mb-4 flex items-center gap-2">
                <FaCog className="text-spotify-green" />
                Account Actions
              </h2>
              
              <div className="space-y-3">
                <SpotifyButton 
                  variant="secondary" 
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="w-full"
                >
                  <FaDownload className="mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Data'}
                </SpotifyButton>
                
                <SpotifyButton 
                  variant="secondary" 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full"
                >
                  <FaTrash className="mr-2" />
                  Delete Account
                </SpotifyButton>
                
                <SpotifyButton 
                  variant="secondary" 
                  onClick={handleLogout}
                  className="w-full"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </SpotifyButton>
              </div>
            </div>
          </div>

          {/* Mood History */}
          <div className="lg:col-span-2">
            <div className="bg-spotify-medium-gray rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="spotify-text-heading-small text-white flex items-center gap-2">
                  <FaFilter className="text-spotify-green" />
                  Mood History
                </h2>
                <span className="spotify-text-body-small spotify-text-gray">
                  {filteredMoodHistory.length} of {moodHistory.length} entries
                </span>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block spotify-text-body-small text-white mb-2">
                    Date Range
                  </label>
                  <select
                    value={filterOptions.dateRange}
                    onChange={(e) => setFilterOptions(prev => ({ 
                      ...prev, 
                      dateRange: e.target.value as FilterOptions['dateRange'] 
                    }))}
                    className="spotify-input w-full"
                  >
                    <option value="all">All Time</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>

                <div>
                  <label className="block spotify-text-body-small text-white mb-2">
                    Mood Type
                  </label>
                  <select
                    value={filterOptions.moodType}
                    onChange={(e) => setFilterOptions(prev => ({ 
                      ...prev, 
                      moodType: e.target.value as FilterOptions['moodType'] 
                    }))}
                    className="spotify-input w-full"
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
                </div>

                <div>
                  <label className="block spotify-text-body-small text-white mb-2">
                    Intensity
                  </label>
                  <select
                    value={filterOptions.intensity}
                    onChange={(e) => setFilterOptions(prev => ({ 
                      ...prev, 
                      intensity: e.target.value as FilterOptions['intensity'] 
                    }))}
                    className="spotify-input w-full"
                  >
                    <option value="all">All Intensities</option>
                    <option value="low">Low (1-3)</option>
                    <option value="medium">Medium (4-7)</option>
                    <option value="high">High (8-10)</option>
                  </select>
                </div>
              </div>

              {/* Mood History List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredMoodHistory.length > 0 ? (
                  filteredMoodHistory.map((mood) => (
                    <div key={mood.id} className="bg-spotify-border-gray rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {mood.mood === 'happy' ? '😊' : 
                             mood.mood === 'sad' ? '😢' : 
                             mood.mood === 'calm' ? '😌' : 
                             mood.mood === 'excited' ? '🤩' : 
                             mood.mood === 'angry' ? '😠' : 
                             mood.mood === 'anxious' ? '😰' : 
                             mood.mood === 'relaxed' ? '😴' : '⚡'}
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
                        <div className="text-right">
                          <p className="spotify-text-caption spotify-text-gray">
                            {new Date(mood.created_at).toLocaleDateString()}
                          </p>
                          <p className="spotify-text-caption spotify-text-gray">
                            {new Date(mood.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      {mood.note && (
                        <p className="spotify-text-body-small text-white mt-2 italic">
                          "{mood.note}"
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="spotify-text-body-medium text-white mb-2">
                      No moods found
                    </p>
                    <p className="spotify-text-body-small spotify-text-gray">
                      {moodHistory.length === 0 
                        ? 'Start logging your moods to see them here'
                        : 'Try adjusting your filters'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-spotify-medium-gray rounded-lg p-6 w-96 max-w-full mx-4">
              <h3 className="spotify-text-heading-small text-white mb-4">
                Delete Account
              </h3>
              <p className="spotify-text-body-medium spotify-text-gray mb-6">
                This action cannot be undone. All your mood data and account information will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <SpotifyButton
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </SpotifyButton>
                <SpotifyButton
                  variant="primary"
                  onClick={handleDeleteAccount}
                  className="flex-1"
                >
                  Delete Account
                </SpotifyButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 