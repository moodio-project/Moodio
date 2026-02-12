// utils/helpers.js

function getMoodDescription(mood, valence, energy) {
  const descriptions = {
    energetic: "High-energy, uplifting music that gets you moving",
    happy: "Positive, feel-good vibes that brighten your day",
    melancholy: "Introspective, emotional music for reflective moments",
    intense: "Powerful, dramatic music with strong emotional impact",
    contemplative: "Thoughtful, deeper music for quiet reflection",
    balanced: "A versatile mix of emotions and energy levels",
  };
  return descriptions[mood] || "A unique blend of musical emotions";
}

module.exports = { getMoodDescription };
