import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { id: 'search', label: 'Search', icon: '🔍', path: '/search' },
    { id: 'mood-log', label: 'Log Mood', icon: '✨', path: '/dashboard' },
    { id: 'mood-history', label: 'Mood History', icon: '📊', path: '/mood-history' },
    { id: 'profile', label: 'Profile', icon: '👤', path: '/profile' },
  ];

  const getCurrentPageId = () => {
    const path = location.pathname;
    if (path.includes('/artist/')) return 'search';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/search') return 'search';
    if (path === '/mood-history') return 'mood-history';
    if (path === '/profile') return 'profile';
    return currentPage;
  };

  const activePageId = getCurrentPageId();

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <div style={{
      width: '240px',
      height: '100vh',
      background: '#000000',
      padding: '24px 0',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Logo */}
      <div style={{ padding: '0 24px', marginBottom: '32px' }}>
        <h1 style={{ 
          color: '#1DB954', 
          fontSize: '28px', 
          margin: 0,
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
        onClick={() => handleNavClick('/dashboard')}
        >
          Moodio
        </h1>
        <p style={{ 
          color: '#B3B3B3', 
          margin: '4px 0 0 0',
          fontSize: '14px'
        }}>
          Your Music, Your Mood
        </p>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1 }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.path)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '12px 24px',
              color: activePageId === item.id ? '#1DB954' : '#B3B3B3',
              background: 'none',
              border: 'none',
              fontSize: '16px',
              fontWeight: activePageId === item.id ? '600' : '400',
              backgroundColor: activePageId === item.id ? 'rgba(29, 185, 84, 0.1)' : 'transparent',
              borderRight: activePageId === item.id ? '3px solid #1DB954' : 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              if (activePageId !== item.id) {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (activePageId !== item.id) {
                e.currentTarget.style.color = '#B3B3B3';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ marginRight: '16px', fontSize: '20px' }}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User Section */}
      <div style={{ 
        padding: '24px',
        borderTop: '1px solid #282828'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#1DB954',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'black'
          }}>
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p style={{ color: 'white', margin: 0, fontSize: '14px', fontWeight: '600' }}>
              {user.username || 'User'}
            </p>
            <p style={{ color: '#B3B3B3', margin: 0, fontSize: '12px' }}>
              {user.email}
            </p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          style={{ 
            width: '100%',
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid #535353',
            borderRadius: '500px',
            color: '#B3B3B3',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#FFFFFF';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#535353';
            e.currentTarget.style.color = '#B3B3B3';
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default Navigation;