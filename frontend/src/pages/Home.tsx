import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191414] to-[#1DB954]/10">
      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl font-bold text-[#1DB954] mb-6">
            Welcome to Moodio
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Track your moods and discover music that matches your emotional state. 
            Connect with your emotions through the power of music.
          </p>
          
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button className="bg-[#1DB954] hover:bg-[#1ed760] text-white px-8 py-3 text-lg">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button className="bg-transparent border-2 border-[#1DB954] text-[#1DB954] hover:bg-[#1DB954] hover:text-white px-8 py-3 text-lg">
                  Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button className="bg-[#1DB954] hover:bg-[#1ed760] text-white px-8 py-3 text-lg">
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/log-mood">
                <Button className="bg-transparent border-2 border-[#1DB954] text-[#1DB954] hover:bg-[#1DB954] hover:text-white px-8 py-3 text-lg">
                  Track Your Mood
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#232323] rounded-xl p-6 text-center hover:bg-[#2a2a2a] transition-colors">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-3">Mood Tracking</h3>
              <p className="text-gray-400">
                Log your daily moods and track patterns over time with AI-powered analysis
              </p>
            </div>
            <div className="bg-[#232323] rounded-xl p-6 text-center hover:bg-[#2a2a2a] transition-colors">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-xl font-semibold text-white mb-3">Music Discovery</h3>
              <p className="text-gray-400">
                Find music that matches your current mood with intelligent recommendations
              </p>
            </div>
            <div className="bg-[#232323] rounded-xl p-6 text-center hover:bg-[#2a2a2a] transition-colors">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold text-white mb-3">Personal Insights</h3>
              <p className="text-gray-400">
                Get insights into your emotional patterns and music preferences
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 