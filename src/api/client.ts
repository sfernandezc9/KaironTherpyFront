import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      delete client.defaults.headers.common['Authorization'];
      window.location.href = '/login';
      return Promise.reject(new Error('Sesión expirada'));
    }
    if (err.response?.status === 403) {
      return Promise.reject(new Error('Acceso denegado'));
    }
    const message = err.response?.data?.error ?? err.message ?? 'Error desconocido';
    return Promise.reject(new Error(message));
  }
);

export default client;
