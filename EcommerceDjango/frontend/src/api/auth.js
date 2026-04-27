import api from "./client";

export const login = async ({ username, password }) => {
  const { data } = await api.post("/auth/token/", { username, password });
  localStorage.setItem("accessToken", data.access);
  localStorage.setItem("refreshToken", data.refresh);
  localStorage.setItem("authUser", username);
  return data;
};

export const register = async ({ username, email, password }) => {
  const { data } = await api.post("/auth/register/", {
    username,
    email,
    password,
  });
  return data;
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("authUser");
};
