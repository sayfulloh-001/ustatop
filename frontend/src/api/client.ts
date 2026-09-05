import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: sends HTTP-only cookies automatically with every request
  withCredentials: true,
});

// Global error handler — 401 means session expired (cookie removed server-side)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // No need to clear localStorage — cookie is managed by server
    return Promise.reject(error);
  }
);
