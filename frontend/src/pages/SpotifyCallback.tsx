import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SpotifyCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getProfile } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setError('Spotify authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received from Spotify.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Exchange code for tokens and get user profile
        await getProfile();
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Spotify callback error:', error);
        setError('Failed to complete Spotify authentication.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, getProfile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191414] to-[#1DB954]/10 flex items-center justify-center p-4">
      <div className="bg-[#232323] rounded-xl shadow-lg p-8 text-center max-w-md">
        {error ? (
          <>
            <div className="text-red-400 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-4">Authentication Failed</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="text-[#1DB954] text-6xl mb-4">🎵</div>
            <h2 className="text-2xl font-bold text-white mb-4">Connecting to Spotify</h2>
            <p className="text-gray-400 mb-6">Please wait while we complete your authentication...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DB954] mx-auto"></div>
          </>
        )}
      </div>
    </div>
  );
};

export default SpotifyCallback; 