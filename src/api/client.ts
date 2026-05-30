import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error ?? err.message ?? 'Error desconocido';
    return Promise.reject(new Error(message));
  }
);

export default client;
