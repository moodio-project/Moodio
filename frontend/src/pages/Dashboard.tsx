import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.username}!</h1>
        <p>Track your mood and discover music that matches your emotional state.</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button className="btn btn-primary">Track Mood</button>
            <button className="btn btn-secondary">Discover Music</button>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Recent Moods</h3>
          <p>No moods tracked yet. Start tracking your mood to see insights here.</p>
        </div>

        <div className="dashboard-card">
          <h3>Music Recommendations</h3>
          <p>Based on your mood patterns, we'll suggest music here.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 