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
    console.log('🚀 App starting - checking existing tokens...');
    
    const token = localStorage.getItem('token');
    const existingSpotifyToken = localStorage.getItem('spotify_token');
    const premiumStatus = localStorage.getItem('has_premium');
    
    console.log('📦 Local storage check:', {
      hasJWTToken: !!token,
      hasSpotifyToken: !!existingSpotifyToken,
      premiumStatus: premiumStatus,
      spotifyTokenLength: existingSpotifyToken?.length
    });
    
    // Load existing Spotify token if available
    if (existingSpotifyToken) {
      console.log('✅ Found existing Spotify token');
      setSpotifyToken(existingSpotifyToken);
    }
    
    // Load Premium status
    if (premiumStatus === 'true') {
      console.log('✅ Found Premium status: true');
      setHasPremium(true);
    }
    
    if (token) {
      auth.getProfile()
        .then((response: any) => {
          console.log('✅ Profile loaded:', response.user);
          setUser(response.user);
        })
        .catch((error) => {
          console.error('❌ Profile loading failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('spotify_token');
          localStorage.removeItem('has_premium');
          setSpotifyToken(null);
          setHasPremium(false);
        })
        .finally(() => setLoading(false));
    } else {
      console.log('❌ No JWT token found');
      setLoading(false);
    }
  }, []);

  // Handle Spotify OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    
    console.log('🔍 Checking URL params:', {
      hasToken: !!token,
      hasUserParam: !!userParam,
      fullURL: window.location.href
    });
    
    if (token && userParam) {
      try {
        console.log('📥 Parsing OAuth response...');
        const userData = JSON.parse(decodeURIComponent(userParam));
        
        console.log('👤 Parsed user data:', {
          username: userData.username,
          hasSpotifyToken: !!userData.spotify_token,
          hasPremium: userData.has_premium,
          spotifyProduct: userData.spotify_product,
          spotifyTokenLength: userData.spotify_token?.length
        });
        
        handleLogin(userData, token, userData.spotify_token, userData.has_premium);
        
        // Clean up URL
        window.history.replaceState({}, document.title, '/dashboard');
      } catch (error) {
        console.error('❌ Failed to parse OAuth response:', error);
      }
    }
  }, []);

  const handleLogin = (userData: User, token: string, spotifyAccessToken?: string, premiumStatus?: boolean) => {
    console.log('🔐 handleLogin called with:', {
      user: userData.username,
      hasJWTToken: !!token,
      hasSpotifyToken: !!spotifyAccessToken,
      premiumStatus: premiumStatus,
      spotifyTokenLength: spotifyAccessToken?.length
    });
    
    setUser(userData);
    localStorage.setItem('token', token);
    
    if (spotifyAccessToken) {
      console.log('💾 Storing Spotify token:', spotifyAccessToken.substring(0, 20) + '...');
      setSpotifyToken(spotifyAccessToken);
      localStorage.setItem('spotify_token', spotifyAccessToken);
    } else {
      console.warn('⚠️ No Spotify token provided in handleLogin');
    }
    
    if (premiumStatus !== undefined) {
      console.log('💾 Storing Premium status:', premiumStatus);
      setHasPremium(premiumStatus);
      localStorage.setItem('has_premium', premiumStatus.toString());
    } else {
      console.warn('⚠️ No Premium status provided in handleLogin');
    }

    // Debug final state
    console.log('🔍 Final state after login:', {
      spotifyTokenSet: !!spotifyAccessToken,
      premiumSet: premiumStatus,
      localStorageSpotifyToken: localStorage.getItem('spotify_token')?.substring(0, 20) + '...',
      localStoragePremium: localStorage.getItem('has_premium')
    });
  };

  const handleLogout = () => {
    console.log('👋 Logging out - clearing all tokens');
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

  console.log('🎯 Rendering App with state:', {
    hasUser: !!user,
    hasSpotifyToken: !!spotifyToken,
    hasPremium: hasPremium,
    spotifyTokenLength: spotifyToken?.length
  });

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
              spotifyToken={spotifyToken}
              hasPremium={hasPremium}
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
              hasPremium={hasPremium}
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
              hasPremium={hasPremium}
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