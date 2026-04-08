import axios from 'axios';

// Centralized Axios instance for the ShareNexus backend.
const api=axios.create({
  baseURL: "http://localhost:5001/api",
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

