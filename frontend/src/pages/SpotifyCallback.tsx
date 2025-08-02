import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SpotifyCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithSpotify } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        console.error('Spotify authentication error:', error);
        navigate('/login?error=auth_failed');
        return;
      }

      if (token) {
        // Store the Spotify access token
        localStorage.setItem('spotify_token', token);
        
        try {
          // Login the user with the token
          await loginWithSpotify(token);
          navigate('/dashboard');
        } catch (error) {
          console.error('Failed to login with Spotify token:', error);
          navigate('/login?error=login_failed');
        }
      } else {
        console.error('No token received from Spotify');
        navigate('/login?error=no_token');
      }
    };

    handleCallback();
  }, [searchParams, navigate, loginWithSpotify]);

  return (
    <div className="min-h-screen bg-spotify-dark-gray flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
        <p className="text-white">Connecting to Spotify...</p>
      </div>
    </div>
  );
};

export default SpotifyCallback; 