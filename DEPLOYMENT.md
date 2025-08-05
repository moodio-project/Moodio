# Moodio Deployment Guide

## Deploying to Render

### Backend Deployment

1. **Create a new Web Service on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the service:**
   - **Name**: `moodio-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install --prefix backend`
   - **Start Command**: `cd backend && npm start`

3. **Set Environment Variables:**
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or leave blank for auto-assignment)
   - `JWT_SECRET`: Generate a random string
   - `SPOTIFY_CLIENT_ID`: Your Spotify app client ID
   - `SPOTIFY_CLIENT_SECRET`: Your Spotify app client secret
   - `SPOTIFY_REDIRECT_URI`: `https://your-backend-name.onrender.com/auth/spotify/callback`
   - `OPENAI_API_KEY`: Your OpenAI API key (optional)
   - `GENIUS_API_KEY`: Your Genius API key (optional)

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

### Frontend Deployment

1. **Create a new Static Site on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure the service:**
   - **Name**: `moodio-frontend`
   - **Build Command**: `npm install --prefix frontend && npm run build --prefix frontend`
   - **Publish Directory**: `frontend/build`

3. **Set Environment Variables:**
   - `REACT_APP_API_URL`: `https://your-backend-name.onrender.com`

4. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment to complete

### Troubleshooting

#### Common Issues:

1. **"No open ports detected"**
   - Make sure your server is binding to `process.env.PORT`
   - Check that the start command is correct

2. **"Out of memory"**
   - The build process was using too much memory
   - Fixed by removing frontend build from backend deployment

3. **CORS errors**
   - Make sure CORS is configured for production URLs
   - Check that the frontend URL is added to allowed origins

4. **Database issues**
   - SQLite database is included in the deployment
   - Data will persist between deployments

#### Health Checks:

- Backend health: `https://your-backend-name.onrender.com/api/health`
- Root endpoint: `https://your-backend-name.onrender.com/`

#### Environment Variables Checklist:

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000` (or auto-assigned)
- [ ] `JWT_SECRET` = random string
- [ ] `SPOTIFY_CLIENT_ID` = your Spotify app ID
- [ ] `SPOTIFY_CLIENT_SECRET` = your Spotify app secret
- [ ] `SPOTIFY_REDIRECT_URI` = `https://your-backend-name.onrender.com/auth/spotify/callback`
- [ ] `OPENAI_API_KEY` = your OpenAI key (optional)
- [ ] `GENIUS_API_KEY` = your Genius key (optional)

### Local Development

```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev

# Or start with clean ports
npm run dev:clean
```

### Production URLs

After deployment, update your Spotify app settings:

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Edit your app
3. Add redirect URI: `https://your-backend-name.onrender.com/auth/spotify/callback`
4. Save changes 