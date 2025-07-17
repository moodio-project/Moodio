import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MusicPlayer from './components/MusicPlayer';
import MoodLogForm from './components/MoodLogForm';
import MoodChart from './components/MoodChart';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<MoodChart />} />
        <Route path="/log" element={<MoodLogForm />} />
        <Route path="/player" element={<MusicPlayer />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App; 