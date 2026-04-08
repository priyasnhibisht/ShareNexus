import api from "./api";

export const login = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });

  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));

  return res.data.user;
};

export const register = async (name, email, password, course, contact) => {
  const res = await api.post("/auth/register", {
    name,
    email,
    password,
    course,
    contact
  });

  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data.user));

  return res.data.user;
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};