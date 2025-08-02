import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SpotifyButton, { SpotifyOAuthButton } from '../components/spotify/SpotifyButton';
import { FaArrowRight } from 'react-icons/fa';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, spotifyLogin } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSpotifyLoading, setIsSpotifyLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { score: 0, label: '', color: '' };
    if (password.length < 6) return { score: 1, label: 'Weak', color: '#F472B6' };
    if (password.length < 8) return { score: 2, label: 'Fair', color: '#F59E0B' };
    if (password.length < 10) return { score: 3, label: 'Good', color: '#A78BFA' };
    return { score: 4, label: 'Strong', color: '#22C55E' };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the Terms of Service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpotifySignup = async () => {
    setIsSpotifyLoading(true);
    try {
      await spotifyLogin();
    } catch (error) {
      setErrors({ general: 'Spotify signup failed. Please try again.' });
    } finally {
      setIsSpotifyLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

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

        {/* Signup Card */}
        <div className="bg-spotify-medium-gray rounded-lg p-8 shadow-lg border border-spotify-border-gray">
          <div className="text-center mb-8">
            <h2 className="spotify-text-heading-medium text-white mb-2">Join Moodio</h2>
            <p className="spotify-text-body-medium spotify-text-gray">
              Create your account to start tracking your musical journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="block spotify-text-body-medium text-white mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="spotify-input w-full"
                placeholder="Choose a username"
                required
              />
              {errors.username && (
                <p className="mt-1 spotify-text-body-small text-moodio-pink">
                  {errors.username}
                </p>
              )}
            </div>

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
                placeholder="Create a password"
                required
              />
              {errors.password && (
                <p className="mt-1 spotify-text-body-small text-moodio-pink">
                  {errors.password}
                </p>
              )}
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength.score 
                            ? `bg-[${passwordStrength.color}]` 
                            : 'bg-spotify-border-gray'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="spotify-text-body-small spotify-text-gray">
                    Password strength: <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block spotify-text-body-medium text-white mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="spotify-input w-full"
                placeholder="Confirm your password"
                required
              />
              {errors.confirmPassword && (
                <p className="mt-1 spotify-text-body-small text-moodio-pink">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms of Service */}
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-spotify-green bg-spotify-medium-gray border-spotify-border-gray rounded focus:ring-spotify-green focus:ring-2"
                />
                <span className="spotify-text-body-small spotify-text-gray leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" className="text-spotify-green hover:text-spotify-green-hover">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-spotify-green hover:text-spotify-green-hover">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="spotify-text-body-small text-moodio-pink flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-moodio-pink rounded-full" />
                  {errors.terms}
                </p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="bg-moodio-pink/10 border border-moodio-pink/20 rounded-md p-4">
                <p className="spotify-text-body-small text-moodio-pink">
                  {errors.general}
                </p>
              </div>
            )}

            {/* Create Account Button */}
            <SpotifyButton
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span>Create Account</span>
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

            {/* Spotify Signup */}
            <div className="space-y-4">
              <SpotifyOAuthButton
                onClick={handleSpotifySignup}
                loading={isSpotifyLoading}
                text="Sign up with Spotify"
              />
              
              <p className="text-center spotify-text-body-small spotify-text-gray">
                Connect your Spotify account to unlock personalized mood insights
              </p>
            </div>

            {/* Login Link */}
            <div className="text-center pt-6 border-t border-spotify-border-gray">
              <p className="spotify-text-body-medium spotify-text-gray">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-white hover:text-spotify-green font-semibold transition-colors"
                >
                  Sign in
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

export default SignupPage; 