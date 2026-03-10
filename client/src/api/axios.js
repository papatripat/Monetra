import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor untuk menambahkan JWT token ke setiap request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('monetra_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor untuk handle response error (token expired, dll)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('monetra_token');
            localStorage.removeItem('monetra_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
