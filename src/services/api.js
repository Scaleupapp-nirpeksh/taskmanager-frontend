// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://nirpekshnandan.com',
  //baseURL: 'http://localhost:3001',
});

// Middleware to ensure no trailing slash is added to endpoints
api.interceptors.request.use((config) => {
  console.log('Request Headers:', config.headers); // Log headers to debug
  return config;
});


export default api;
