import React from 'react';
import { FaSpotify } from 'react-icons/fa';

interface SpotifyButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  text?: string;
  className?: string;
}

const SpotifyButton: React.FC<SpotifyButtonProps> = ({ 
  onClick, 
  isLoading = false, 
  text = "Continue with Spotify",
  className = ""
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        w-full flex items-center justify-center gap-3 px-6 py-4 
        bg-[#1DB954] hover:bg-[#1ed760] active:bg-[#1aa34a]
        text-white font-semibold text-lg rounded-lg
        transition-all duration-200 ease-in-out
        transform hover:scale-[1.02] active:scale-[0.98]
        shadow-lg hover:shadow-xl
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
      ) : (
        <FaSpotify className="text-2xl" />
      )}
      <span>{isLoading ? "Connecting..." : text}</span>
    </button>
  );
};

export default SpotifyButton; 