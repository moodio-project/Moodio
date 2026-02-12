const express = require("express");
const router = express.Router();
const db = require("../config/database");
const authenticateToken = require("../middleware/auth");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI-powered mood analysis and recommendations
router.post("/mood-recommendations", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's recent mood logs (SQLite)
    db.all(
      "SELECT mood, intensity, note, created_at FROM moods WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
      [userId],
      async (err, moods) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Failed to process request" });
        }

        if (!moods || moods.length === 0) {
          return res.json({
            recommendations: [
              "Start logging your moods to get personalized recommendations!",
            ],
            insights: "No mood data available yet.",
            suggested_genres: ["pop", "indie", "chill"],
          });
        }

        try {
          const moodSummary = moods
            .map(
              (m) =>
                `${m.mood} (intensity: ${m.intensity}/10) - ${m.note || "no note"}`,
            )
            .join("\n");

          const prompt = `
Based on these recent mood logs from a music listener:

${moodSummary}

Please provide personalized music recommendations in this exact JSON format:
{
  "insights": "A 2-3 sentence analysis of their mood patterns",
  "recommendations": [
    "3-4 specific actionable recommendations for music to improve their mood or match their current state"
  ],
  "suggested_genres": ["3-4 music genres that would work well"],
  "playlist_theme": "A creative name for a playlist based on their mood pattern"
}

Focus on being helpful, empathetic, and specific about how music can support their emotional wellbeing.`;

          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500,
            temperature: 0.7,
          });

          const aiResponse = completion.choices[0].message.content;

          try {
            const parsedResponse = JSON.parse(aiResponse);
            res.json(parsedResponse);
          } catch (parseError) {
            // Fallback if JSON parsing fails
            res.json({
              insights: aiResponse,
              recommendations: [
                "Try listening to music that matches your current mood",
              ],
              suggested_genres: ["pop", "indie", "alternative"],
              playlist_theme: "Your Mood Mix",
            });
          }
        } catch (aiError) {
          console.error("OpenAI API error:", aiError);
          res
            .status(500)
            .json({ error: "Failed to generate AI recommendations" });
        }
      },
    );
  } catch (error) {
    console.error("Mood recommendations error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// AI mood insights for dashboard
router.get("/mood-insights", authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;

    db.all(
      "SELECT mood, intensity, created_at FROM moods WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
      [userId],
      async (err, moods) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Failed to get insights" });
        }

        if (!moods || moods.length === 0) {
          return res.json({
            insight: "Start logging moods to see AI insights!",
          });
        }

        const moodCounts = {};
        let totalIntensity = 0;

        moods.forEach((mood) => {
          moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
          totalIntensity += mood.intensity;
        });

        const averageIntensity = (totalIntensity / moods.length).toFixed(1);
        const dominantMood = Object.entries(moodCounts).sort(
          (a, b) => b[1] - a[1],
        )[0][0];

        // Try OpenAI for a richer insight, fall back to basic
        try {
          const prompt = `
Based on recent mood data:
- Most frequent mood: ${dominantMood}  
- Average intensity: ${averageIntensity}/10
- Total mood logs: ${moods.length}
- Recent moods: ${moods
            .slice(0, 5)
            .map((m) => m.mood)
            .join(", ")}

Provide a brief, encouraging insight (1-2 sentences) about their emotional patterns and how music might help.`;

          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 100,
            temperature: 0.8,
          });

          res.json({
            insight: completion.choices[0].message.content.trim(),
            dominantMood,
            averageIntensity,
            totalLogs: moods.length,
          });
        } catch (aiError) {
          // Fallback without OpenAI
          console.error("OpenAI error, using fallback:", aiError.message);
          res.json({
            insight: `You've been feeling mostly ${dominantMood} lately. Music can be a great way to support your emotional journey!`,
            dominantMood,
            averageIntensity,
            totalLogs: moods.length,
          });
        }
      },
    );
  } catch (error) {
    console.error("Mood insights error:", error);
    res.status(500).json({ error: "Failed to get insights" });
  }
});

module.exports = router;
