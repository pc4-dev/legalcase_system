import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'https://legalcase-system-1.onrender.com/api',  // ← hardcode fallback
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ng_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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