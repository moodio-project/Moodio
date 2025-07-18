import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const mockTopTracks = [
  {
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273e5b8b7b7b7b7b7b7b7b7b7b7',
  },
  {
    title: 'Levitating',
    artist: 'Dua Lipa',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273b7b7b7b7b7b7b7b7b7b7b7b7',
  },
  {
    title: 'Watermelon Sugar',
    artist: 'Harry Styles',
    albumArt: 'https://i.scdn.co/image/ab67616d0000b273b7b7b7b7b7b7b7b7b7b7b7b7',
  },
];

const Dashboard: React.FC = () => {
  const {
    spotifyProfile,
    spotifyProfileLoading,
    spotifyProfileError,
    isLoading,
  } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191414] to-[#1DB954]/10 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-3xl bg-[#222] rounded-xl shadow-lg p-6 mb-8 flex flex-col items-center">
        {/* Profile Section */}
        {spotifyProfileLoading || isLoading ? (
          <div className="w-full flex justify-center items-center py-8">
            <span className="text-gray-400 text-lg">Loading profile...</span>
          </div>
        ) : spotifyProfile ? (
          <div className="flex flex-col items-center gap-2">
            <img
              src={spotifyProfile.images?.[0]?.url || '/default-avatar.png'}
              alt="Spotify Avatar"
              className="w-24 h-24 rounded-full border-4 border-[#1DB954] shadow-md object-cover"
            />
            <h2 className="text-2xl font-bold text-white mt-2">{spotifyProfile.display_name}</h2>
            <span className="text-sm text-gray-400">Spotify User</span>
          </div>
        ) : spotifyProfileError ? (
          <div className="w-full flex justify-center items-center py-8">
            <span className="text-red-400 text-lg">{spotifyProfileError}</span>
          </div>
        ) : (
          <div className="w-full flex justify-center items-center py-8">
            <span className="text-gray-400 text-lg">Welcome, Guest</span>
          </div>
        )}
      </div>

      {/* Top Tracks Section */}
      <div className="w-full max-w-3xl bg-[#181818] rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Your Top Tracks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mockTopTracks.map((track, idx) => (
            <div
              key={idx}
              className="bg-[#232323] rounded-lg p-4 flex flex-col items-center hover:bg-[#282828] transition"
            >
              <img
                src={track.albumArt}
                alt={track.title}
                className="w-20 h-20 rounded shadow mb-3 object-cover"
              />
              <div className="text-center">
                <div className="text-white font-medium text-base truncate">{track.title}</div>
                <div className="text-green-400 text-sm truncate">{track.artist}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 