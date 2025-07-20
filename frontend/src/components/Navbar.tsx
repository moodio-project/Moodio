import React from 'react';
import { NavLink } from 'react-router-dom';

const navLinks = [
  { name: 'Dashboard', to: '/dashboard', icon: '🏠' },
  { name: 'Log Mood', to: '/log-mood', icon: '📝' },
  { name: 'Explore', to: '/explore', icon: '🔍' },
  { name: 'Profile', to: '/profile', icon: '👤' },
];

const Navbar: React.FC = () => {
  return (
    <nav
      className="h-full w-20 md:w-56 bg-[#181818] border-r border-[#222] flex flex-col py-6 px-2 md:px-4 gap-2"
      aria-label="Sidebar Navigation"
    >
      <div className="mb-8 flex items-center justify-center md:justify-start">
        <span className="text-[#1DB954] font-bold text-2xl tracking-tight">Moodio</span>
      </div>
      <ul className="flex flex-col gap-2" role="menu">
        {navLinks.map(link => (
          <li key={link.to} role="none">
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors text-white hover:bg-[#232323] focus:outline-none focus:ring-2 focus:ring-[#1DB954] ${
                  isActive ? 'bg-[#232323] text-[#1DB954]' : ''
                }`
              }
              role="menuitem"
              aria-label={link.name}
            >
              <span className="text-xl md:text-lg" aria-hidden="true">{link.icon}</span>
              <span className="hidden md:inline">{link.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar; 