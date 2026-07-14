import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Usuario } from '../types/auth';
import { getMe, logout as logoutApi } from '../api/auth';

interface AuthContextValue {
  user: Usuario | null;
  isAdmin: boolean;
  isTerapeuta: boolean;
  setAuth: (user: Usuario) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // La sesión vive en una cookie httpOnly; se valida pidiendo /auth/me
    getMe()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const setAuth = (usr: Usuario) => {
    setUser(usr);
  };

  const logout = () => {
    logoutApi().catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
