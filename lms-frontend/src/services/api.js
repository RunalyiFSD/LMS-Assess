import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true, // Necessary for httpOnly session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle global errors or token expirations
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, could clear context or trigger logout
    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
