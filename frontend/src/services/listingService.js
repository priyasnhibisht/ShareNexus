import api from "./api";

// ✅ ALL listings (used in Requests page)
export const getListings = async () => {
  const res = await api.get("/listings");
  return res.data;
};

// ✅ ONLY USER LISTINGS
export const getMyListings = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const res = await api.get(`/listings/my/${user._id}`);
  return res.data;
};

// ✅ CREATE (FIXED)
export const createListing = async (data) => {
  const user = JSON.parse(localStorage.getItem("user"));

  const newListing = {
    ...data,
    category: "resource", // required field
    ownerName: user?.name || "Unknown", // fallback safe
    ownerId: user?._id,
  };

  const res = await api.post("/listings", newListing);
  return res.data;
};

// ✅ DELETE
export const deleteListing = async (id) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const res = await api.delete(`/listings/${id}/${user._id}`);
  return res.data;
};