import React from 'react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';

const Dashboard: React.FC = () => {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#191414] to-[#1DB954]/10">
      {/* Sidebar */}
      <aside className="hidden md:block h-screen sticky top-0">
        <Navbar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar/Header */}
        <header className="w-full bg-[#181818] border-b border-[#232323] px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Welcome to Moodio!</h1>
            <span className="text-sm text-gray-400 ml-0 md:ml-4">{today}</span>
          </div>
          <Button variant="spotify" size="sm" className="ml-auto">Log Out</Button>
        </header>

        {/* Main Panel */}
        <section className="flex-1 w-full max-w-5xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Mood Summary Block */}
          <section className="bg-[#232323] rounded-xl shadow p-6 flex flex-col gap-2" aria-label="Mood Summary">
            <h2 className="text-lg font-semibold text-white mb-2">Mood Summary</h2>
            <div className="text-gray-400">Your recent mood logs and stats will appear here.</div>
          </section>

          {/* Currently Listening Block */}
          <section className="bg-[#232323] rounded-xl shadow p-6 flex flex-col gap-2" aria-label="Currently Listening">
            <h2 className="text-lg font-semibold text-white mb-2">Currently Listening</h2>
            <div className="text-gray-400">Spotify track info will appear here.</div>
          </section>

          {/* Charts Block (spans both columns on desktop) */}
          <section className="bg-[#232323] rounded-xl shadow p-6 flex flex-col gap-2 md:col-span-2" aria-label="Charts">
            <h2 className="text-lg font-semibold text-white mb-2">Charts</h2>
            <div className="text-gray-400">Mood and music data visualizations coming soon.</div>
          </section>
        </section>
      </main>
    </div>
  );
};

export default Dashboard; 