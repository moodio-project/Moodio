const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:5173';

async function testAuthFlow() {
  console.log('🧪 Testing Moodio Authentication Flow...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing backend health...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Backend is running:', health.data.message);

    // Test 2: Environment variables
    console.log('\n2. Testing environment variables...');
    const env = await axios.get(`${API_BASE}/ai/test-env`);
    console.log('✅ Environment variables loaded:', env.data);

    // Test 3: Login endpoint
    console.log('\n3. Testing login endpoint...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'demo@example.com',
      password: 'password123'
    });
    console.log('✅ Login successful:', loginResponse.data.user.username);

    // Test 4: Spotify OAuth URL
    console.log('\n4. Testing Spotify OAuth...');
    const spotifyAuth = await axios.get(`${API_BASE}/auth/spotify`);
    console.log('✅ Spotify OAuth URL generated:', spotifyAuth.data.authUrl.includes('spotify.com'));

    // Test 5: Protected endpoint with token
    console.log('\n5. Testing protected endpoint...');
    const token = loginResponse.data.token;
    const profile = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Protected endpoint accessible:', profile.data.user.email);

    // Test 6: AI recommendations
    console.log('\n6. Testing AI recommendations...');
    const recommendations = await axios.get(`${API_BASE}/ai/song-recommendations?mood=happy`);
    console.log('✅ AI recommendations working:', recommendations.data.recommendations.length, 'songs');

    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📱 Frontend should be available at:', FRONTEND_URL);
    console.log('🔐 Login with: demo@example.com / password123');
    console.log('🎵 Spotify OAuth is configured and ready');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuthFlow(); 