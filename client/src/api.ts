import axios from 'axios';

const getBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL;
  
  if (!envUrl) {
    return 'http://localhost:3000/api';
  }

  // Remove trailing slash if present
  envUrl = envUrl.replace(/\/$/, '');

  // If the URL already ends with /api, return it as is
  if (envUrl.endsWith('/api')) {
    return envUrl;
  }

  // Otherwise append /api
  return `${envUrl}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
