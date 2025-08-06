// Navigation.tsx - Fixed with clickable Moodio logo

import React from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  email: string;
}

interface NavigationProps {
  user: User;
  currentPage: string;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, currentPage, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const menuItems = [
    { id: 'search', icon: '🔍', label: 'Search', path: '/search' },
    { id: 'mood-log', icon: '✨', label: 'Log Mood', path: '/mood-log' },
    { id: 'mood-history', icon: '📊', label: 'Mood History', path: '/mood-history' },
    { id: 'favorites', icon: '❤️', label: 'Favorites', path: '/favorites' }, // ADD THIS LINE
    { id: 'profile', icon: '👤', label: 'Profile', path: '/profile' }
  ];

  return (
    <nav style={{
      position: 'fixed',
      left: 0,
      top: 0,
      width: '240px',
      height: '100vh',
      background: '#000000',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      borderRight: '1px solid #282828'
    }}>
      {/* Logo Section - NOW CLICKABLE! */}
      <div 
        onClick={handleLogoClick}
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid #282828',
          cursor: 'pointer', // Make it clear it's clickable
          transition: 'background-color 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>🎵</span>
          <span style={{
            color: '#FFFFFF',
            fontSize: '24px',
            fontWeight: 'bold',
            letterSpacing: '-0.5px'
          }}>
            Moodio
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <div style={{ flex: 1, padding: '16px 0' }}>
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 20px',
              margin: '4px 8px',
              borderRadius: '6px',
              cursor: 'pointer',
              background: currentPage === item.id ? 'rgba(29, 185, 84, 0.1)' : 'transparent',
              border: currentPage === item.id ? '1px solid #1DB954' : '1px solid transparent',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (currentPage !== item.id) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }
            }}
            onMouseOut={(e) => {
              if (currentPage !== item.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '18px', opacity: 0.9 }}>{item.icon}</span>
            <span style={{
              color: currentPage === item.id ? '#1DB954' : '#B3B3B3',
              fontSize: '14px',
              fontWeight: currentPage === item.id ? '600' : '500'
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* User Section */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #282828'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1DB954, #1ed760)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '600',
              margin: '0 0 2px 0'
            }}>
              {user.username}
            </p>
            <p style={{
              color: '#B3B3B3',
              fontSize: '12px',
              margin: 0
            }}>
              Free Plan
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'transparent',
            border: '1px solid #333',
            borderRadius: '6px',
            color: '#B3B3B3',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = '#666';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = '#333';
            e.currentTarget.style.color = '#B3B3B3';
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
};

export default Navigation;