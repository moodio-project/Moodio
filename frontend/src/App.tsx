// App.tsx - Fixed with proper LogMoodPage route

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SpotifyPlayer from './components/SpotifyPlayer';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import MoodHistory from './components/MoodHistory';
import SearchPage from './components/SearchPage';
import ArtistPage from './components/ArtistPage';
import AlbumPage from './components/AlbumPage';
import FavoritesPage from './components/FavoritesPage';
import LogMoodPage from './components/LogMoodPage'; // ADD THIS IMPORT
import { auth } from './api';

interface User {
  id: number;
  username: string;
  email: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [hasPremium, setHasPremium] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const existingSpotifyToken = localStorage.getItem('spotify_token');
    const premiumStatus = localStorage.getItem('has_premium');

    if (existingSpotifyToken) {
      setSpotifyToken(existingSpotifyToken);
    }

    if (premiumStatus === 'true') {
      setHasPremium(true);
    }

    if (token) {
      auth.getProfile()
        .then((response: any) => {
          setUser(response.user);
        })
        .catch((error) => {
          console.error('Profile loading failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('spotify_token');
          localStorage.removeItem('has_premium');
          setSpotifyToken(null);
          setHasPremium(false);
        })
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
        handleLogin(userData, token, userData.spotify_token, userData.has_premium);
        window.history.replaceState({}, document.title, '/dashboard');
      } catch (error) {
        console.error('Failed to parse OAuth response:', error);
      }
    }
  }, []);

  const handleLogin = (userData: User, token: string, spotifyAccessToken?: string, premiumStatus?: boolean) => {
    setUser(userData);
    localStorage.setItem('token', token);

    if (spotifyAccessToken) {
      setSpotifyToken(spotifyAccessToken);
      localStorage.setItem('spotify_token', spotifyAccessToken);
    }

    if (premiumStatus !== undefined) {
      setHasPremium(premiumStatus);
      localStorage.setItem('has_premium', premiumStatus.toString());
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSpotifyToken(null);
    setHasPremium(false);
    localStorage.removeItem('token');
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('has_premium');
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
      <div style={{ paddingBottom: user ? '120px' : 0 }}>
      <Routes>
        {/* Login Route */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
        />
        
        {/* Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            user ? 
            <Dashboard 
              user={user} 
              onLogout={handleLogout} 
              spotifyToken={spotifyToken}
              hasPremium={hasPremium}
            /> : 
            <Navigate to="/login" />
          } 
        />
        
        {/* Search Route */}
        <Route 
          path="/search" 
          element={
            user ? 
            <SearchPage
              user={user}
              onLogout={handleLogout}
            /> : 
            <Navigate to="/login" />
          } 
        />
        
        {/* Artist Detail Route */}
        <Route 
          path="/artist/:artistId" 
          element={
            user ? 
            <ArtistPage
              user={user}
              onLogout={handleLogout}
              spotifyToken={spotifyToken}
            /> : 
            <Navigate to="/login" />
          } 
        />
        
        {/* Album Detail Route */}
        <Route
          path="/album/:albumId"
          element={
            user ?
            <AlbumPage
              user={user}
              onLogout={handleLogout}
            /> :
            <Navigate to="/login" />
          }
        />

        {/* Log Mood Route - FIXED! */}
        <Route 
          path="/mood-log" 
          element={
            user ? 
            <LogMoodPage
              user={user}
              onLogout={handleLogout}
              spotifyToken={spotifyToken}
            /> : 
            <Navigate to="/login" />
          } 
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
        
        {/* Default Route */}
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" />} 
        />

        {/* Favorites Route */}
                    <Route 
              path="/favorites" 
              element={
                user ? 
                <FavoritesPage 
                  user={user} 
                  onLogout={handleLogout} 
                /> : 
                <Navigate to="/login" />
          } 
        />
        
        {/* Catch-all Route */}
        <Route 
          path="*" 
          element={<Navigate to="/dashboard" />} 
        />
      </Routes>
      </div>

      {/* Persistent player — stays mounted across all routes */}
      {user && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '240px',
          right: 0,
          zIndex: 100,
          padding: '12px 24px',
          background: '#181818',
          borderTop: '1px solid #282828',
        }}>
          <SpotifyPlayer accessToken={spotifyToken} hasPremium={hasPremium} />
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;