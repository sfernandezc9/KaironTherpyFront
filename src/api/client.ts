import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // envía la cookie httpOnly de sesión
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // La verificación inicial de sesión la maneja AuthContext; no redirigir aquí
      const url: string = err.config?.url ?? '';
      if (url.endsWith('/auth/me')) {
        return Promise.reject(new Error('No autenticado'));
      }
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
