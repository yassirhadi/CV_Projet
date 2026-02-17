import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('❌ Le serveur ne répond pas. Démarrez-le sur http://localhost:8080');
    } else {
      const message = error.response?.data?.message || 'Une erreur est survenue';
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default api;