import React, { useState } from 'react';
import { useMood } from '../contexts/MoodContext';
import SpotifyButton from './spotify/SpotifyButton';
import { FaLightbulb, FaChartLine } from 'react-icons/fa';

const MoodLogForm: React.FC = () => {
  const { logMood, moodHistory, isLoading } = useMood();
  const [selectedMood, setSelectedMood] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');

  const moods = [
    { name: 'happy', emoji: '😊', color: 'bg-yellow-500' },
    { name: 'sad', emoji: '😢', color: 'bg-blue-500' },
    { name: 'excited', emoji: '🤩', color: 'bg-orange-500' },
    { name: 'calm', emoji: '😌', color: 'bg-green-500' },
    { name: 'angry', emoji: '😠', color: 'bg-red-500' },
    { name: 'anxious', emoji: '😰', color: 'bg-purple-500' },
    { name: 'relaxed', emoji: '😴', color: 'bg-teal-500' },
    { name: 'energetic', emoji: '⚡', color: 'bg-pink-500' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) return;

    await logMood(selectedMood, intensity, note);
    setSelectedMood('');
    setIntensity(5);
    setNote('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-spotify-dark-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spotify-dark-gray p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="spotify-text-heading-large text-white mb-4 flex items-center gap-3">
            <FaLightbulb className="text-spotify-green" />
            Log Your Mood
          </h1>
          <p className="spotify-text-body-medium spotify-text-gray">
            Take a moment to reflect on how you're feeling and get personalized music recommendations.
          </p>
        </div>

        <div className="bg-spotify-medium-gray rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mood Selection */}
            <div>
              <label className="block spotify-text-body-medium text-white mb-4">
                How are you feeling right now?
              </label>
              <div className="grid grid-cols-4 gap-3">
                {moods.map((mood) => (
                  <button
                    key={mood.name}
                    type="button"
                    onClick={() => setSelectedMood(mood.name)}
                    className={`p-4 rounded-lg text-center transition-all ${
                      selectedMood === mood.name
                        ? 'bg-spotify-green text-black scale-105'
                        : 'bg-spotify-border-gray text-white hover:bg-spotify-light-gray'
                    }`}
                  >
                    <div className="text-2xl mb-2">{mood.emoji}</div>
                    <div className="spotify-text-caption capitalize">
                      {mood.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity Slider */}
            <div>
              <label className="block spotify-text-body-medium text-white mb-3">
                Intensity: {intensity}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full h-2 bg-spotify-border-gray rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between mt-2">
                <span className="spotify-text-caption spotify-text-gray">Low</span>
                <span className="spotify-text-caption spotify-text-gray">High</span>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block spotify-text-body-medium text-white mb-3">
                Add a note (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="spotify-input w-full h-24 resize-none"
                placeholder="What's on your mind? Any specific thoughts or feelings?"
              />
            </div>

            {/* Submit Button */}
            <SpotifyButton
              type="submit"
              variant="primary"
              disabled={!selectedMood || isLoading}
              className="w-full"
            >
              {isLoading ? 'Logging Mood...' : 'Log Mood'}
            </SpotifyButton>
          </form>
        </div>

        {/* Recent Moods */}
        {moodHistory.length > 0 && (
          <div className="mt-8 bg-spotify-medium-gray rounded-lg p-6">
            <h2 className="spotify-text-heading-small text-white mb-6 flex items-center gap-2">
              <FaChartLine className="text-spotify-green" />
              Recent Moods
            </h2>
            <div className="space-y-4">
              {moodHistory.slice(0, 3).map((mood: any) => (
                <div key={mood.id} className="bg-spotify-border-gray rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {mood.mood === 'happy' ? '😊' : 
                         mood.mood === 'sad' ? '😢' : 
                         mood.mood === 'excited' ? '🤩' : 
                         mood.mood === 'calm' ? '😌' : 
                         mood.mood === 'angry' ? '😠' : 
                         mood.mood === 'anxious' ? '😰' : 
                         mood.mood === 'relaxed' ? '😴' : '⚡'}
                      </span>
                      <div>
                        <p className="spotify-text-body-medium text-white capitalize">
                          {mood.mood}
                        </p>
                        <p className="spotify-text-caption spotify-text-gray">
                          Intensity: {mood.mood_intensity}/10
                        </p>
                      </div>
                    </div>
                    <span className="spotify-text-caption spotify-text-gray">
                      {new Date(mood.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {mood.note && (
                    <p className="spotify-text-body-small text-white">
                      "{mood.note}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodLogForm; 