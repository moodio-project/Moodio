import React, { useState, useEffect } from 'react';
import { spotify } from '../api';

const SpotifyPlayer: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [audioFeatures, setAudioFeatures] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSpotifyData();
  }, []);

  const loadSpotifyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await spotify.getTopTracks();
      if (response.items && response.items.length > 0) {
        const track = response.items[0];
        setCurrentTrack(track);
        
        // Try to load audio features, but don't fail if it doesn't work
        try {
          const features: any = await spotify.getAudioFeatures(track.id);
          setAudioFeatures(features);
        } catch (featuresError) {
          console.warn('Could not load audio features:', featuresError);
          // Set default mood if audio features fail
          setAudioFeatures({ mood: 'energetic' });
        }
      }
    } catch (error) {
      console.error('Failed to load Spotify data:', error);
      setError('Unable to load music data');
    } finally {
      setLoading(false);
    }
  };

  const nextTrack = async () => {
    try {
      const response: any = await spotify.getTopTracks();
      if (response.items && response.items.length > 0) {
        const randomTrack = response.items[Math.floor(Math.random() * response.items.length)];
        setCurrentTrack(randomTrack);
        
        try {
          const features: any = await spotify.getAudioFeatures(randomTrack.id);
          setAudioFeatures(features);
        } catch (featuresError) {
          setAudioFeatures({ mood: 'energetic' });
        }
      }
    } catch (error) {
      console.error('Failed to change track:', error);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🎵</div>
          <p style={{ color: '#B3B3B3' }}>Loading music...</p>
        </div>
      </div>
    );
  }

  if (error || !currentTrack) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>😕</div>
          <p style={{ color: '#B3B3B3', marginBottom: '16px' }}>
            {error || 'No music available'}
          </p>
          <button 
            onClick={loadSpotifyData}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ 
      background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Spotify branding */}
      <div style={{ 
        position: 'absolute', 
        top: '12px', 
        right: '12px',
        background: 'rgba(0,0,0,0.3)',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '10px',
        color: 'white',
        fontWeight: 'bold',
        backdropFilter: 'blur(10px)'
      }}>
        SPOTIFY
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <img 
          src={currentTrack.album?.images?.[0]?.url || '/placeholder-album.png'}
          alt={currentTrack.album?.name || 'Album'}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '8px',
            objectFit: 'cover',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjMjgyODI4Ii8+CjxwYXRoIGQ9Ik00MCAyNEM0NiAyNCA1MCAyOCA1MCAzNEM1MCA0MCA0NiA0NCA0MCA0NEM0NiA0NCA1MCA0OCA1MCA1NEM1MCA2MCA0NiA2NCA0MCA2NEMzNCA2NCAzMCA2MCAzMCA1NEMzMCA0OCAzNCA0NCA0MCA0NEMzNCA0NCAzMCA0MCAzMCAzNEMzMCAyOCAzNCAyNCA0MCAyNFoiIGZpbGw9IiM1MzUzNTMiLz4KPC9zdmc+';
          }}
        />
        
        <div style={{ flex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0 0 4px 0', fontSize: '11px', fontWeight: '600', letterSpacing: '1px' }}>
            NOW PLAYING
          </p>
          <h3 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>
            {currentTrack.name || 'Unknown Track'}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '14px' }}>
            {currentTrack.artists?.[0]?.name || 'Unknown Artist'}
          </p>
          
          {/* Audio visualization bars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '12px' }}>
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: '3px',
                  height: `${Math.random() * 16 + 6}px`,
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: '2px',
                  animation: isPlaying ? `bounce ${Math.random() * 0.7 + 0.3}s infinite alternate` : 'none'
                }}
              />
            ))}
          </div>

          {/* Controls and Mood */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>

            <button
              onClick={nextTrack}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              ⏭️
            </button>
            
            {audioFeatures && (
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 10px',
                borderRadius: '15px',
                fontSize: '11px',
                color: 'white',
                fontWeight: '600',
                backdropFilter: 'blur(10px)'
              }}>
                Mood: {audioFeatures.mood || 'Energetic'}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};

export default SpotifyPlayer;