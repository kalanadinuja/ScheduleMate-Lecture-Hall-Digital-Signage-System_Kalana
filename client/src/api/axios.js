import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor: Attach JWT token if present
api.interceptors.request.use(
    (config) => {
        try {
            const authData = localStorage.getItem('schedulemate_auth');
            if (authData) {
                const parsed = JSON.parse(authData);
                if (parsed?.token) {
                    config.headers.Authorization = `Bearer ${parsed.token}`;
                }
            }
        } catch (e) {
            console.error('Error reading token from localStorage', e);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Auto logout on 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('schedulemate_auth');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
