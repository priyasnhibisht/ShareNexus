import api from "./api";

// Fetch current user's coin balance
export const getCoins = async () => {
  const res = await api.get("/auth/coins");
  return res.data.coins;
};

// Send a tip to a listing owner
export const tipCoins = async (requestId, amount) => {
  const res = await api.post("/coins/tip", { requestId, amount });
  return res.data;
};
