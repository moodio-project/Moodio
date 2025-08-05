# Deployment Checklist

## Pre-Deployment Setup

### Backend Environment Variables
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000` (or leave blank for auto-assignment)
- [ ] `JWT_SECRET` = random string (32+ characters)
- [ ] `SPOTIFY_CLIENT_ID` = your Spotify app client ID
- [ ] `SPOTIFY_CLIENT_SECRET` = your Spotify app client secret
- [ ] `SPOTIFY_REDIRECT_URI` = `https://your-backend-name.onrender.com/auth/spotify/callback`
- [ ] `OPENAI_API_KEY` = your OpenAI API key (optional)
- [ ] `GENIUS_API_KEY` = your Genius API key (optional)

### Frontend Environment Variables
- [ ] `REACT_APP_API_URL` = `https://your-backend-name.onrender.com`

### Spotify App Configuration
- [ ] Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- [ ] Edit your app settings
- [ ] Add redirect URI: `https://your-backend-name.onrender.com/auth/spotify/callback`
- [ ] Save changes

## Render Deployment Steps

### Backend Service
1. [ ] Create new Web Service
2. [ ] Connect GitHub repository
3. [ ] Set name: `moodio-backend`
4. [ ] Set environment: `Node`
5. [ ] Set build command: `npm install --prefix backend`
6. [ ] Set start command: `cd backend && npm start`
7. [ ] Add all environment variables
8. [ ] Deploy and wait for completion

### Frontend Service
1. [ ] Create new Static Site
2. [ ] Connect GitHub repository
3. [ ] Set name: `moodio-frontend`
4. [ ] Set build command: `npm install --prefix frontend && npm run build --prefix frontend`
5. [ ] Set publish directory: `frontend/build`
6. [ ] Add environment variable: `REACT_APP_API_URL`
7. [ ] Deploy and wait for completion

## Post-Deployment Verification

### Backend Health Checks
- [ ] Visit `https://your-backend-name.onrender.com/` - should show API status
- [ ] Visit `https://your-backend-name.onrender.com/api/health` - should show detailed status
- [ ] Check logs for any errors

### Frontend Verification
- [ ] Visit your frontend URL
- [ ] Test login functionality
- [ ] Test Spotify OAuth flow
- [ ] Test mood logging
- [ ] Test search functionality

### Integration Tests
- [ ] Spotify OAuth redirects correctly
- [ ] API calls work from frontend to backend
- [ ] CORS is properly configured
- [ ] Database operations work
- [ ] Error handling works

## Troubleshooting

### Common Issues
- [ ] "No open ports detected" - Check PORT environment variable
- [ ] "Out of memory" - Build process was too heavy (fixed)
- [ ] CORS errors - Check CORS configuration
- [ ] Spotify OAuth fails - Check redirect URI matches exactly
- [ ] Database errors - Check SQLite file permissions

### Debug Steps
1. Check Render logs for errors
2. Verify environment variables are set correctly
3. Test endpoints manually with curl/Postman
4. Check browser console for frontend errors
5. Verify Spotify app settings

## URLs to Test

### Backend Endpoints
- `GET /` - Root health check
- `GET /api/health` - Detailed health check
- `GET /debug/test` - Debug endpoint
- `GET /auth/spotify` - Spotify OAuth start

### Frontend Pages
- `/` - Home/Dashboard
- `/login` - Login page
- `/profile` - User profile
- `/mood` - Mood logging
- `/search` - Search page

## Success Criteria
- [ ] Backend deploys without errors
- [ ] Frontend builds successfully
- [ ] Health checks return 200 OK
- [ ] Spotify OAuth flow works end-to-end
- [ ] All core features function properly
- [ ] No console errors in browser
- [ ] Mobile responsiveness works
- [ ] Performance is acceptable

## Monitoring
- [ ] Set up error tracking (optional)
- [ ] Monitor response times
- [ ] Check for memory leaks
- [ ] Monitor API usage
- [ ] Set up alerts for downtime 