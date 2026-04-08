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
  const res = await api.get("/requests/mine");  // ✅ FIXED - matches backend
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
  const res = await api.get(`/requests/sent/${user._id}`);
  return res.data;
};