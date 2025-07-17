import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Home.css';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Moodio</h1>
          <p className="hero-subtitle">
            Track your moods and discover music that matches your emotional state
          </p>
          
          {!user ? (
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Sign In
              </Link>
            </div>
          ) : (
            <div className="cta-buttons">
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
              <Link to="/mood-tracker" className="btn btn-secondary">
                Track Your Mood
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Mood Tracking</h3>
            <p>Log your daily moods and track patterns over time</p>
          </div>
          <div className="feature-card">
            <h3>Music Discovery</h3>
            <p>Find music that matches your current mood</p>
          </div>
          <div className="feature-card">
            <h3>Personal Insights</h3>
            <p>Get insights into your emotional patterns</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 