import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, spotifyLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpotifyLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      await spotifyLogin();
      // The spotifyLogin function will redirect to Spotify OAuth
    } catch (error: any) {
      setError('Spotify login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191414] to-[#1DB954]/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#1DB954] mb-2">Moodio</h1>
          <p className="text-gray-400">Track Your Mood, Discover Music</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#232323] rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-6">Welcome Back</h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#181818] border border-[#333] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#181818] border border-[#333] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold py-2 rounded-md transition disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#333]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#232323] text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Spotify Login Button */}
          <Button
            onClick={handleSpotifyLogin}
            disabled={isLoading}
            className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold py-2 rounded-md transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span className="text-xl">🎵</span>
            <span>{isLoading ? 'Connecting...' : 'Continue with Spotify'}</span>
          </Button>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#1DB954] hover:text-[#1ed760] font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 