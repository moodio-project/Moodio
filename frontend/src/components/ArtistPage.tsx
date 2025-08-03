import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import { spotify } from '../api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface ArtistPageProps {
    user: User;
    onLogout: () => void;
    spotifyToken?: string | null;
    hasPremium?: boolean;
  }

const ArtistPage: React.FC<ArtistPageProps> = ({ user, onLogout }) => {
  const { artistId } = useParams<{ artistId: string }>();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<any>(null);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [geniusData, setGeniusData] = useState<any>(null);
  const [moodAnalysis, setMoodAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);

  useEffect(() => {
    if (artistId) {
      loadEnhancedArtistData(artistId);
    }
  }, [artistId]);

  const loadEnhancedArtistData = async (id: string) => {
    setLoading(true);
    try {
      // Try enhanced data first
      const enhancedData: any = await spotify.getEnhancedArtist(id);
      
      setArtist(enhancedData.spotify);
      setTopTracks(enhancedData.spotify.top_tracks || []);
      setGeniusData(enhancedData.genius);
      setMoodAnalysis(enhancedData.mood_analysis);
    } catch (error) {
      console.error('Enhanced data failed, falling back to basic data:', error);
      
      // Fallback to basic Spotify data
      try {
        const [artistData, topTracksData] = await Promise.all([
          spotify.getArtist(id),
          spotify.getArtistTopTracks(id)
        ]);

        setArtist(artistData as any);
        setTopTracks((topTracksData as any).tracks || []);
      } catch (fallbackError) {
        console.error('Failed to load artist data:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
  };

  const getMoodFromPopularity = (popularity: number) => {
    if (popularity >= 90) return { mood: 'energetic', color: '#FF6B6B', emoji: '⚡' };
    if (popularity >= 80) return { mood: 'happy', color: '#4ECDC4', emoji: '😊' };
    if (popularity >= 70) return { mood: 'calm', color: '#45B7D1', emoji: '😌' };
    if (popularity >= 60) return { mood: 'sad', color: '#96CEB4', emoji: '😢' };
    return { mood: 'chill', color: '#FECA57', emoji: '😴' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#121212' }}>
        <Navigation user={user} currentPage="search" onLogout={onLogout} />
        <div style={{ 
          marginLeft: '240px', 
          flex: 1, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
            <h2 style={{ color: '#1DB954', margin: '0 0 8px 0' }}>Loading Artist...</h2>
            <p style={{ color: '#B3B3B3', margin: 0 }}>Getting enhanced insights</p>
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#121212' }}>
        <Navigation user={user} currentPage="search" onLogout={onLogout} />
        <div style={{ 
          marginLeft: '240px', 
          flex: 1, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
            <h2 style={{ color: 'white', margin: '0 0 8px 0' }}>Artist Not Found</h2>
            <button 
              onClick={() => navigate('/search')}
              className="btn-primary"
              style={{ marginTop: '16px' }}
            >
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
      
      <div style={{ 
        marginLeft: '240px', 
        flex: 1, 
        minHeight: '100vh'
      }}>
        {/* Hero Section with Enhanced Gradient */}
        <div style={{
          background: `linear-gradient(180deg, rgba(29, 185, 84, 0.8) 0%, rgba(18, 18, 18, 0.8) 70%), url('${artist.images?.[0]?.url}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '64px 32px',
          position: 'relative'
        }}>
          <button
            onClick={() => navigate('/search')}
            style={{
              position: 'absolute',
              top: '24px',
              left: '32px',
              background: 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px',
              color: 'white',
              backdropFilter: 'blur(10px)'
            }}
          >
            ←
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '32px' }}>
            <img
              src={artist.images?.[0]?.url}
              alt={artist.name}
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                objectFit: 'cover',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                border: '4px solid rgba(255, 255, 255, 0.2)'
              }}
            />
            
            <div style={{ flex: 1 }}>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                margin: '0 0 8px 0', 
                fontSize: '14px', 
                fontWeight: '600',
                letterSpacing: '1px'
              }}>
                ARTIST
              </p>
              <h1 style={{ 
                color: 'white', 
                fontSize: '48px', 
                margin: '0 0 16px 0',
                fontWeight: 'bold',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.7)'
              }}>
                {artist.name}
              </h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  margin: 0, 
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  {formatFollowers(artist.followers?.total || 0)} followers
                </p>
                
                {/* Mood Analysis Badge */}
                {moodAnalysis && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '16px' }}>🎭</span>
                    <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
                      {moodAnalysis.dominantMood}
                    </span>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {artist.genres?.slice(0, 3).map((genre: string) => (
                    <span
                      key={genre}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backdropFilter: 'blur(10px)',
                        textTransform: 'capitalize'
                      }}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ padding: '32px' }}>
          
          {/* Enhanced Artist Bio Section */}
          <div className="card" style={{ marginBottom: '32px' }}>
            <h2 style={{ color: 'white', marginBottom: '16px', fontSize: '24px' }}>
              About {artist.name}
            </h2>
            
            {geniusData && geniusData.description ? (
              <div>
                <p style={{ color: '#B3B3B3', lineHeight: '1.6', fontSize: '16px', marginBottom: '16px' }}>
                  {geniusData.description.substring(0, 300)}
                  {geniusData.description.length > 300 && '...'}
                </p>
                
                {/* Social Links */}
                {(geniusData.social.twitter || geniusData.social.instagram || geniusData.social.facebook) && (
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    {geniusData.social.twitter && (
                      <a 
                        href={`https://twitter.com/${geniusData.social.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#1DB954', textDecoration: 'none' }}
                      >
                        🐦 Twitter
                      </a>
                    )}
                    {geniusData.social.instagram && (
                      <a 
                        href={`https://instagram.com/${geniusData.social.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#1DB954', textDecoration: 'none' }}
                      >
                        📷 Instagram
                      </a>
                    )}
                    {geniusData.social.facebook && (
                      <a 
                        href={`https://facebook.com/${geniusData.social.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#1DB954', textDecoration: 'none' }}
                      >
                        📘 Facebook
                      </a>
                    )}
                  </div>
                )}
                
                {/* Genius Stats */}
                {geniusData.stats && (
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    {geniusData.stats.followers && (
                      <span style={{ color: '#B3B3B3', fontSize: '14px' }}>
                        🔥 {formatFollowers(geniusData.stats.followers)} Genius followers
                      </span>
                    )}
                    {geniusData.stats.genius_url && (
                      <a 
                        href={geniusData.stats.genius_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#1DB954', textDecoration: 'none', fontSize: '14px' }}
                      >
                        View on Genius →
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#B3B3B3', lineHeight: '1.6', fontSize: '16px' }}>
                    {artist.name} is one of the most influential artists in {artist.genres?.[0] || 'music'} with over {formatFollowers(artist.followers?.total || 0)} followers on Spotify. 
                    Known for their unique sound that blends {artist.genres?.slice(0, 2).join(' and ') || 'various genres'}, 
                    they've captivated audiences worldwide with their {artist.popularity >= 85 ? 'chart-topping hits' : 'distinctive musical style'}.
                  </p>
                  {moodAnalysis && (
                    <p style={{ color: '#B3B3B3', lineHeight: '1.6', fontSize: '16px', marginTop: '16px' }}>
                      Their music often evokes <strong style={{ color: '#1DB954' }}>{moodAnalysis.dominantMood.toLowerCase()}</strong> feelings, 
                      with an average positivity of <strong>{Math.round(moodAnalysis.averageValence * 100)}%</strong> and 
                      energy level of <strong>{Math.round(moodAnalysis.averageEnergy * 100)}%</strong>.
                    </p>
                  )}
                </div>
                
                {moodAnalysis && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: getMoodFromPopularity(artist.popularity).color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      marginBottom: '12px',
                      margin: '0 auto 12px auto'
                    }}>
                      {getMoodFromPopularity(artist.popularity).emoji}
                    </div>
                    <p style={{ color: 'white', fontWeight: '600', fontSize: '14px', margin: '0 0 4px 0' }}>
                      Mood Vibe
                    </p>
                    <p style={{ color: getMoodFromPopularity(artist.popularity).color, fontSize: '12px', margin: 0, textTransform: 'capitalize' }}>
                      {moodAnalysis.dominantMood}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Top Tracks */}
          <div className="card">
            <h2 style={{ color: 'white', marginBottom: '24px', fontSize: '24px' }}>
              Popular Tracks
            </h2>
            
            {topTracks.length === 0 ? (
              <p style={{ color: '#B3B3B3', textAlign: 'center', padding: '32px' }}>
                No tracks available for this artist.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {topTracks.map((track: any, index: number) => {
                  const trackMood = getMoodFromPopularity(track.popularity || 75);
                  return (
                    <div
                      key={track.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        background: playingTrack === track.id ? 'rgba(29, 185, 84, 0.1)' : '#181818',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: playingTrack === track.id ? '1px solid #1DB954' : '1px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (playingTrack !== track.id) {
                          e.currentTarget.style.background = '#282828';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (playingTrack !== track.id) {
                          e.currentTarget.style.background = '#181818';
                        }
                      }}
                      onClick={() => setPlayingTrack(playingTrack === track.id ? null : track.id)}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: playingTrack === track.id ? '#1DB954' : '#B3B3B3',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {playingTrack === track.id ? '⏸️' : index + 1}
                      </div>

                      <img
                        src={track.album?.images?.[0]?.url}
                        alt={track.album?.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '4px',
                          objectFit: 'cover'
                        }}
                      />

                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          color: playingTrack === track.id ? '#1DB954' : 'white', 
                          margin: '0 0 4px 0', 
                          fontSize: '16px',
                          fontWeight: '600'
                        }}>
                          {track.name}
                        </h4>
                        <p style={{ color: '#B3B3B3', margin: 0, fontSize: '14px' }}>
                          {track.album?.name}
                        </p>
                      </div>

                      <div style={{
                        background: `${trackMood.color}20`,
                        color: trackMood.color,
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {trackMood.mood}
                      </div>

                      <p style={{ color: '#B3B3B3', margin: 0, fontSize: '14px', minWidth: '40px' }}>
                        {formatDuration(track.duration_ms || 180000)}
                      </p>

                      <button
                        style={{
                          background: playingTrack === track.id ? '#1DB954' : 'rgba(255, 255, 255, 0.1)',
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
                        {playingTrack === track.id ? '⏸️' : '▶️'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistPage;