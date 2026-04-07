import api from './api';

// POST /api/requests
export const sendRequest = async (listingId) => {
  const res = await api.post('/requests', { listingId });
  return res.data;
};

// GET /api/requests/mine
export const getMyRequests = async () => {
  const res = await api.get('/requests/mine');
  return res.data;
};

// PUT /api/requests/:id/approve
export const approveRequest = async (id) => {
  const res = await api.put(`/requests/${id}/approve`);
  return res.data;
};

// PUT /api/requests/:id/reject
export const rejectRequest = async (id) => {
  const res = await api.put(`/requests/${id}/reject`);
  return res.data;
};

// GET /api/requests/contact/:requestId
export const getContact = async (id) => {
  const res = await api.get(`/requests/contact/${id}`);
  return res.data;
};

