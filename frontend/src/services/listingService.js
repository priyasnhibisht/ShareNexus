import api from "./api";

// ✅ ALL listings (used in Requests page)
export const getListings = async () => {
  const res = await api.get("/listings");
  return res.data;
};

// ✅ ONLY USER LISTINGS
export const getMyListings = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user._id || user.id;
  console.log('getMyListings: user object from localStorage:', user);
  console.log('getMyListings: calling GET /listings/my/', userId);
  const res = await api.get(`/listings/my/${userId}`);
  console.log('getMyListings: response data:', res.data);
  return res.data;
};

// ✅ CREATE (FIXED)
export const createListing = async (data) => {
  const user = JSON.parse(localStorage.getItem("user"));

  const newListing = {
    ...data,
    ownerName: user?.name || "Unknown", // fallback safe
    ownerId: user?._id,
  };

  const res = await api.post("/listings", newListing);
  return res.data;
};

// ✅ DELETE
export const deleteListing = async (id) => {
  const res = await api.delete(`/listings/${id}`);
  return res.data;
};