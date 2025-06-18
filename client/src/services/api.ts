import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (email: string, password: string) =>
    api.post('/register', { email, password }),
  
  login: (email: string, password: string) =>
    api.post('/login', { email, password }),
};

// Stock API calls
export const stockAPI = {
  search: (query: string) =>
    api.get(`/stocks/search?query=${encodeURIComponent(query)}`),
    
  getAll: () =>
    api.get('/stocks'),
    
  refresh: () =>
    api.post('/stocks/refresh'),
};

// Subscription API calls
export const subscriptionAPI = {
  get: () =>
    api.get('/subscriptions'),
    
  add: (ticker: string) =>
    api.post('/subscriptions', { ticker }),
    
  remove: (ticker: string) =>
    api.delete(`/subscriptions/${ticker}`),
};

export default api; 