import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({ baseURL: API_URL });

// Intercept responses to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authData = localStorage.getItem('ecoloop_auth');
      const currentPath = window.location.pathname;
      const errorMessage = error.response?.data?.message || '';
      
      // Only redirect if:
      // 1. We have auth data stored
      // 2. We're not on an auth page
      // 3. The error is about token expiration/invalidity (not just missing auth)
      if (authData && 
          !currentPath.match(/^\/(login|register|forgot-password|reset-password)$/) &&
          (errorMessage.includes('expired') || errorMessage.includes('invalid') || errorMessage.includes('token'))) {
        localStorage.removeItem('ecoloop_auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}
