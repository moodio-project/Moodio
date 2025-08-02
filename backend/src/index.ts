import express from 'express';
import cors from 'cors';
import session from 'cookie-session';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import moodRoutes from './routes/moodRoutes';
import spotifyRoutes from './routes/spotifyRoutes';
import aiRoutes from './routes/aiRoutes';

dotenv.config();

const app = express();
const PORT = 3001;

// Environment variables check
console.log('=== Environment Variables Check ===');
console.log(`GENIUS_API_KEY: ${process.env.GENIUS_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
console.log(`SPOTIFY_CLIENT_ID: ${process.env.SPOTIFY_CLIENT_ID ? '✓ Loaded' : '✗ Missing'}`);
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
console.log(`SESSION_SECRET: ${process.env.SESSION_SECRET ? '✓ Loaded' : '✗ Missing'}`);
console.log(`PORT: ${PORT}`);
console.log('=====================================');

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true
}));

app.use(express.json());
app.use(session({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'default-secret'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Backend server is running!'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 