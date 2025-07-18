import React, { useState } from 'react';
import { api } from '../adapters/api';
import { cn } from '../lib/utils';
import Button from './ui/button';

const MOODS = [
  { label: '😊 Happy', value: 'happy' },
  { label: '😢 Sad', value: 'sad' },
  { label: '😡 Angry', value: 'angry' },
  { label: '😱 Anxious', value: 'anxious' },
  { label: '😴 Tired', value: 'tired' },
  { label: '😐 Neutral', value: 'neutral' },
  { label: '😍 Loved', value: 'loved' },
  { label: '🤩 Excited', value: 'excited' },
];

const MoodLogForm: React.FC<{ lastSongId?: string; lastMood?: string }> = ({ lastSongId, lastMood }) => {
  const [mood, setMood] = useState(lastMood || '');
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!mood || !intensity) {
      setError('Please select a mood and intensity.');
      return;
    }
    setLoading(true);
    const payload = {
      mood,
      mood_intensity: intensity,
      note,
      song_id: lastSongId,
    };
    try {
      await api.post('/moods', payload, { withCredentials: true });
      setSuccess(true);
      setMood('');
      setIntensity(5);
      setNote('');
    } catch (err) {
      setError('Failed to log mood. Data will be stored locally.');
      // Store locally as fallback
      const localLogs = JSON.parse(localStorage.getItem('moodLogs') || '[]');
      localLogs.push({ ...payload, created_at: new Date().toISOString() });
      localStorage.setItem('moodLogs', JSON.stringify(localLogs));
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-[#232323] rounded-xl shadow-lg p-6 flex flex-col gap-6 mx-auto mt-8"
      aria-label="Mood Logging Form"
    >
      <div>
        <label htmlFor="mood" className="block text-sm font-medium text-white mb-1">
          Mood <span className="text-red-400">*</span>
        </label>
        <select
          id="mood"
          name="mood"
          value={mood}
          onChange={e => setMood(e.target.value)}
          required
          className="w-full rounded-md border border-[#333] bg-[#181818] text-white p-2 focus:ring-2 focus:ring-[#1DB954] focus:outline-none"
          aria-required="true"
        >
          <option value="" disabled>
            Select your mood
          </option>
          {MOODS.map(m => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="intensity" className="block text-sm font-medium text-white mb-1">
          Intensity <span className="text-green-400">({intensity})</span>
        </label>
        <input
          id="intensity"
          name="intensity"
          type="range"
          min={1}
          max={10}
          value={intensity}
          onChange={e => setIntensity(Number(e.target.value))}
          className="w-full accent-[#1DB954]"
          aria-valuenow={intensity}
          aria-valuemin={1}
          aria-valuemax={10}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      <div>
        <label htmlFor="note" className="block text-sm font-medium text-white mb-1">
          Notes <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-[#333] bg-[#181818] text-white p-2 focus:ring-2 focus:ring-[#1DB954] focus:outline-none resize-none"
          placeholder="Write about your feelings..."
          aria-label="Mood notes"
        />
      </div>

      <Button
        type="submit"
        className={cn(
          'w-full bg-[#1DB954] text-white font-semibold py-2 rounded-md transition hover:bg-[#1ed760] focus:ring-2 focus:ring-[#1DB954] focus:outline-none',
          loading && 'opacity-60 cursor-not-allowed'
        )}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? 'Logging...' : 'Log Mood'}
      </Button>

      {error && (
        <div className="text-red-400 text-sm mt-2" role="alert">{error}</div>
      )}
      {success && (
        <div className="text-green-400 text-sm mt-2" role="status">Mood logged successfully!</div>
      )}
    </form>
  );
};

export default MoodLogForm; 