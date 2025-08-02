import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import MoodHistory from './components/MoodHistory';
import SearchPage from './components/SearchPage';
import SpotifyCallback from './components/SpotifyCallback';
import ArtistPage from './components/ArtistPage';
import { auth } from './api';

interface User {
  id: number;
  username: string;
  email: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      auth.getProfile()
        .then((response: any) => setUser(response.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Handle Spotify OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    
    if (token && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        handleLogin(userData, token);
        // Clean up URL
        window.history.replaceState({}, document.title, '/dashboard');
      } catch (error) {
        console.error('Failed to parse OAuth response:', error);
      }
    }
  }, []);

  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#121212', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
          <h2 style={{ color: '#1DB954', margin: '0 0 8px 0' }}>Loading Moodio...</h2>
          <p style={{ color: '#B3B3B3', margin: 0 }}>Connecting to your music</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
        />
        
        {/* Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        
        {/* Search Route */}
        <Route 
          path="/search" 
          element={user ? <SearchPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        
        {/* Artist Detail Route */}
        <Route 
          path="/artist/:artistId" 
          element={user ? <ArtistPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

        {/* Spotify Callback Route */}
        <Route 
          path="/auth/callback" 
          element={<SpotifyCallback onLogin={handleLogin} />} 
        />
        
        {/* Profile Route */}
        <Route 
          path="/profile" 
          element={user ? <Profile user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        
        {/* Mood History Route */}
        <Route 
          path="/mood-history" 
          element={user ? <MoodHistory user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        
        {/* Mood Log Route (redirects to dashboard) */}
        <Route 
          path="/mood-log" 
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        
        {/* Default Route */}
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" />} 
        />
        
        {/* Catch-all Route */}
        <Route 
          path="*" 
          element={<Navigate to="/dashboard" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;