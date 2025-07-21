import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/5 via-transparent to-[#A78BFA]/5" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-32 h-32 bg-[#1DB954]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#A78BFA]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-[#F472B6]/5 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1DB954] to-[#22C55E] rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">M</span>
              </div>
              <h1 className="text-3xl font-bold text-white">Moodio</h1>
            </div>
          </Link>
          <p className="text-[#B3B3B3] text-lg font-medium">
            Your Music, Your Mood, Your Story
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#1E1E1E] rounded-2xl p-8 shadow-2xl border border-[#2A2A2A]">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            {subtitle && (
              <p className="text-[#B3B3B3] text-sm">{subtitle}</p>
            )}
          </div>

          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[#B3B3B3] text-sm">
            Track your emotions through music and discover how your listening habits shape your well-being
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 