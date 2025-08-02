import React from 'react';

interface User {
  id: number;
  username: string;
  email: string;
}

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  return (
    <div style={{ minHeight: '100vh', padding: '20px', background: '#121212' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ color: '#1DB954', fontSize: '32px', margin: 0 }}>Moodio</h1>
          <p style={{ color: '#B3B3B3', margin: '4px 0 0 0' }}>Profile Settings</p>
        </div>
        <button onClick={onLogout} className="btn-secondary">
          Logout
        </button>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ color: 'white', marginBottom: '24px' }}>Your Profile</h2>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ color: '#B3B3B3', display: 'block', marginBottom: '8px' }}>
              Username:
            </label>
            <div style={{ 
              background: '#181818', 
              padding: '12px 16px', 
              borderRadius: '8px',
              color: 'white'
            }}>
              {user.username}
            </div>
          </div>

          <div>
            <label style={{ color: '#B3B3B3', display: 'block', marginBottom: '8px' }}>
              Email:
            </label>
            <div style={{ 
              background: '#181818', 
              padding: '12px 16px', 
              borderRadius: '8px',
              color: 'white'
            }}>
              {user.email}
            </div>
          </div>

          <div>
            <label style={{ color: '#B3B3B3', display: 'block', marginBottom: '8px' }}>
              User ID:
            </label>
            <div style={{ 
              background: '#181818', 
              padding: '12px 16px', 
              borderRadius: '8px',
              color: 'white'
            }}>
              {user.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;