import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { aiAPI, spotifyAPI } from '../adapters/api';

const Explore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [spotifyProfile, setSpotifyProfile] = useState<any>(null);

  useEffect(() => {
    fetchRecommendations();
    fetchSpotifyProfile();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await aiAPI.getSongRecommendations('happy', 6);
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const fetchSpotifyProfile = async () => {
    try {
      const response = await spotifyAPI.getProfile();
      setSpotifyProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch Spotify profile:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await aiAPI.searchSongs(searchQuery, 10);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191414] to-[#1DB954]/10">
      {/* Header */}
      <header className="bg-[#181818] border-b border-[#222] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Explore Music</h1>
            <p className="text-gray-400">Discover new songs and artists</p>
          </div>
          {spotifyProfile && (
            <div className="flex items-center space-x-3">
              <img 
                src={spotifyProfile.images?.[0]?.url || '/default-avatar.png'} 
                alt="Profile" 
                className="w-10 h-10 rounded-full"
              />
              <span className="text-white">{spotifyProfile.display_name}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {/* Search Section */}
        <div className="bg-[#232323] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Search Songs</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search for songs, artists, or albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2 bg-[#181818] border border-[#333] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
            />
            <Button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#1DB954] hover:bg-[#1ed760] text-white"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-[#232323] rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Search Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((song, index) => (
                <div key={index} className="bg-[#181818] rounded-lg p-4 hover:bg-[#222] transition-colors">
                  <h3 className="text-white font-medium">{song.title}</h3>
                  <p className="text-gray-400 text-sm">{song.artist}</p>
                  {song.thumbnail && (
                    <img src={song.thumbnail} alt={song.title} className="w-full h-32 object-cover rounded mt-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="bg-[#232323] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">AI Recommendations</h2>
            <Button 
              onClick={fetchRecommendations}
              className="bg-[#1DB954] hover:bg-[#1ed760] text-white"
            >
              Refresh
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-[#181818] rounded-lg p-4 hover:bg-[#222] transition-colors">
                <h3 className="text-white font-medium">{rec.title}</h3>
                <p className="text-gray-400 text-sm">{rec.artist}</p>
                <p className="text-[#1DB954] text-xs mt-2">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore; 