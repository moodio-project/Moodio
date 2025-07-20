import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { aiAPI } from '../adapters/api';

const Dashboard: React.FC = () => {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const {
    spotifyProfile,
    spotifyProfileLoading,
  } = useAuth();

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const fetchRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const response = await aiAPI.getSongRecommendations('happy', 5);
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191414] to-[#1DB954]/10">
      {/* Header */}
      <header className="bg-[#181818] border-b border-[#222] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {spotifyProfileLoading ? '...' : spotifyProfile?.display_name || 'Guest'}!
            </h1>
            <p className="text-gray-400">{today}</p>
          </div>
          <Button 
            onClick={() => window.location.href = '/login'}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-white"
          >
            Log Out
          </Button>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood Summary Block */}
          <div className="bg-[#232323] rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Mood Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Today's Mood</span>
                <span className="text-[#1DB954] font-medium">😊 Happy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Mood Streak</span>
                <span className="text-[#1DB954] font-medium">5 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Total Logs</span>
                <span className="text-[#1DB954] font-medium">23</span>
              </div>
            </div>
          </div>

          {/* Currently Listening Block */}
          <div className="bg-[#232323] rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Currently Listening</h2>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[#333] rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎵</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">No track playing</p>
                <p className="text-gray-400 text-sm">Connect your Spotify to see what you're listening to</p>
              </div>
            </div>
          </div>

          {/* AI Recommendations Block */}
          <div className="bg-[#232323] rounded-xl p-6 shadow-lg lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">AI Song Recommendations</h2>
              <Button 
                onClick={fetchRecommendations}
                disabled={loadingRecommendations}
                className="bg-[#1DB954] hover:bg-[#1ed760] text-white"
              >
                {loadingRecommendations ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
            
            {loadingRecommendations ? (
              <div className="text-center py-8">
                <div className="text-[#1DB954] text-lg">Loading recommendations...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="bg-[#181818] rounded-lg p-4 hover:bg-[#222] transition-colors">
                    <h3 className="text-white font-medium">{rec.title}</h3>
                    <p className="text-gray-400 text-sm">{rec.artist}</p>
                    <p className="text-[#1DB954] text-xs mt-2">{rec.reason || rec.mood_match}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Charts Block */}
          <div className="bg-[#232323] rounded-xl p-6 shadow-lg lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4">Mood Trends</h2>
            <div className="h-64 bg-[#181818] rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Chart visualization coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 