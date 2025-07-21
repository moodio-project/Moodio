import React from 'react';
import SpotifySidebar from './SpotifySidebar';
import SpotifyTopNav from './SpotifyTopNav';

interface SpotifyLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showTopNav?: boolean;
}

const SpotifyLayout: React.FC<SpotifyLayoutProps> = ({
  children,
  showSidebar = true,
  showTopNav = true
}) => {
  return (
    <div className="spotify-layout">
      {showSidebar && <SpotifySidebar />}
      
      <div className="spotify-main">
        {showTopNav && <SpotifyTopNav />}
        
        <div className="spotify-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SpotifyLayout; 