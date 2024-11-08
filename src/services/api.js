
// services/api.js
import axios from 'axios';

const api = axios.create({
 // baseURL: 'https://nirpekshnandan.com',
 baseURL: 'http://localhost:3001',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Read token at request time
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
