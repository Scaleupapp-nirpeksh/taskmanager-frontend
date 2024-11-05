// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://nirpekshnandan.com',
});

// Middleware to ensure no trailing slash is added to endpoints
api.interceptors.request.use((config) => {
  if (config.url.endsWith('/')) {
    config.url = config.url.slice(0, -1); // Remove trailing slash if present
  }
  return config;
});

export default api;
