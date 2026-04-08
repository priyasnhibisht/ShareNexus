import axios from 'axios';

// Centralized Axios instance for the ShareNexus backend.
// Use the same origin in production, and allow an override for local development.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

// Attach auth token from localStorage to every request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

