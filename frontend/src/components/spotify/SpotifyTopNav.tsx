import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaSearch,
  FaUser,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';

const SpotifyTopNav: React.FC = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <div className="spotify-top-nav">
      {/* Navigation Controls */}
      <div className="flex items-center gap-2 mr-6">
        <button className="w-8 h-8 bg-spotify-black rounded-full flex items-center justify-center hover:bg-spotify-light-gray transition-colors">
          <FaChevronLeft className="w-4 h-4 text-white" />
        </button>
        <button className="w-8 h-8 bg-spotify-black rounded-full flex items-center justify-center hover:bg-spotify-light-gray transition-colors">
          <FaChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-spotify-text-gray w-4 h-4" />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            className="spotify-search pl-12"
          />
        </div>
      </div>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 bg-spotify-black hover:bg-spotify-light-gray rounded-full px-3 py-1 transition-colors"
        >
          <div className="w-6 h-6 bg-spotify-green rounded-full flex items-center justify-center">
            <FaUser className="w-3 h-3 text-black" />
          </div>
          <span className="spotify-text-body-medium text-white">
            {user?.username || 'User'}
          </span>
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-spotify-medium-gray rounded-md shadow-lg border border-spotify-border-gray z-50">
            <div className="py-2">
              <div className="px-4 py-2 border-b border-spotify-border-gray">
                <p className="spotify-text-body-medium text-white">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              
              <button
                onClick={() => setShowDropdown(false)}
                className="w-full text-left px-4 py-2 spotify-text-body-medium text-spotify-text-gray hover:text-white hover:bg-spotify-light-gray transition-colors flex items-center gap-3"
              >
                <FaUser className="w-4 h-4" />
                Account
              </button>
              
              <button
                onClick={() => setShowDropdown(false)}
                className="w-full text-left px-4 py-2 spotify-text-body-medium text-spotify-text-gray hover:text-white hover:bg-spotify-light-gray transition-colors flex items-center gap-3"
              >
                <FaCog className="w-4 h-4" />
                Settings
              </button>
              
              <div className="border-t border-spotify-border-gray mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 spotify-text-body-medium text-spotify-text-gray hover:text-white hover:bg-spotify-light-gray transition-colors flex items-center gap-3"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotifyTopNav; 