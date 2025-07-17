import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMood } from '../contexts/MoodContext';
import '../styles/MoodTracker.css';

const MoodTracker: React.FC = () => {
  const { user } = useAuth();
  const { createMood, moods, isLoading } = useMood();
  const [moodType, setMoodType] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [description, setDescription] = useState('');

  const moodTypes = ['happy', 'sad', 'angry', 'calm', 'excited', 'anxious', 'melancholy', 'energetic'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !moodType) return;

    await createMood({
      user_id: user.id,
      mood_type: moodType,
      intensity,
      description
    });

    // Reset form
    setMoodType('');
    setIntensity(5);
    setDescription('');
  };

  return (
    <div className="mood-tracker">
      <h1>Track Your Mood</h1>
      
      <div className="mood-form-container">
        <form onSubmit={handleSubmit} className="mood-form">
          <div className="form-group">
            <label htmlFor="moodType">How are you feeling?</label>
            <select
              id="moodType"
              value={moodType}
              onChange={(e) => setMoodType(e.target.value)}
              required
            >
              <option value="">Select a mood</option>
              {moodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="intensity">Intensity (1-10)</label>
            <input
              type="range"
              id="intensity"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
            />
            <span className="intensity-value">{intensity}</span>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="How are you feeling today?"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Mood'}
          </button>
        </form>
      </div>

      <div className="recent-moods">
        <h2>Recent Moods</h2>
        {moods.length === 0 ? (
          <p>No moods tracked yet. Start tracking to see your mood history.</p>
        ) : (
          <div className="moods-list">
            {moods.slice(0, 5).map(mood => (
              <div key={mood.id} className="mood-item">
                <span className="mood-type">{mood.mood_type}</span>
                <span className="mood-intensity">Intensity: {mood.intensity}</span>
                {mood.description && <p className="mood-description">{mood.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker; 