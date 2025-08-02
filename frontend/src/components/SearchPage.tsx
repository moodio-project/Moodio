import React, { useState } from 'react';
import Navigation from './Navigation';
import { spotify } from '../api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface SearchPageProps {
  user: User;
  onLogout: () => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ user, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tracks');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results: any = await spotify.search(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#121212' }}>
      <Navigation user={user} currentPage="search" onLogout={onLogout} />
      
      <div style={{ 
        marginLeft: '240px', 
        flex: 1, 
        padding: '32px',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: 'white', fontSize: '32px', margin: '0 0 8px 0' }}>
            Search Music 🔍
          </h1>
          <p style={{ color: '#B3B3B3', margin: 0 }}>
            Discover songs, artists, and albums
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ marginBottom: '32px' }}>
          <div style={{ position: 'relative', maxWidth: '600px' }}>
            <input
              type="text"
              placeholder="Search for songs, artists, or albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: '#242424',
                border: '1px solid #535353',
                borderRadius: '500px',
                color: 'white',
                fontSize: '16px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1DB954'}
              onBlur={(e) => e.target.style.borderColor = '#535353'}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#1DB954',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {loading ? '⏳' : '🔍'}
            </button>
          </div>
        </form>

        {/* Search Results */}
        {searchResults && (
          <div>
            {/* Tabs */}
            <div style={{ 
              display: 'flex', 
              gap: '32px', 
              marginBottom: '24px',
              borderBottom: '1px solid #282828'
            }}>
              {['tracks', 'artists', 'albums'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: activeTab === tab ? '#1DB954' : '#B3B3B3',
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '16px 0',
                    cursor: 'pointer',
                    borderBottom: activeTab === tab ? '2px solid #1DB954' : 'none',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab} ({searchResults[tab]?.items?.length || 0})
                </button>
              ))}
            </div>

            {/* Results Content */}
            <div>
              {/* Tracks */}
              {activeTab === 'tracks' && (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {searchResults.tracks?.items?.map((track: any) => (
                    <div
                      key={track.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        background: '#181818',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#282828'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#181818'}
                    >
                      <img
                        src={track.album.images[0]?.url}
                        alt={track.album.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '8px',
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '16px' }}>
                          {track.name}
                        </h4>
                        <p style={{ color: '#B3B3B3', margin: '0 0 4px 0', fontSize: '14px' }}>
                          {track.artists[0].name} • {track.album.name}
                        </p>
                        <p style={{ color: '#535353', margin: 0, fontSize: '12px' }}>
                          {formatDuration(track.duration_ms)}
                        </p>
                      </div>
                      <button
                        style={{
                          background: '#1DB954',
                          border: 'none',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '16px'
                        }}
                      >
                        ▶️
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Artists */}
              {activeTab === 'artists' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                {searchResults.artists?.items?.map((artist: any) => (
                  <div
                    key={artist.id}
                    style={{
                      background: '#181818',
                      borderRadius: '8px',
                      padding: '24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: '1px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#282828';
                      e.currentTarget.style.borderColor = '#1DB954';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#181818';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    onClick={() => window.location.href = `/artist/${artist.id}`}
                  >
                    <img
                      src={artist.images[0]?.url}
                      alt={artist.name}
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginBottom: '16px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                      }}
                    />
                    <h4 style={{ color: 'white', margin: '0 0 8px 0', fontSize: '18px' }}>
                      {artist.name}
                    </h4>
                    <p style={{ color: '#B3B3B3', margin: '0 0 8px 0', fontSize: '14px' }}>
                      {artist.followers?.total?.toLocaleString()} followers
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                      {artist.genres?.slice(0, 2).map((genre: string) => (
                        <span
                          key={genre}
                          style={{
                            background: 'rgba(29, 185, 84, 0.1)',
                            color: '#1DB954',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              )}

              {/* Albums */}
              {activeTab === 'albums' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                  {searchResults.albums?.items?.map((album: any) => (
                    <div
                      key={album.id}
                      style={{
                        background: '#181818',
                        borderRadius: '8px',
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#282828'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#181818'}
                    >
                      <img
                        src={album.images[0]?.url}
                        alt={album.name}
                        style={{
                          width: '100%',
                          aspectRatio: '1',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          marginBottom: '12px'
                        }}
                      />
                      <h4 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '16px' }}>
                        {album.name}
                      </h4>
                      <p style={{ color: '#B3B3B3', margin: '0 0 4px 0', fontSize: '14px' }}>
                        {album.artists[0].name}
                      </p>
                      <p style={{ color: '#535353', margin: 0, fontSize: '12px' }}>
                        {album.release_date?.split('-')[0]} • {album.total_tracks} tracks
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!searchResults && !loading && (
          <div style={{ textAlign: 'center', padding: '64px 32px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎵</div>
            <h2 style={{ color: 'white', marginBottom: '8px' }}>Start searching</h2>
            <p style={{ color: '#B3B3B3' }}>Find your favorite songs, artists, and albums</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;