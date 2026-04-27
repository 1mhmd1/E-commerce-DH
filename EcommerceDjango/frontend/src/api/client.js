import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload?.exp) return true;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token && !isTokenExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
  return config;
});

export default api;
