import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../api';

interface SpotifyCallbackProps {
  onLogin: (user: any, token: string) => void;
}

const SpotifyCallback: React.FC<SpotifyCallbackProps> = ({ onLogin }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Spotify authentication was cancelled or failed');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (code) {
      handleSpotifyCallback(code);
    } else {
      setError('No authorization code received');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [searchParams, navigate]);

  const handleSpotifyCallback = async (code: string) => {
    try {
      const response: any = await auth.spotifyExchange(code);
      onLogin(response.user, response.token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to exchange Spotify code:', error);
      setError('Failed to complete Spotify authentication');
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#121212', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        {error ? (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
            <h2 style={{ color: '#F472B6', margin: '0 0 8px 0' }}>Authentication Error</h2>
            <p style={{ color: '#B3B3B3', margin: '0 0 16px 0' }}>{error}</p>
            <p style={{ color: '#535353', fontSize: '14px' }}>Redirecting to login...</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
            <h2 style={{ color: '#1DB954', margin: '0 0 8px 0' }}>Connecting to Spotify...</h2>
            <p style={{ color: '#B3B3B3', margin: 0 }}>Setting up your musical journey</p>
          </>
        )}
      </div>
    </div>
  );
};

export default SpotifyCallback;