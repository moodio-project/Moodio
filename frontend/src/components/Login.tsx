import React, { useState, useEffect } from 'react';
import { auth } from '../api';

interface LoginProps {
  onLogin: (user: any, token: string, spotifyToken?: string, hasPremium?: boolean) => void;
}
const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for OAuth errors in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authError = urlParams.get('error');
    
    if (authError === 'spotify_auth_failed') {
      setError('Spotify authentication failed. Please try again.');
    } else if (authError === 'database_error') {
      setError('Account creation failed. Please try again.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response: any;
      if (isLogin) {
        response = await auth.login(formData.email, formData.password);
      } else {
        response = await auth.register(formData.username, formData.email, formData.password);
      }
      
      onLogin(response.user, response.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSpotifyLogin = () => {
    window.location.href = 'http://localhost:3001/auth/spotify';  // This exact URL
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            <span style={{ color: '#1DB954' }}>Moodio</span>
          </h1>
          <p style={{ color: '#B3B3B3' }}>Your Music, Your Mood, Your Story</p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: 'white', margin: '0 0 8px 0' }}>
            {isLogin ? 'Welcome back' : 'Join Moodio'}
          </h2>
          <p style={{ color: '#B3B3B3' }}>
            {isLogin ? 'Track your emotions through music' : 'Start your musical mood journey'}
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(244, 114, 182, 0.1)', 
            border: '1px solid rgba(244, 114, 182, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            color: '#F472B6'
          }}>
            {error}
          </div>
        )}

        {/* Spotify Login Button */}
        <div style={{ marginBottom: '24px' }}>
          <button
            type="button"
            onClick={handleSpotifyLogin}
            style={{
              width: '100%',
              padding: '16px 24px',
              background: '#1DB954',
              border: 'none',
              borderRadius: '500px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '16px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 15px rgba(29, 185, 84, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1ed760';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(29, 185, 84, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1DB954';
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(29, 185, 84, 0.3)';
            }}
          >
            <span style={{ fontSize: '20px' }}>🎵</span>
            Continue with Spotify
          </button>
        </div>

        {/* Divider - Enhanced */}
<div style={{ 
  display: 'flex', 
  alignItems: 'center', 
  gap: '20px', 
  marginBottom: '24px',
  padding: '0 8px'
}}>
  <div style={{ 
    flex: 1, 
    height: '1px', 
    background: 'linear-gradient(to right, transparent, #404040, transparent)' 
  }}></div>
  <span style={{ 
    color: '#FFFFFF', 
    fontSize: '14px', 
    fontWeight: '500',
    background: '#1E1E1E',
    padding: '4px 12px',
    borderRadius: '16px',
    border: '1px solid #404040'
  }}>
    or
  </span>
  <div style={{ 
    flex: 1, 
    height: '1px', 
    background: 'linear-gradient(to left, transparent, #404040, transparent)' 
  }}></div>
</div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              className="input-field"
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          )}
          
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', marginBottom: '16px' }}
          >
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#B3B3B3' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: 'none',
                border: 'none',
                color: '#1DB954',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;