import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import FormInput from '../components/auth/FormInput';
import SpotifyButton from '../components/auth/SpotifyButton';
import { Button } from '../components/ui/button';
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
    // Clear error when user starts typing
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
    <AuthLayout 
      title="Join Moodio" 
      subtitle="Create your account to start tracking your musical journey"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Input */}
        <FormInput
          type="text"
          label="Username"
          value={formData.username}
          onChange={(value) => handleInputChange('username', value)}
          error={errors.username}
          placeholder="Choose a username"
          required
          autoComplete="username"
        />

        {/* Email Input */}
        <FormInput
          type="email"
          label="Email Address"
          value={formData.email}
          onChange={(value) => handleInputChange('email', value)}
          error={errors.email}
          placeholder="Enter your email"
          required
          autoComplete="email"
        />

        {/* Password Input */}
        <div className="space-y-2">
          <FormInput
            type="password"
            label="Password"
            value={formData.password}
            onChange={(value) => handleInputChange('password', value)}
            error={errors.password}
            placeholder="Create a password"
            required
            autoComplete="new-password"
          />
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="space-y-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      level <= passwordStrength.score 
                        ? `bg-[${passwordStrength.color}]` 
                        : 'bg-[#404040]'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-[#B3B3B3]">
                Password strength: <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password Input */}
        <FormInput
          type="password"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={(value) => handleInputChange('confirmPassword', value)}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
          required
          autoComplete="new-password"
        />

        {/* Terms of Service */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-[#22C55E] bg-[#2A2A2A] border-[#404040] rounded focus:ring-[#A78BFA] focus:ring-2"
            />
            <span className="text-sm text-[#B3B3B3] leading-relaxed">
              I agree to the{' '}
              <Link to="/terms" className="text-[#A78BFA] hover:text-[#C4B5FD]">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-[#A78BFA] hover:text-[#C4B5FD]">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && (
            <p className="text-sm text-[#F472B6] flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#F472B6] rounded-full" />
              {errors.terms}
            </p>
          )}
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="bg-[#F472B6]/10 border border-[#F472B6]/20 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#F472B6] rounded-full" />
              <span className="text-sm text-[#F472B6]">{errors.general}</span>
            </div>
          </div>
        )}

        {/* Create Account Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold py-4 text-lg rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              <span>Creating Account...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span>Create Account</span>
              <FaArrowRight className="text-sm" />
            </div>
          )}
        </Button>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#404040]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#1E1E1E] text-[#B3B3B3]">or</span>
          </div>
        </div>

        {/* Spotify Signup */}
        <div className="space-y-4">
          <SpotifyButton
            onClick={handleSpotifySignup}
            isLoading={isSpotifyLoading}
            text="Sign up with Spotify"
          />
          
          <p className="text-center text-xs text-[#B3B3B3]">
            Connect your Spotify account to unlock personalized mood insights
          </p>
        </div>

        {/* Login Link */}
        <div className="text-center pt-6 border-t border-[#2A2A2A]">
          <p className="text-[#B3B3B3] text-sm">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-[#A78BFA] hover:text-[#C4B5FD] font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignupPage; 