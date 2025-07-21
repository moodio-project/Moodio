import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SpotifyButton, { SpotifyOAuthButton } from '../components/spotify/SpotifyButton';
import { FaArrowRight } from 'react-icons/fa';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, spotifyLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSpotifyLoading, setIsSpotifyLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: 'Invalid email or password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpotifyLogin = async () => {
    setIsSpotifyLoading(true);
    try {
      await spotifyLogin();
    } catch (error) {
      setErrors({ general: 'Spotify login failed. Please try again.' });
    } finally {
      setIsSpotifyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-spotify-black flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-spotify-green/5 via-transparent to-spotify-green/5" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-32 h-32 bg-spotify-green/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-spotify-green/10 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-spotify-green rounded-sm flex items-center justify-center">
                <span className="text-2xl font-bold text-black">M</span>
              </div>
              <h1 className="spotify-text-heading-large text-white">Moodio</h1>
            </div>
          </Link>
          <p className="spotify-text-body-large spotify-text-gray">
            Your Music, Your Mood, Your Story
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-spotify-medium-gray rounded-lg p-8 shadow-lg border border-spotify-border-gray">
          <div className="text-center mb-8">
            <h2 className="spotify-text-heading-medium text-white mb-2">Log in to Moodio</h2>
            <p className="spotify-text-body-medium spotify-text-gray">
              Track your emotions through music
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block spotify-text-body-medium text-white mb-2">
                Email address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="spotify-input w-full"
                placeholder="Enter your email"
                required
              />
              {errors.email && (
                <p className="mt-1 spotify-text-body-small text-moodio-pink">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block spotify-text-body-medium text-white mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="spotify-input w-full"
                placeholder="Enter your password"
                required
              />
              {errors.password && (
                <p className="mt-1 spotify-text-body-small text-moodio-pink">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="spotify-text-body-small text-spotify-text-gray hover:text-white transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="bg-moodio-pink/10 border border-moodio-pink/20 rounded-md p-4">
                <p className="spotify-text-body-small text-moodio-pink">
                  {errors.general}
                </p>
              </div>
            )}

            {/* Login Button */}
            <SpotifyButton
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  <span>Logging in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span>Log in</span>
                  <FaArrowRight className="text-sm" />
                </div>
              )}
            </SpotifyButton>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-spotify-border-gray" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-spotify-medium-gray spotify-text-gray">or</span>
              </div>
            </div>

            {/* Spotify Login */}
            <div className="space-y-4">
              <SpotifyOAuthButton
                onClick={handleSpotifyLogin}
                loading={isSpotifyLoading}
                text="Continue with Spotify"
              />
              
              <p className="text-center spotify-text-body-small spotify-text-gray">
                Connect your Spotify account to unlock personalized mood insights
              </p>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-6 border-t border-spotify-border-gray">
              <p className="spotify-text-body-medium spotify-text-gray">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-white hover:text-spotify-green font-semibold transition-colors"
                >
                  Sign up for Moodio
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="spotify-text-body-small spotify-text-gray">
            Track your emotions through music and discover how your listening habits shape your well-being
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 