# 🎵 Moodio

**Discover how your music affects your mood**

> **Moodio is built as an extension of Spotify — not a replacement.** It uses your existing Spotify account for login, music streaming, and personalized recommendations. A **Spotify Premium account is required** to use the music playback features; free Spotify accounts cannot stream music through Moodio.

## What is Moodio?

Moodio is a full-stack music companion app that connects your listening habits to your emotional well-being. Think of it as a layer on top of Spotify — it integrates with your account so you can stream music, log how you feel, and see patterns in how the music you listen to shapes your mood over time.

## Why was it built?

Most people listen to music every day without thinking about the emotional impact it has on them. Moodio was built to change that — to make music listeners more **conscious and intentional** about how music affects their mental and emotional state. By surfacing those patterns visually, Moodio helps users build a healthier, more self-aware relationship with music.

## What problem does it solve?

Music has a powerful effect on emotions, but that effect is largely invisible. There's no easy way for the average listener to answer questions like:

- What kind of music do I reach for when I'm anxious?
- Does the music I play late at night make me feel worse?
- Are there patterns between what I listen to and how I feel the next day?

Moodio solves this by letting users log their mood alongside their listening activity and then visualizing those patterns over time — turning an unconscious habit into an insight.

## Artist Exploration (Albums)

<img width="1440" height="810" alt="MoodioSearchArtists" src="https://github.com/user-attachments/assets/0c861a18-bd92-4359-bd3d-430f221048bb" />
Artist Search - Comprehensive Music Discovery
Features shown:

Powerful search functionality - Search across tracks, artists, and albums simultaneously
Visual album grid - Beautiful album artwork display with hover effects
Detailed album information - Shows artist name, release year, and track count
Multiple result categories - Tab-based navigation between Tracks (20), Artists (20), and Albums (20)
Clean, Spotify-quality UI - Professional dark theme with mint green accents matching Moodio's brand
Real-time Spotify API integration - Live search results from Spotify's complete music catalog

User Experience:
Users can explore Drake's entire discography including iconic albums like "Views," "Take Care," "Thank Me Later," and recent releases. The album grid layout makes it easy to browse and discover music visually, with each album card displaying essential information at a glance.
Technical Implementation:

React TypeScript frontend with responsive grid layout
Spotify Web API integration for real-time search
Dynamic tab switching between content types
Optimized image loading for album artwork

This demonstrates Moodio's robust search capabilities and seamless integration with Spotify's vast music library, providing users with professional-grade music discovery tools.

## Track Search - Interactive Music Playback & Favorites

<img width="1440" height="809" alt="Screenshot 2025-08-06 at 12 49 56 PM" src="https://github.com/user-attachments/assets/4373a5c0-8413-4e14-b5bf-36665b8e20b6" />

Features shown:

Instant track results - Real-time search displaying top 20 matching tracks
Complete track information - Song title, artist name, album name, and duration displayed for each track
Album artwork thumbnails - Visual identification with high-quality cover art
Dual action buttons - Heart icon for adding to favorites, play button for instant playback
One-click playback - Stream full tracks directly through Moodio's integrated Spotify player
Favorites management - Save favorite tracks with a single click for quick access later
Clean list layout - Easy-to-scan vertical list with hover effects for better UX

User Experience:
Users searching for "Drake" can instantly preview his top tracks including hits like "God's Plan," "NOKIA," "What Did I Miss?," and "Passionfruit." Each track card provides complete metadata and two quick actions: favorite the track (heart icon) or play it immediately (play button). The interface mimics Spotify's familiar design while adding Moodio's unique mood-tracking integration.
Technical Implementation:

React TypeScript with responsive list components
Spotify Web Playback SDK for real-time music streaming
Heart button integration with favorites database (PostgreSQL)
Real-time state management for play/pause states
OAuth 2.0 authentication for secure Spotify access

Key Functionality:

