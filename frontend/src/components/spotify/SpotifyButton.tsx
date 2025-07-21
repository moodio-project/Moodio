import React from 'react';
import { FaSpotify } from 'react-icons/fa';

interface SpotifyButtonProps {
  variant?: 'primary' | 'secondary' | 'small';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const SpotifyButton: React.FC<SpotifyButtonProps> = ({
  variant = 'primary',
  children,
  onClick,
  disabled = false,
  loading = false,
  icon,
  className = '',
  type = 'button'
}) => {
  const baseClasses = 'spotify-btn';
  const variantClasses = {
    primary: 'spotify-btn-primary',
    secondary: 'spotify-btn-secondary',
    small: 'spotify-btn-small'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

// Special Spotify OAuth Button
export const SpotifyOAuthButton: React.FC<{
  onClick: () => void;
  loading?: boolean;
  text?: string;
}> = ({ onClick, loading = false, text = "Continue with Spotify" }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="spotify-btn spotify-btn-primary w-full flex items-center justify-center gap-3"
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
      ) : (
        <FaSpotify className="text-xl" />
      )}
      <span>{loading ? "Connecting..." : text}</span>
    </button>
  );
};

export default SpotifyButton; 