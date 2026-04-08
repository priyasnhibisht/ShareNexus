import api from "./api";

// ✅ SEND REQUEST (CLEAN VERSION)
export const sendRequest = async (listingId) => {
  const res = await api.post("/requests", {
    listingId,   // ✅ ONLY send this
  });

  return res.data;
};

// ✅ GET RECEIVED REQUESTS (OWNER)
export const getReceivedRequests = async () => {
  console.log('getReceivedRequests: calling GET /api/requests/mine');
  const res = await api.get("/requests/mine");  // ✅ FIXED - matches backend
  console.log('getReceivedRequests: response from /requests/mine:', res);
  console.log('getReceivedRequests: res.data:', res.data);
  return res.data;
};

// ✅ APPROVE
export const approveRequest = async (requestId) => {
  const res = await api.put(`/requests/${requestId}/approve`);
  return res.data;
};

// ✅ REJECT
export const rejectRequest = async (requestId) => {
  const res = await api.put(`/requests/${requestId}/reject`);
  return res.data;
};

// ✅ GET CONTACT
export const getContact = async (requestId) => {
  const res = await api.get(`/requests/contact/${requestId}`);
  return res.data;
};

export const getSentRequests = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log('getSentRequests: user from localStorage:', user);
  const userId = user?._id || user?.id;
  console.log('getSentRequests: calling GET /api/requests/sent/', userId);
  const res = await api.get(`/requests/sent/${userId}`);
  console.log('getSentRequests: response from /requests/sent/:userId:', res);
  console.log('getSentRequests: res.data:', res.data);
  return res.data;
};
