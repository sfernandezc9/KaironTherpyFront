import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: '◈' },
  { to: '/pacientes', label: 'Pacientes', icon: '👤' },
  { to: '/terapeutas', label: 'Terapeutas', icon: '🩺', adminOnly: true },
  { to: '/sesiones', label: 'Sesiones', icon: '📅' },
  { to: '/insumos', label: 'Insumos & Stock', icon: '📦', adminOnly: true },
  { to: '/estructura', label: 'Estructura', icon: '🏢', adminOnly: true },
  { to: '/informes', label: 'Informes', icon: '📊', adminOnly: true },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visible = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="h-full bg-slate-100 flex flex-col">
      <div className="px-6 py-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">K</span>
          </div>
          <div>
            <p className="text-sm font-bold text-primary-800 leading-tight">KaironTherapy</p>
            <p className="text-xs text-slate-500 leading-tight">Gestión Clínica</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visible.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-800 text-white'
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`
            }
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-200 space-y-2">
        {user && (
          <div className="px-2 py-1">
            <p className="text-xs font-medium text-slate-700 truncate">
              {user.nombres} {user.apellidos}
            </p>
            <p className="text-xs text-slate-400 capitalize">{user.rol}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <span className="w-5 text-center text-base">↩</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
