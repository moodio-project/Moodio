import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaSearch, 
  FaBook, 
  FaPlus, 
  FaHeart,
  FaUser,
  FaCog
} from 'react-icons/fa';

const SpotifySidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: FaHome, label: 'Home' },
    { path: '/explore', icon: FaSearch, label: 'Search' },
    { path: '/library', icon: FaBook, label: 'Your Library' },
  ];

  const libraryItems = [
    { path: '/playlists', icon: FaPlus, label: 'Create Playlist' },
    { path: '/liked', icon: FaHeart, label: 'Liked Songs' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="spotify-sidebar">
      {/* Logo */}
      <div className="mb-8">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-spotify-green rounded-sm flex items-center justify-center">
            <span className="text-black font-bold text-lg">M</span>
          </div>
          <span className="spotify-text-heading-small text-white">Moodio</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="mb-8">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`spotify-nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <item.icon />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Library Section */}
      <div className="mb-8">
        <h3 className="spotify-text-body-small spotify-text-gray uppercase tracking-wider mb-4 px-4">
          Library
        </h3>
        <ul className="space-y-1">
          {libraryItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`spotify-nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <item.icon />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Mood Tracking Section */}
      <div className="mb-8">
        <h3 className="spotify-text-body-small spotify-text-gray uppercase tracking-wider mb-4 px-4">
          Mood Tracking
        </h3>
        <ul className="space-y-1">
          <li>
            <Link
              to="/log-mood"
              className={`spotify-nav-item ${isActive('/log-mood') ? 'active' : ''}`}
            >
              <FaPlus />
              Log Mood
            </Link>
          </li>
          <li>
            <Link
              to="/mood-history"
              className={`spotify-nav-item ${isActive('/mood-history') ? 'active' : ''}`}
            >
              <FaBook />
              Mood History
            </Link>
          </li>
        </ul>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto pt-8 border-t border-spotify-border-gray">
        <ul className="space-y-1">
          <li>
            <Link
              to="/profile"
              className={`spotify-nav-item ${isActive('/profile') ? 'active' : ''}`}
            >
              <FaUser />
              Profile
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className={`spotify-nav-item ${isActive('/settings') ? 'active' : ''}`}
            >
              <FaCog />
              Settings
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SpotifySidebar; 