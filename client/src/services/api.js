import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Essential for sending and receiving secure HTTP-only cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to format errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'Something went wrong. Please try again.',
      data: error.response?.data
    };
    return Promise.reject(customError);
  }
);

export default api;
