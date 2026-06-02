import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../ui/Spinner';
import type { Rol } from '../../types/auth';

interface Props {
  children: ReactNode;
  requiredRole?: Rol;
}

export default function PrivateRoute({ children, requiredRole }: Props) {
  const { user, loading } = useAuth();

  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.rol !== requiredRole) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 text-sm">Acceso denegado</p>
      </div>
    );
  }

  return <>{children}</>;
}
