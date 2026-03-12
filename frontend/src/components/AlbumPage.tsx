import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import { spotify } from '../api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AlbumPageProps {
  user: User;
  onLogout: () => void;
}

const AlbumPage: React.FC<AlbumPageProps> = ({ user, onLogout }) => {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);

  useEffect(() => {
    if (albumId) loadAlbum(albumId);
  }, [albumId]);

  const loadAlbum = async (id: string) => {
    try {
      const data: any = await spotify.getAlbumTracks(id);
      setAlbum(data.album);
      setTracks(data.tracks);
    } catch (error) {
      console.error('Failed to load album:', error);
    } finally {
      setLoading(false);
    }
  };

  const playTrack = (trackUri: string, trackId: string) => {
    if ((window as any).moodioPlayTrack) {
      (window as any).moodioPlayTrack(trackUri);
      setPlayingTrack(trackId);
    } else {
      alert('Music player not ready. Please wait a moment and try again.');
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#121212' }}>
        <Navigation user={user} currentPage="search" onLogout={onLogout} />
        <div style={{ marginLeft: '240px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
            <h2 style={{ color: '#1DB954', margin: '0 0 8px 0' }}>Loading Album...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#121212' }}>
        <Navigation user={user} currentPage="search" onLogout={onLogout} />
        <div style={{ marginLeft: '240px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <h2>Album not found</h2>
            <button onClick={() => navigate('/search')} style={{ marginTop: '16px', padding: '8px 16px', background: '#1DB954', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#121212' }}>
      <Navigation user={user} currentPage="search" onLogout={onLogout} />

      <div style={{ marginLeft: '240px', flex: 1, minHeight: '100vh' }}>
        {/* Album Hero */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(29,185,84,0.4) 0%, #121212 100%)',
          padding: '48px 32px 32px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '32px'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              position: 'absolute',
              top: '24px',
              left: '272px',
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ←
          </button>
          <img
            src={album.images?.[0]?.url}
            alt={album.name}
            style={{ width: '200px', height: '200px', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', objectFit: 'cover' }}
          />
          <div>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Album
            </p>
            <h1 style={{ color: 'white', fontSize: '40px', margin: '0 0 12px 0', fontWeight: 'bold' }}>
              {album.name}
            </h1>
            <p style={{ color: '#B3B3B3', margin: 0, fontSize: '14px' }}>
              {album.artists?.map((a: any) => a.name).join(', ')} • {album.release_date?.split('-')[0]} • {album.total_tracks} tracks
            </p>
          </div>
        </div>

        {/* Track List */}
        <div style={{ padding: '24px 32px' }}>
          <div style={{ display: 'grid', gap: '4px' }}>
            {tracks.map((track: any, index: number) => (
              <div
                key={track.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  background: playingTrack === track.id ? 'rgba(29,185,84,0.1)' : 'transparent',
                  border: playingTrack === track.id ? '1px solid rgba(29,185,84,0.3)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => { if (playingTrack !== track.id) e.currentTarget.style.background = '#1a1a1a'; }}
                onMouseLeave={(e) => { if (playingTrack !== track.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ color: playingTrack === track.id ? '#1DB954' : '#B3B3B3', fontSize: '14px', minWidth: '20px', textAlign: 'right' }}>
                  {playingTrack === track.id ? '♫' : index + 1}
                </span>

                <div style={{ flex: 1 }}>
                  <h4 style={{ color: playingTrack === track.id ? '#1DB954' : 'white', margin: '0 0 2px 0', fontSize: '15px' }}>
                    {track.name}
                  </h4>
                  <p style={{ color: '#B3B3B3', margin: 0, fontSize: '13px' }}>
                    {track.artists?.map((a: any) => a.name).join(', ')}
                  </p>
                </div>

                <span style={{ color: '#B3B3B3', fontSize: '13px', minWidth: '40px' }}>
                  {formatDuration(track.duration_ms)}
                </span>

                <button
                  onClick={() => playTrack(track.uri, track.id)}
                  style={{
                    background: playingTrack === track.id ? '#1DB954' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: 'white',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#1DB954'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = playingTrack === track.id ? '#1DB954' : 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  ▶
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumPage;
