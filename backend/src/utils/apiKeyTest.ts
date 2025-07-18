import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface TestResult {
  service: string;
  status: 'success' | 'error';
  message: string;
  details?: any;
}

class APIKeyTester {
  private results: TestResult[] = [];

  async testSpotifyAPI(): Promise<TestResult> {
    try {
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return {
          service: 'Spotify',
          status: 'error',
          message: 'Missing Spotify API credentials'
        };
      }

      // Test Spotify API credentials by getting client credentials token
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.access_token) {
        return {
          service: 'Spotify',
          status: 'success',
          message: 'Spotify API credentials are valid',
          details: { token_type: response.data.token_type }
        };
      } else {
        return {
          service: 'Spotify',
          status: 'error',
          message: 'Failed to get Spotify access token'
        };
      }
    } catch (error: any) {
      return {
        service: 'Spotify',
        status: 'error',
        message: `Spotify API test failed: ${error.response?.data?.error || error.message}`
      };
    }
  }

  async testOpenAIAPI(): Promise<TestResult> {
    try {
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        return {
          service: 'OpenAI',
          status: 'error',
          message: 'Missing OpenAI API key'
        };
      }

      // Test OpenAI API with a simple completion
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: 'Hello! This is a test message. Please respond with "API test successful"'
            }
          ],
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.choices && response.data.choices.length > 0) {
        return {
          service: 'OpenAI',
          status: 'success',
          message: 'OpenAI API key is valid',
          details: { model: response.data.model }
        };
      } else {
        return {
          service: 'OpenAI',
          status: 'error',
          message: 'OpenAI API returned unexpected response'
        };
      }
    } catch (error: any) {
      return {
        service: 'OpenAI',
        status: 'error',
        message: `OpenAI API test failed: ${error.response?.data?.error?.message || error.message}`
      };
    }
  }

  async testGeniusAPI(): Promise<TestResult> {
    try {
      const apiKey = process.env.GENIUS_API_KEY;

      if (!apiKey) {
        return {
          service: 'Genius',
          status: 'error',
          message: 'Missing Genius API key'
        };
      }

      // Test Genius API with a simple search
      const response = await axios.get(
        'https://api.genius.com/search?q=test',
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      if (response.data.response) {
        return {
          service: 'Genius',
          status: 'success',
          message: 'Genius API key is valid',
          details: { hits: response.data.response.hits?.length || 0 }
        };
      } else {
        return {
          service: 'Genius',
          status: 'error',
          message: 'Genius API returned unexpected response'
        };
      }
    } catch (error: any) {
      return {
        service: 'Genius',
        status: 'error',
        message: `Genius API test failed: ${error.response?.data?.error || error.message}`
      };
    }
  }

  async testPostgreSQL(): Promise<TestResult> {
    try {
      const { Pool } = require('pg');
      
      const pool = new Pool({
        host: process.env.PG_HOST || 'localhost',
        port: Number(process.env.PG_PORT) || 5432,
        user: process.env.PG_USER || 'postgres',
        password: process.env.PG_PASS || '123',
        database: process.env.PG_DB || 'moodio',
      });

      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      await pool.end();

      return {
        service: 'PostgreSQL',
        status: 'success',
        message: 'PostgreSQL connection successful',
        details: { timestamp: result.rows[0].now }
      };
    } catch (error: any) {
      return {
        service: 'PostgreSQL',
        status: 'error',
        message: `PostgreSQL connection failed: ${error.message}`
      };
    }
  }

  async runAllTests(): Promise<TestResult[]> {
    console.log('🔍 Testing API Keys and Database Connection...\n');

    this.results = await Promise.all([
      this.testSpotifyAPI(),
      this.testOpenAIAPI(),
      this.testGeniusAPI(),
      this.testPostgreSQL()
    ]);

    return this.results;
  }

  printResults(): void {
    console.log('📊 API Key Test Results:\n');
    
    this.results.forEach(result => {
      const icon = result.status === 'success' ? '✅' : '❌';
      console.log(`${icon} ${result.service}: ${result.message}`);
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details)}`);
      }
      console.log('');
    });

    const successCount = this.results.filter(r => r.status === 'success').length;
    const totalCount = this.results.length;
    
    console.log(`📈 Summary: ${successCount}/${totalCount} services working correctly`);
    
    if (successCount === totalCount) {
      console.log('🎉 All API keys and database connection are working!');
    } else {
      console.log('⚠️  Some services need attention. Check the errors above.');
    }
  }
}

// Export for use in other files
export const apiKeyTester = new APIKeyTester();

// Run tests if this file is executed directly
if (require.main === module) {
  apiKeyTester.runAllTests().then(() => {
    apiKeyTester.printResults();
    process.exit(0);
  }).catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
} 