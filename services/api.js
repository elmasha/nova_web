// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://novaserver-production-19a67434.up.railway.app/api',
  headers: { 'Content-Type': 'application/json' },
});

let _fireAuth = null;
export function setFireAuth(auth) {
  _fireAuth = auth;
}

api.interceptors.request.use(
  async (config) => {
    try {
      if (_fireAuth && _fireAuth.currentUser) {
        config.headers['x-firebase-uid'] = _fireAuth.currentUser.uid;
      }
    } catch (err) {
      console.warn('[api] auth attach failed:', err.message);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;