# Moodio Deployment Guide

This guide provides step-by-step instructions for deploying the Moodio music companion app to various platforms.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- Database (PostgreSQL recommended)
- Environment variables configured

### Local Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd Moodio

# Install dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your actual values

# Start development servers
npm run dev
```

## 📋 Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Backend Configuration
PORT=3001
NODE_ENV=production

# Session Security
SESSION_SECRET=your-super-secret-session-key-here

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/moodio

# Spotify API Configuration
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=https://your-domain.com/api/auth/spotify/callback

# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key

# Genius API Configuration
GENIUS_API_KEY=your-genius-api-key

# CORS Configuration
CORS_ORIGIN=https://your-domain.com
```

## 🏗️ Build Process

### Frontend Build
```bash
cd frontend
npm install
npm run build
```

### Backend Build
```bash
cd backend
npm install
npm run build
```

## 🌐 Deployment Platforms

### Railway Deployment

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Select the repository

2. **Configure Environment Variables**
   - Add all required environment variables in Railway dashboard
   - Set `NODE_ENV=production`

3. **Deploy**
   - Railway will automatically detect the Node.js app
   - Set the root directory to `backend`
   - Deploy

4. **Frontend Deployment**
   - Deploy frontend to Vercel/Netlify
   - Update `VITE_API_BASE_URL` to your Railway backend URL

### Render Deployment

1. **Backend Service**
   ```bash
   # Create a new Web Service
   # Build Command: npm install && npm run build
   # Start Command: npm start
   # Root Directory: backend
   ```

2. **Environment Variables**
   - Add all backend environment variables
   - Set `NODE_ENV=production`

3. **Frontend Static Site**
   - Create a new Static Site
   - Build Command: `npm install && npm run build`
   - Publish Directory: `frontend/dist`

### Vercel Deployment

1. **Backend API**
   ```bash
   # Create vercel.json in backend/
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "dist/server.js"
       }
     ]
   }
   ```

2. **Frontend**
   - Connect frontend directory to Vercel
   - Set build command: `npm run build`
   - Set output directory: `dist`

### Netlify Deployment

1. **Frontend Only**
   ```bash
   # Build command: npm run build
   # Publish directory: dist
   # Add environment variables for API URL
   ```

2. **Backend Functions**
   - Use Netlify Functions for API endpoints
   - Convert Express routes to serverless functions

## 🔧 Production Configuration

### Database Setup
```sql
-- Create production database
CREATE DATABASE moodio_production;

-- Run migrations
npm run migrate:production
```

### SSL/HTTPS
- Enable HTTPS in your hosting platform
- Update Spotify redirect URI to use HTTPS
- Set secure cookies in production

### Monitoring
```bash
# Install monitoring tools
npm install --save winston @sentry/node

# Configure logging
```

### Performance Optimization
```bash
# Enable compression
npm install compression

# Enable caching
npm install redis

# Configure CDN for static assets
```

## 🔒 Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection protection
- [ ] XSS protection enabled
- [ ] CSRF protection implemented
- [ ] Secure headers configured
- [ ] Error handling without sensitive data exposure

## 📊 Monitoring & Analytics

### Health Checks
```bash
# Add health check endpoint
GET /api/health
```

### Error Tracking
- Configure Sentry for error tracking
- Set up logging aggregation
- Monitor API response times

### Performance Monitoring
- Set up New Relic or DataDog
- Monitor database performance
- Track user engagement metrics

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```bash
   # Check CORS_ORIGIN configuration
   # Ensure frontend URL is included
   ```

2. **Database Connection**
   ```bash
   # Verify DATABASE_URL
   # Check database permissions
   # Test connection manually
   ```

3. **Spotify OAuth Issues**
   ```bash
   # Verify redirect URI matches exactly
   # Check client ID/secret
   # Ensure HTTPS in production
   ```

4. **Build Failures**
   ```bash
   # Check Node.js version
   # Clear npm cache
   # Verify all dependencies installed
   ```

### Debug Mode
```bash
# Enable debug logging
DEBUG_MODE=true
LOG_LEVEL=debug
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer
- Implement session storage (Redis)
- Database connection pooling

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching strategies

### CDN Configuration
- Serve static assets via CDN
- Configure cache headers
- Optimize image delivery

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - run: npm run deploy
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review logs in your hosting platform
3. Verify environment variables
4. Test locally with production config

## 🎯 Success Metrics

After deployment, verify:
- [ ] All pages load correctly
- [ ] Spotify OAuth works
- [ ] Mood logging functions
- [ ] AI features respond
- [ ] Mobile responsiveness
- [ ] Performance meets standards
- [ ] Error tracking active
- [ ] Monitoring alerts configured 