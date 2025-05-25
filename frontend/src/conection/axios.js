// axiosInstance.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/',
  withCredentials: true, // This ensures credentials are sent with each request
});

export default api;
