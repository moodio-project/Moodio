import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

const Profile: React.FC = () => {
  const { user, spotifyProfile } = useAuth();

  if (!user && !spotifyProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#191414] to-[#1DB954]/10 flex items-center justify-center">
        <div className="bg-[#232323] rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in to view your profile.</h1>
          <Button 
            onClick={() => window.location.href = '/login'}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-white"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191414] to-[#1DB954]/10">
      {/* Header */}
      <header className="bg-[#181818] border-b border-[#222] px-6 py-4">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
      </header>

      {/* Profile Content */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Profile Card */}
          <div className="bg-[#232323] rounded-xl p-6 shadow-lg mb-6">
            <div className="flex items-center space-x-4 mb-6">
              {spotifyProfile?.images?.[0]?.url ? (
                <img 
                  src={spotifyProfile.images[0].url} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <div className="w-20 h-20 bg-[#1DB954] rounded-full flex items-center justify-center">
                  <span className="text-2xl text-white">👤</span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {spotifyProfile?.display_name || user?.username || 'User'}
                </h2>
                <p className="text-gray-400">
                  {spotifyProfile?.email || user?.email || 'No email available'}
                </p>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">Account Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#181818] rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                  <p className="text-white">{user?.username || spotifyProfile?.display_name || 'N/A'}</p>
                </div>
                
                <div className="bg-[#181818] rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <p className="text-white">{user?.email || spotifyProfile?.email || 'N/A'}</p>
                </div>
                
                <div className="bg-[#181818] rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">User ID</label>
                  <p className="text-white">{user?.id || spotifyProfile?.id || 'N/A'}</p>
                </div>
                
                <div className="bg-[#181818] rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Account Type</label>
                  <p className="text-white">{spotifyProfile ? 'Spotify Premium' : 'Local Account'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Actions */}
          <div className="bg-[#232323] rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-medium text-white mb-4">Profile Actions</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-[#1DB954] hover:bg-[#1ed760] text-white">
                Edit Profile
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Delete Account
              </Button>
              <Button 
                onClick={() => window.location.href = '/login'}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 