import api from './api';

// Helper to safely parse JSON from localStorage.
const parseUser = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// POST /api/auth/register
export const register = async (name, email, password, course) => {
  const res = await api.post('/auth/register', { name, email, password, course });
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('user', JSON.stringify(res.data.user));
  return res.data.user;
};

// POST /api/auth/login
export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('user', JSON.stringify(res.data.user));
  return res.data.user;
};

// Clear auth state.
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Return currently logged-in user.
export const getCurrentUser = () => parseUser(localStorage.getItem('user'));

