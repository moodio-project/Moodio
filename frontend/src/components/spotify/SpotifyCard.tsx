import React from 'react';

interface SpotifyCardProps {
  type: 'album' | 'artist' | 'playlist' | 'track';
  title: string;
  subtitle?: string;
  image?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const SpotifyCard: React.FC<SpotifyCardProps> = ({
  type,
  title,
  subtitle,
  image,
  onClick,
  className = '',
  children
}) => {
  const cardClasses = `spotify-card-${type} ${className}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      {image && (
        <div className="relative mb-4">
          <img
            src={image}
            alt={title}
            className="w-full aspect-square object-cover rounded-sm"
          />
          {type === 'album' && (
            <div className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          )}
        </div>
      )}
      
      <div className="min-h-[60px]">
        <h3 className="spotify-text-heading-small text-white truncate mb-1">
          {title}
        </h3>
        {subtitle && (
          <p className="spotify-text-body-small spotify-text-gray truncate">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

// Specialized card components
export const AlbumCard: React.FC<{
  title: string;
  artist: string;
  image: string;
  onClick?: () => void;
}> = ({ title, artist, image, onClick }) => (
  <SpotifyCard
    type="album"
    title={title}
    subtitle={artist}
    image={image}
    onClick={onClick}
    className="group"
  />
);

export const ArtistCard: React.FC<{
  name: string;
  image: string;
  onClick?: () => void;
}> = ({ name, image, onClick }) => (
  <SpotifyCard
    type="artist"
    title={name}
    image={image}
    onClick={onClick}
    className="group"
  />
);

export const PlaylistCard: React.FC<{
  name: string;
  description?: string;
  image: string;
  onClick?: () => void;
}> = ({ name, description, image, onClick }) => (
  <SpotifyCard
    type="playlist"
    title={name}
    subtitle={description}
    image={image}
    onClick={onClick}
    className="group"
  />
);

export const TrackCard: React.FC<{
  title: string;
  artist: string;
  image?: string;
  onClick?: () => void;
  duration?: string;
}> = ({ title, artist, image, onClick, duration }) => (
  <div 
    className="spotify-card flex items-center p-3 hover:bg-spotify-light-gray transition-colors cursor-pointer"
    onClick={onClick}
  >
    {image && (
      <img
        src={image}
        alt={title}
        className="w-12 h-12 rounded-sm object-cover mr-3"
      />
    )}
    <div className="flex-1 min-w-0">
      <h4 className="spotify-text-body-medium text-white truncate">
        {title}
      </h4>
      <p className="spotify-text-body-small spotify-text-gray truncate">
        {artist}
      </p>
    </div>
    {duration && (
      <span className="spotify-text-body-small spotify-text-gray ml-2">
        {duration}
      </span>
    )}
  </div>
);

export default SpotifyCard; 