import axios from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions for different endpoints
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/users/login', { email, password }),
  
  register: (username: string, email: string, password: string) => 
    api.post('/users/register', { username, email, password }),
  
  getProfile: () => 
    api.get('/users/profile'),
};

export const moodAPI = {
  getAll: () => 
    api.get('/moods'),
  
  getByUserId: (userId: number) => 
    api.get(`/moods/user/${userId}`),
  
  getStats: (userId: number) => 
    api.get(`/moods/stats/${userId}`),
  
  create: (moodData: any) => 
    api.post('/moods', moodData),
  
  update: (id: number, moodData: any) => 
    api.put(`/moods/${id}`, moodData),
  
  delete: (id: number) => 
    api.delete(`/moods/${id}`),
};

export const musicAPI = {
  getAll: () => 
    api.get('/music'),
  
  getByMood: (moodType: string) => 
    api.get(`/music/mood/${moodType}`),
  
  getByGenre: (genre: string) => 
    api.get(`/music/genre/${genre}`),
  
  search: (query: string) => 
    api.get(`/music/search?q=${encodeURIComponent(query)}`),
  
  create: (musicData: any) => 
    api.post('/music', musicData),
  
  update: (id: number, musicData: any) => 
    api.put(`/music/${id}`, musicData),
  
  delete: (id: number) => 
    api.delete(`/music/${id}`),
}; 