import { Router } from 'express';
import { checkAuth } from '../middleware/checkAuth';
import axios from 'axios';
import db from '../db/knex';

const router = Router();

// Get user's recently played tracks from Spotify
router.get('/history', checkAuth, async (req, res) => {
  try {
    const accessToken = (req.session as any).spotifyAccessToken;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'No Spotify access token' });
    }

    // Fetch recently played tracks from Spotify API
    const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=20', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const tracks = response.data.items.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists[0].name,
      album: item.track.album.name,
      album_art: item.track.album.images[0]?.url,
      played_at: item.played_at,
      duration_ms: item.track.duration_ms,
      uri: item.track.uri
    }));

    // Store in database
    const userId = (req.session as any).userId;
    for (const track of tracks) {
      await db('listening_history').insert({
        user_id: userId,
        song_id: track.id,
        listened_at: new Date(track.played_at),
        song_name: track.name,
        artist_name: track.artist,
        album_name: track.album,
        album_art: track.album_art
      }).onConflict(['user_id', 'song_id', 'listened_at']).ignore();
    }

    return res.json(tracks);
  } catch (error) {
    console.error('Error fetching listening history:', error);
    return res.status(500).json({ error: 'Failed to fetch listening history' });
  }
});

// Get user's top tracks
router.get('/top-tracks', checkAuth, async (req, res) => {
  try {
    const accessToken = (req.session as any).spotifyAccessToken;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'No Spotify access token' });
    }

    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=medium_term', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const tracks = response.data.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      album_art: track.album.images[0]?.url,
      duration_ms: track.duration_ms,
      uri: track.uri,
      popularity: track.popularity
    }));

    return res.json(tracks);
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    return res.status(500).json({ error: 'Failed to fetch top tracks' });
  }
});

// Search Spotify
router.get('/search', checkAuth, async (req, res) => {
  try {
    const { q, type = 'track' } = req.query;
    const accessToken = (req.session as any).spotifyAccessToken;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'No Spotify access token' });
    }

    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q as string)}&type=${type}&limit=20`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return res.status(500).json({ error: 'Failed to search Spotify' });
  }
});

// Get artist details
router.get('/artist/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const accessToken = (req.session as any).spotifyAccessToken;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'No Spotify access token' });
    }

    const response = await axios.get(`https://api.spotify.com/v1/artists/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Error fetching artist:', error);
    return res.status(500).json({ error: 'Failed to fetch artist' });
  }
});

// Get artist's top tracks
router.get('/artist/:id/top-tracks', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const accessToken = (req.session as any).spotifyAccessToken;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'No Spotify access token' });
    }

    const response = await axios.get(`https://api.spotify.com/v1/artists/${id}/top-tracks?market=US`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Error fetching artist top tracks:', error);
    return res.status(500).json({ error: 'Failed to fetch artist top tracks' });
  }
});

import { Router } from 'express';
import { checkAuth } from '../middleware/checkAuth';
import axios from 'axios';
import db from '../db/knex';

const router = Router();

// Get user's recently played tracks from Spotify
router.get('/history', checkAuth, async (req, res) => {
  try {
    const accessToken = (req.session as any).spotifyAccessToken;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'No Spotify access token' });
    }

    // Fetch recently played tracks from Spotify API
    const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=20', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const tracks = response.data.items.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists[0].name,
      album: item.track.album.name,
      album_art: item.track.album.images[0]?.url,
      played_at: item.played_at,
      duration_ms: item.track.duration_ms,
      uri: item.track.uri
    }));

    // Store in database
    const userId = (req.session as any).userId;
    for (const track of tracks) {
      await db('listening_history').insert({
        user_id: userId,
        song_id: track.id,
        listened_at: new Date(track.played_at),
        song_name: track.name,
        artist_name: track.artist,
        album_name: track.album,
        album_art: track.album_art
      }).onConflict(['user_id', 'song_id', 'listened_at']).ignore();
    }

    return res.json(tracks);
  } catch (error) {
    console.error('Error fetching listening history:', error);
    return res.status(500).json({ error: 'Failed to fetch listening history' });
  }
});

// Get user's top tracks
router.get('/top-tracks', checkAuth, async (req, res) => {
  try {
    const accessToken = (req.session as any).spotifyAccessToken;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'No Spotify access token' });
    }

    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=medium_term', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const tracks = response.data.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      album_art: track.album.images[0]?.url,
      duration_ms: track.duration_ms,
      uri: track.uri,
      popularity: track.popularity
    }));

    return res.json(tracks);
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    return res.status(500).json({ error: 'Failed to fetch top tracks' });
  }
});

// Search Spotify
router.get('/search', checkAuth, async (req, res) => {
  try {
    const { q, type = 'track' } = req.query;
    const accessToken = (req.session as any).spotifyAccessToken;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'No Spotify access token' });
    }

    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q as string)}&type=${type}&limit=20`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return res.status(500).json({ error: 'Failed to search Spotify' });
  }
});

// Get artist details
router.get('/artist/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const accessToken = (req.session as any).spotifyAccessToken;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'No Spotify access token' });
    }

    const response = await axios.get(`https://api.spotify.com/v1/artists/${id}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Error fetching artist:', error);
    return res.status(500).json({ error: 'Failed to fetch artist' });
  }
});

// Get artist's top tracks
router.get('/artist/:id/top-tracks', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const accessToken = (req.session as any).spotifyAccessToken;
    
    if (!accessToken) {
      return res.status(401).json({ error: 'No Spotify access token' });
    }

    const response = await axios.get(`https://api.spotify.com/v1/artists/${id}/top-tracks?market=US`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Error fetching artist top tracks:', error);
    return res.status(500).json({ error: 'Failed to fetch artist top tracks' });
  }
});

export default router; 