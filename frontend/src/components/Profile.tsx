// Profile.tsx - Fixed with proper navigation and enhanced functionality

import React, { useState } from 'react';
import Navigation from './Navigation';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user.username,
    email: user.email
  });

  const handleSaveChanges = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: editForm.username,
          email: editForm.email
        })
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        setIsEditing(false);
        // You might want to refresh the user data here
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditForm({
      username: user.username,
      email: user.email
    });
    setIsEditing(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#121212' }}>
      {/* Add Navigation component - This fixes the logo click issue! */}
      <Navigation user={user} currentPage="profile" onLogout={onLogout} />
      
      <div style={{ 
        marginLeft: '240px', 
        flex: 1, 
        padding: '32px',
        maxWidth: '800px',
        margin: '0 auto 0 240px'
      }}>
        <div style={{
          background: '#1E1E1E',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}>
          <h1 style={{
            color: '#22C55E',
            fontSize: '32px',
            fontWeight: '600',
            marginBottom: '32px'
          }}>
            Your Profile
          </h1>

          {/* Profile Avatar Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '32px',
            padding: '24px',
            background: '#2A2A2A',
            borderRadius: '12px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1DB954, #1ed760)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '32px',
              fontWeight: 'bold'
            }}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{
                color: '#FFFFFF',
                fontSize: '24px',
                fontWeight: '600',
                margin: '0 0 8px 0'
              }}>
                {user.username}
              </h2>
              <p style={{
                color: '#B3B3B3',
                fontSize: '16px',
                margin: '0 0 4px 0'
              }}>
                {user.email}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#22C55E',
                  borderRadius: '50%'
                }}></div>
                <span style={{
                  color: '#22C55E',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Connected to Spotify
                </span>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div style={{
            background: '#2A2A2A',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{
                color: '#FFFFFF',
                fontSize: '20px',
                margin: 0
              }}>
                Account Information
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: '#22C55E',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#16A249'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#22C55E'}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              // Edit Mode
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    color: '#B3B3B3',
                    fontSize: '14px',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#333',
                      border: '1px solid #444',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    color: '#B3B3B3',
                    fontSize: '14px',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#333',
                      border: '1px solid #444',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleSaveChanges}
                    style={{
                      background: '#22C55E',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '12px 24px',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      background: 'transparent',
                      border: '1px solid #666',
                      borderRadius: '6px',
                      padding: '12px 24px',
                      color: '#B3B3B3',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    color: '#B3B3B3',
                    fontSize: '14px',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Username
                  </label>
                  <p style={{
                    color: '#FFFFFF',
                    fontSize: '16px',
                    margin: 0,
                    padding: '12px',
                    background: '#333',
                    borderRadius: '6px'
                  }}>
                    {user.username}
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    color: '#B3B3B3',
                    fontSize: '14px',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Email
                  </label>
                  <p style={{
                    color: '#FFFFFF',
                    fontSize: '16px',
                    margin: 0,
                    padding: '12px',
                    background: '#333',
                    borderRadius: '6px'
                  }}>
                    {user.email}
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    color: '#B3B3B3',
                    fontSize: '14px',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    User ID
                  </label>
                  <p style={{
                    color: '#FFFFFF',
                    fontSize: '16px',
                    margin: 0,
                    padding: '12px',
                    background: '#333',
                    borderRadius: '6px'
                  }}>
                    {user.id}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Account Actions */}
          <div style={{
            background: '#2A2A2A',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{
              color: '#FFFFFF',
              fontSize: '20px',
              marginBottom: '16px'
            }}>
              Account Actions
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                style={{
                  background: 'transparent',
                  border: '1px solid #666',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  color: '#B3B3B3',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#22C55E';
                  e.currentTarget.style.color = '#22C55E';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#666';
                  e.currentTarget.style.color = '#B3B3B3';
                }}
              >
                Export My Data
              </button>
              <button
                onClick={onLogout}
                style={{
                  background: '#F472B6',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#E11D48'}
                onMouseOut={(e) => e.currentTarget.style.background = '#F472B6'}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;