import api from './api';

// GET /api/listings
export const getAllListings = async () => {
  const res = await api.get('/listings');
  return res.data;
};

// POST /api/listings (protected)
export const createListing = async (data) => {
  const res = await api.post('/listings', data);
  return res.data;
};

