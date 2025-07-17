import express from 'express';
import cors from 'cors';
import cookieSession from 'cookie-session';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { checkAuth } from './middleware/checkAuth';
import userRoutes from './routes/userRoutes';
import moodRoutes from './routes/moodRoutes';
import musicRoutes from './routes/musicRoutes';
import authRoutes from './routes/authRoutes';
import spotifyRoutes from './routes/spotifyRoutes';
import artistRoutes from './routes/artistRoutes';

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
app.use('/api/users', userRoutes);

app.use(errorHandler);

export default app; 