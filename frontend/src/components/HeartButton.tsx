import React, { useState, useEffect } from 'react';
import { favorites } from '../api';

interface HeartButtonProps {
  track: any;
  size?: 'small' | 'medium' | 'large';
  onToggle?: (isFavorited: boolean) => void;
}

const HeartButton: React.FC<HeartButtonProps> = ({ track, size = 'medium', onToggle }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfFavorited();
  }, [track.id]);

  const checkIfFavorited = async () => {
    try {
      const favorited = await favorites.check(track.id);
      setIsFavorited(favorited);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);

    try {
      if (isFavorited) {
        await favorites.remove(track.id);
        setIsFavorited(false);
        console.log('💔 Removed from favorites:', track.name);
      } else {
        await favorites.add(track);
        setIsFavorited(true);
        console.log('❤️ Added to favorites:', track.name);
      }
      
      if (onToggle) {
        onToggle(!isFavorited);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeStyles = {
    small: { width: '16px', height: '16px', fontSize: '12px' },
    medium: { width: '24px', height: '24px', fontSize: '16px' },
    large: { width: '32px', height: '32px', fontSize: '20px' }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: loading ? 'wait' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: loading ? 0.5 : 1,
        ...sizeStyles[size]
      }}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorited ? '❤️' : '🤍'}
    </button>
  );
};

export default HeartButton;