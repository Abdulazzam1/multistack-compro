import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: Tambahkan token JWT jika ada ─────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('multistack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: Handle 401 (token expired/invalid) ──────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('multistack_token');
      localStorage.removeItem('multistack_admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
