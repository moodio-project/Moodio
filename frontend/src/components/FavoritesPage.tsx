import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { favorites } from '../api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface FavoritesPageProps {
  user: User;
  onLogout: () => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ user, onLogout }) => {
  const [userFavorites, setUserFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await favorites.getAll() as any;
      setUserFavorites(response.favorites || []);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const playTrack = (trackUri: string, trackName: string) => {
    if ((window as any).moodioPlayTrack) {
      (window as any).moodioPlayTrack(trackUri);
      console.log('🎵 Playing favorite track:', trackName);
    } else {
      alert('Music player not ready. Please wait a moment and try again.');
    }
  };

  const removeFavorite = async (trackId: string) => {
    try {
      await favorites.remove(trackId);
      setUserFavorites(prev => prev.filter(fav => fav.item_id !== trackId));
      console.log('💔 Removed from favorites');
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#121212' }}>
        <Navigation user={user} currentPage="favorites" onLogout={onLogout} />
        <div style={{ 
          marginLeft: '240px', 
          flex: 1, 
          padding: '32px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ color: '#B3B3B3' }}>Loading your favorites...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#121212' }}>
      <Navigation user={user} currentPage="favorites" onLogout={onLogout} />
      
      <div style={{ 
        marginLeft: '240px', 
        flex: 1, 
        padding: '32px'
      }}>
        <div style={{
          background: '#1E1E1E',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ color: 'white', fontSize: '32px', margin: '0 0 8px 0' }}>
              Your Favorites ❤️
            </h1>
            <p style={{ color: '#B3B3B3', margin: 0, fontSize: '16px' }}>
              {userFavorites.length} saved tracks
            </p>
          </div>

          {userFavorites.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {userFavorites.map((favorite: any) => (
                <div
                  key={favorite.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: '#181818',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#282828'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#181818'}
                >
                  <img
                    src={favorite.artwork_url}
                    alt={favorite.album_name}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '4px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '16px' }}>
                      {favorite.item_name}
                    </h4>
                    <p style={{ color: '#B3B3B3', margin: 0, fontSize: '14px' }}>
                      {favorite.artist_name} • {favorite.album_name}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => removeFavorite(favorite.item_id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#FF6B6B',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '4px'
                      }}
                      title="Remove from favorites"
                    >
                      💔
                    </button>
                    <button
                      onClick={() => playTrack(favorite.track_uri, favorite.item_name)}
                      style={{
                        background: '#22C55E',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      ▶️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '64px 32px',
              color: '#B3B3B3'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
              <h3 style={{ color: 'white', marginBottom: '8px' }}>No favorites yet</h3>
              <p>Start adding songs to your favorites by clicking the heart button!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;