import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpotifyLoading, setIsSpotifyLoading] = useState(false);
  const { login, spotifyLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for error from OAuth callback
  React.useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'auth_failed') {
      setError('Spotify authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpotifyLogin = async () => {
    setError('');
    setIsSpotifyLoading(true);

    try {
      await spotifyLogin();
    } catch (err) {
      setError('Failed to connect to Spotify. Please try again.');
      setIsSpotifyLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to Moodio</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {/* Spotify Login Button */}
        <div className="spotify-login-section">
          <button 
            onClick={handleSpotifyLogin}
            className="btn btn-spotify"
            disabled={isSpotifyLoading}
          >
            {isSpotifyLoading ? 'Connecting...' : 'Continue with Spotify'}
          </button>
        </div>

        <div className="divider">
          <span>or</span>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 