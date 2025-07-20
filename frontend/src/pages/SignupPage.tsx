import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

const SignupPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, spotifyLogin } = useAuth();
  const navigate = useNavigate();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await register(username, email, password);
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpotifySignup = async () => {
    setIsLoading(true);
    setError('');

    try {
      await spotifyLogin();
      // The spotifyLogin function will redirect to Spotify OAuth
    } catch (error: any) {
      setError('Spotify signup failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191414] to-[#1DB954]/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#1DB954] mb-2">Moodio</h1>
          <p className="text-gray-400">Join the music mood journey</p>
        </div>

        {/* Signup Card */}
        <div className="bg-[#232323] rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-6">Create Account</h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4 mb-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#181818] border border-[#333] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
                placeholder="Choose a username"
              />
            </div>

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
                placeholder="Create a password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#181818] border border-[#333] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
                placeholder="Confirm your password"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold py-2 rounded-md transition disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#333]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#232323] text-gray-400">Or sign up with</span>
            </div>
          </div>

          {/* Spotify Signup Button */}
          <Button
            onClick={handleSpotifySignup}
            disabled={isLoading}
            className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold py-2 rounded-md transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span className="text-xl">🎵</span>
            <span>{isLoading ? 'Connecting...' : 'Sign up with Spotify'}</span>
          </Button>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-[#1DB954] hover:text-[#1ed760] font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 