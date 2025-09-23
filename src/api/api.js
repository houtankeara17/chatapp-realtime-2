// api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // if you use cookies
});

// Interceptor to include JWT token in all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
