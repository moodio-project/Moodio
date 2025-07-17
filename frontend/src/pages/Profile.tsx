import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Profile.css';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="profile">
      <h1>Profile</h1>
      
      <div className="profile-card">
        <div className="profile-header">
          <h2>Account Information</h2>
        </div>
        
        <div className="profile-info">
          <div className="info-group">
            <label>Username</label>
            <p>{user.username}</p>
          </div>
          
          <div className="info-group">
            <label>Email</label>
            <p>{user.email}</p>
          </div>
          
          <div className="info-group">
            <label>User ID</label>
            <p>{user.id}</p>
          </div>
        </div>
        
        <div className="profile-actions">
          <button className="btn btn-secondary">Edit Profile</button>
          <button className="btn btn-danger">Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 