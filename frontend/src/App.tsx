import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SpotifyLayout from './components/spotify/SpotifyLayout';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SpotifyCallback from './pages/SpotifyCallback';
import Profile from './pages/Profile';
import MoodLogForm from './components/MoodLogForm';
import Explore from './pages/Explore';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Component to handle the main app layout
const AppLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-spotify-dark-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SpotifyLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/log-mood" element={<MoodLogForm />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </SpotifyLayout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/spotify/callback" element={<SpotifyCallback />} />
          
          {/* Protected routes */}
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App; 