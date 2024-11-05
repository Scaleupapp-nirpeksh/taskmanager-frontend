// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
 // baseURL: 'http://localhost:5002', // Replace with your backend URL if different
  baseURL: 'https://nirpekshnandan.com',
});

export default api;