Play Button - Streams full track through Moodio's integrated player (requires Spotify Premium)
Heart Button - Saves track to user's favorites collection for easy retrieval
Track Details - Shows artist, album, and duration at a glance

This demonstrates Moodio's core music discovery and playback capabilities, allowing users to search, play, and save their favorite tracks while tracking how music affects their emotional state.

## ✨ Features

- **🔐 Secure Spotify Authentication** - OAuth 2.0 integration for seamless login
- **🎵 Real-Time Music Streaming** - Full Spotify Web Playbook SDK integration for in-browser playback
- **📊 Mood Tracking & Visualization** - Log emotions with intensity levels and view patterns over time
- **🎯 Intelligent Recommendations** - Personalized song suggestions based on mood patterns and audio features
- **🎤 Artist Exploration** - Comprehensive artist pages with biographies and discographies
- **❤️ Favorites System** - Save and organize your favorite tracks with heart buttons
- **📱 Responsive Design** - Professional Spotify-quality interface that works on all devices

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** with a custom dark theme
- **Chart.js** (via `react-chartjs-2`) for mood visualization
- **React Router v7** for client-side navigation

### Backend
- **Node.js** with Express.js
- **PostgreSQL** (production) / **SQLite** (development) for data storage
- **JWT** + **bcryptjs** for authentication and password hashing

### APIs & Integrations
- **Spotify Web API** for music data, search, and user authentication
- **Spotify Web Playback SDK** for in-browser music streaming
- **OpenAI API** for intelligent mood-based music recommendations
- **Genius Lyrics API** for song lyrics data
- **OAuth 2.0** for secure Spotify authentication flow


## 🌐 Live Demo

> _Add your deployed URL here once live (e.g. Netlify, Render, Railway)_

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- A [Spotify Developer](https://developer.spotify.com/dashboard) app with Client ID, Client Secret, and a redirect URI set
- An OpenAI API key
- A Genius API key

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/KrisNoel23/Moodio.git
   cd Moodio
   ```

2. **Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in `backend/` with:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:3001/auth/callback
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_key
   GENIUS_ACCESS_TOKEN=your_genius_token
   ```
   Then start the server:
   ```bash
   npm run dev   # runs on http://localhost:3001
   ```

3. **Frontend**
   ```bash
   cd frontend
   npm install
   npm start     # runs on http://localhost:3000
   ```

4. Open [http://localhost:3000](http://localhost:3000) and log in with your Spotify account.

> **Note:** Music playback requires a Spotify Premium account.

## 🎯 Usage

1. **Login** with your Spotify account using OAuth 2.0
2. **Stream Music** directly in the app using the integrated player
3. **Log Moods** with intensity levels and optional notes
4. **Explore Artists** to discover biographical information and discographies
5. **Save Favorites** using heart buttons throughout the app
6. **View Insights** on your mood patterns and music correlations
7. **Get Recommendations** based on your emotional listening patterns

## 🏗️ Architecture

```
moodio/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── api/            # API service functions
│   │   └── App.tsx         # Main application component
├── backend/                 # Node.js Express backend
│   ├── routes/             # API route handlers
│   ├── middleware/         # Authentication & validation
│   ├── database/           # SQLite database setup
│   └── server.js          # Express server configuration
└── README.md
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE] file for details.

## 🙏 Acknowledgments

- **Spotify** for their incredible Web API and Web Playbook SDK
- **The Marcy Lab School** for the comprehensive software engineering education
- **My cohort** for support and feedback throughout the development process
- **Open source community** for the tools and libraries that made this possible

## 📧 Contact

**Kristopher Noel**  
📧 noelkris500@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/kristhesoftwareengineer/)  
🐙 [GitHub](https://github.com/KrisNoel23)
🌐 [Portfolio](https://krisnoelportfolio.netlify.app/)

---

**Built with ❤️ and lots of ☕ by Kristopher Noel**

*Connecting music and emotions through technology*
