import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // PHP rejects oversized uploads before Laravel runs, so the body is not JSON.
    if (error.response?.status === 413) {
      error.response.data = { message: 'The file is too large to upload. Videos and files can be up to 100MB, images up to 10MB.' };
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect to login if not already on public auth pages
      if (window.location.pathname !== '/login' && 
          window.location.pathname !== '/forgot-password' && 
          window.location.pathname !== '/reset-password') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
