// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Attach token from storage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ng_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ng_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
