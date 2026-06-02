import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Usuario } from '../types/auth';
import { getMe } from '../api/auth';
import client from '../api/client';

interface AuthContextValue {
  user: Usuario | null;
  token: string | null;
  isAdmin: boolean;
  isTerapeuta: boolean;
  setAuth: (token: string, user: Usuario) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (!stored) {
      setLoading(false);
      return;
    }
    setToken(stored);
    client.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
    getMe()
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem('token');
        delete client.defaults.headers.common['Authorization'];
      })
      .finally(() => setLoading(false));
  }, []);

  const setAuth = (tok: string, usr: Usuario) => {
    localStorage.setItem('token', tok);
    client.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
    setToken(tok);
    setUser(usr);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete client.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin: user?.rol === 'administrador',
        isTerapeuta: user?.rol === 'terapeuta',
        setAuth,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
