import express from 'express';
import cors from 'cors';
import cookieSession from 'cookie-session';
import dotenv from 'dotenv';
import { errorHandler } from './src/middleware/errorHandler';
import { checkAuth } from './src/middleware/checkAuth';
import userRoutes from './src/routes/userRoutes';
import moodRoutes from './src/routes/moodRoutes';
import musicRoutes from './src/routes/musicRoutes';
import authRoutes from './src/routes/authRoutes';
import spotifyRoutes from './src/routes/spotifyRoutes';
import artistRoutes from './src/routes/artistRoutes';
import aiRoutes from './src/routes/aiRoutes';

dotenv.config();

const app = express();

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieSession({
  name: 'session',
  secret: process.env.SESSION_SECRET || 'secret',
  maxAge: 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
}));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/moods', checkAuth, moodRoutes);
app.use('/api/music', checkAuth, musicRoutes);
app.use('/api/spotify', checkAuth, spotifyRoutes);
app.use('/api/artists', checkAuth, artistRoutes);
app.use('/api/ai', aiRoutes); // AI routes (some endpoints don't require auth)
app.use('/api/users', userRoutes);

app.use(errorHandler);

dotenv.config();

// Debug: Check if environment variables are loaded
console.log('=== Environment Variables Check ===');
console.log('GENIUS_API_KEY:', process.env.GENIUS_API_KEY ? '✓ Loaded' : '✗ Missing');
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? '✓ Loaded' : '✗ Missing');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✓ Loaded' : '✗ Missing');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✓ Loaded' : '✗ Missing');
console.log('PORT:', process.env.PORT || '3001');
console.log('=====================================');

export default app; 