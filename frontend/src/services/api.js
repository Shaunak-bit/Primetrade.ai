import axios from 'axios';

// ---------------------------------------------------------------------------
// In-memory token store — never written to localStorage or sessionStorage.
// XSS scripts cannot access this; it lives only in the JS module scope.
// Trade-off: token is lost on page refresh (user must re-login).
// For full persistence without XSS risk, move to HttpOnly cookies on the backend.
// ---------------------------------------------------------------------------
let _accessToken = null;

export const setToken = (token) => {
  _accessToken = token;
  // Only store a non-sensitive flag so the UI knows a session exists on refresh
  if (typeof window !== 'undefined') {
    localStorage.setItem('isLoggedIn', 'true');
  }
};

export const getToken = () => _accessToken;

export const clearToken = () => {
  _accessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user'); // safe to keep non-sensitive user info here
  }
};

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Event listener registry for handling automatic global logout on 401 Unauthorized
let onUnauthorizedCallback = null;

export const setUnauthorizedCallback = (callback) => {
  onUnauthorizedCallback = callback;
};

// Request Interceptor: Attach in-memory token if available
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401s and trigger token wipe / state reset
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Session expired or unauthorized. Logging out user...');
      clearToken();

      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default api;