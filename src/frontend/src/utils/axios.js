import axios from 'axios';

// Set default base URL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5007';
axios.defaults.withCredentials = true;

// Response interceptor to handle 401 (token expired)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, redirect to login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default axios;