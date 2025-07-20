import React, { useState } from 'react';
import { api, aiAPI } from '../adapters/api';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

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

const MoodLogForm: React.FC<{ lastSongId?: string }> = ({ lastSongId }) => {
  const [mood, setMood] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mood || intensity < 1 || intensity > 10) {
      setMessage({ type: 'error', text: 'Please select a mood and set intensity (1-10)' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        mood,
        mood_intensity: intensity,
        note,
        song_id: lastSongId,
      };

      await api.post('/moods', payload);
      
      setMessage({ type: 'success', text: 'Mood logged successfully!' });
      setMood('');
      setIntensity(5);
      setNote('');
    } catch (error: any) {
      console.error('Failed to log mood:', error);
      
      // Fallback: store in localStorage if backend fails
      const moodLogs = JSON.parse(localStorage.getItem('moodLogs') || '[]');
      moodLogs.push({
        id: Date.now(),
        mood,
        mood_intensity: intensity,
        note,
        song_id: lastSongId,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem('moodLogs', JSON.stringify(moodLogs));
      
      setMessage({ type: 'success', text: 'Mood logged locally (backend unavailable)' });
      setMood('');
      setIntensity(5);
      setNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!note.trim()) {
      setMessage({ type: 'error', text: 'Please add a note to analyze your mood' });
      return;
    }

    setIsAnalyzing(true);
    setMessage(null);

    try {
      const response = await aiAPI.analyzeMood(note, intensity);
      const analysis = response.data.analysis;
      
      setMood(analysis.mood);
      setMessage({ 
        type: 'success', 
        text: `AI analyzed your mood as: ${analysis.mood} (${Math.round(analysis.confidence * 100)}% confidence)` 
      });
    } catch (error: any) {
      console.error('AI analysis failed:', error);
      setMessage({ type: 'error', text: 'AI analysis failed. Please select mood manually.' });
    } finally {
      setIsAnalyzing(false);
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
          isSubmitting && 'opacity-60 cursor-not-allowed'
        )}
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Logging...' : 'Log Mood'}
      </Button>

      <Button
        type="button"
        onClick={handleAIAnalysis}
        className={cn(
          'w-full bg-[#1DB954] text-white font-semibold py-2 rounded-md transition hover:bg-[#1ed760] focus:ring-2 focus:ring-[#1DB954] focus:outline-none',
          isAnalyzing && 'opacity-60 cursor-not-allowed'
        )}
        disabled={isAnalyzing}
        aria-busy={isAnalyzing}
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Mood with AI'}
      </Button>

      {message && (
        <div className={`text-sm mt-2 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`} role="status">
          {message.text}
        </div>
      )}
    </form>
  );
};

export default MoodLogForm; 