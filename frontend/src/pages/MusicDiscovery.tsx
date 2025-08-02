import React, { useState } from 'react';
import { useMusic } from '../contexts/MusicContext';
import SpotifyButton from '../components/spotify/SpotifyButton';
import { FaSearch, FaPlay, FaHeart, FaPlus } from 'react-icons/fa';

const MusicDiscovery: React.FC = () => {
  const { searchMusic, searchResults, topTracks, recentlyPlayed, isLoading } = useMusic();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'track' | 'artist' | 'album'>('track');
  const [activeTab, setActiveTab] = useState<'search' | 'top' | 'recent'>('search');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchMusic(searchQuery, searchType);
    }
  };

  const renderTrackCard = (track: any, index: number) => (
    <div key={track.id || index} className="bg-spotify-medium-gray rounded-lg p-4 hover:bg-spotify-light-gray transition-colors">
      <div className="flex items-center gap-4 mb-3">
        <img
          src={track.album?.images[0]?.url || 'https://via.placeholder.com/60x60'}
          alt={track.name}
          className="w-15 h-15 rounded object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="spotify-text-body-medium text-white truncate">
            {track.name}
          </h3>
          <p className="spotify-text-body-small spotify-text-gray truncate">
            {track.artists?.map((a: any) => a.name).join(', ')}
          </p>
          <p className="spotify-text-caption spotify-text-gray truncate">
            {track.album?.name}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <SpotifyButton variant="small" onClick={() => {}}>
          <FaPlay />
        </SpotifyButton>
        <SpotifyButton variant="small" onClick={() => {}}>
          <FaHeart />
        </SpotifyButton>
        <SpotifyButton variant="small" onClick={() => {}}>
          <FaPlus />
        </SpotifyButton>
      </div>
    </div>
  );

  const renderArtistCard = (artist: any, index: number) => (
    <div key={artist.id || index} className="bg-spotify-medium-gray rounded-lg p-4 hover:bg-spotify-light-gray transition-colors">
      <div className="text-center">
        <img
          src={artist.images?.[0]?.url || 'https://via.placeholder.com/120x120'}
          alt={artist.name}
          className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
        />
        <h3 className="spotify-text-body-medium text-white mb-1">
          {artist.name}
        </h3>
        <p className="spotify-text-caption spotify-text-gray mb-3">
          {artist.genres?.slice(0, 2).join(', ')}
        </p>
        <div className="flex gap-2 justify-center">
          <SpotifyButton variant="small" onClick={() => {}}>
            <FaHeart />
          </SpotifyButton>
          <SpotifyButton variant="small" onClick={() => {}}>
            <FaPlus />
          </SpotifyButton>
        </div>
      </div>
    </div>
  );

  const renderAlbumCard = (album: any, index: number) => (
    <div key={album.id || index} className="bg-spotify-medium-gray rounded-lg p-4 hover:bg-spotify-light-gray transition-colors">
      <div className="text-center">
        <img
          src={album.images?.[0]?.url || 'https://via.placeholder.com/120x120'}
          alt={album.name}
          className="w-24 h-24 rounded mx-auto mb-3 object-cover"
        />
        <h3 className="spotify-text-body-medium text-white mb-1">
          {album.name}
        </h3>
        <p className="spotify-text-caption spotify-text-gray mb-3">
          {album.artists?.map((a: any) => a.name).join(', ')}
        </p>
        <div className="flex gap-2 justify-center">
          <SpotifyButton variant="small" onClick={() => {}}>
            <FaHeart />
          </SpotifyButton>
          <SpotifyButton variant="small" onClick={() => {}}>
            <FaPlus />
          </SpotifyButton>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-spotify-dark-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-white">Loading music...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spotify-dark-gray p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="spotify-text-heading-large text-white mb-4">
            Discover Music
          </h1>
          <p className="spotify-text-body-medium spotify-text-gray">
            Search for tracks, artists, and albums. Find new music that matches your mood.
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-spotify-medium-gray rounded-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for tracks, artists, or albums..."
                  className="spotify-input w-full"
                />
              </div>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'track' | 'artist' | 'album')}
                className="spotify-input bg-spotify-border-gray"
              >
                <option value="track">Tracks</option>
                <option value="artist">Artists</option>
                <option value="album">Albums</option>
              </select>
              <SpotifyButton type="submit" variant="primary">
                <FaSearch className="mr-2" />
                Search
              </SpotifyButton>
            </div>
          </form>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'search'
                ? 'bg-spotify-green text-black'
                : 'bg-spotify-border-gray text-white hover:bg-spotify-light-gray'
            }`}
          >
            Search Results
          </button>
          <button
            onClick={() => setActiveTab('top')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'top'
                ? 'bg-spotify-green text-black'
                : 'bg-spotify-border-gray text-white hover:bg-spotify-light-gray'
            }`}
          >
            Top Tracks
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'recent'
                ? 'bg-spotify-green text-black'
                : 'bg-spotify-border-gray text-white hover:bg-spotify-light-gray'
            }`}
          >
            Recently Played
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'search' && (
            <div>
              <h2 className="spotify-text-heading-small text-white mb-4">
                Search Results
              </h2>
              {searchQuery ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {searchType === 'track' && searchResults.tracks.map(renderTrackCard)}
                  {searchType === 'artist' && searchResults.artists.map(renderArtistCard)}
                  {searchType === 'album' && searchResults.albums.map(renderAlbumCard)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="spotify-text-body-medium text-white mb-2">
                    Start searching for music
                  </p>
                  <p className="spotify-text-body-small spotify-text-gray">
                    Enter a search term above to discover new tracks, artists, and albums
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'top' && (
            <div>
              <h2 className="spotify-text-heading-small text-white mb-4">
                Your Top Tracks
              </h2>
              {topTracks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {topTracks.map(renderTrackCard)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🎵</div>
                  <p className="spotify-text-body-medium text-white mb-2">
                    No top tracks available
                  </p>
                  <p className="spotify-text-body-small spotify-text-gray">
                    Your top tracks will appear here based on your listening history
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'recent' && (
            <div>
              <h2 className="spotify-text-heading-small text-white mb-4">
                Recently Played
              </h2>
              {recentlyPlayed.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {recentlyPlayed.map(renderTrackCard)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">⏰</div>
                  <p className="spotify-text-body-medium text-white mb-2">
                    No recent tracks
                  </p>
                  <p className="spotify-text-body-small spotify-text-gray">
                    Your recently played tracks will appear here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicDiscovery; 