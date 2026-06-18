import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// ── SVG Icons ────────────────────────────────────────────────────────────────
const IconGrid = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const IconUser = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="9" r="4" />
    <path d="M5 21c0-4 3.1-7 7-7s7 3 7 7" />
  </svg>
);

const IconUsers = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20c0-3.3 2.7-5.5 6-5.5" />
    <circle cx="17" cy="8" r="3.5" />
    <path d="M21 20c0-3.3-2.7-5.5-6-5.5s-6 2.2-6 5.5" />
  </svg>
);

const IconCalendar = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M8 2v4M16 2v4M3 10h18" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
  </svg>
);

const IconPackage = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
    <path d="M12 3v18M3 8l9 5 9-5" />
  </svg>
);

const IconBuilding = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="7" width="14" height="14" rx="1" />
    <path d="M17 7l4 0v14h-4" />
    <path d="M7 11h4M7 15h4M7 19h4" />
  </svg>
);

const IconInbox = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 12h-6l-2 3H10l-2-3H2" />
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
  </svg>
);

const IconChart = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 20h18" />
    <rect x="5" y="12" width="4" height="8" rx="0.5" />
    <rect x="10" y="7" width="4" height="13" rx="0.5" />
    <rect x="15" y="4" width="4" height="16" rx="0.5" />
  </svg>
);

const IconSun = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const IconMoon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
  </svg>
);

const IconLogout = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconBranch = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="6" cy="6" r="2" />
    <path d="M6 16V8M8 6h8" />
    <path d="M14 8l4-2" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  terapeutaOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <IconGrid /> },
  { to: '/pacientes', label: 'Pacientes', icon: <IconUser /> },
  { to: '/terapeutas', label: 'Terapeutas', icon: <IconUsers />, adminOnly: true },
  { to: '/sesiones', label: 'Sesiones', icon: <IconCalendar /> },
  { to: '/mis-sucursales', label: 'Mis Sucursales', icon: <IconBranch />, terapeutaOnly: true },
  { to: '/insumos',     label: 'Insumos & Stock',   icon: <IconPackage />, adminOnly: true },
  { to: '/solicitudes', label: 'Solicitudes insumos', icon: <IconInbox /> },
  { to: '/estructura', label: 'Estructura', icon: <IconBuilding />, adminOnly: true },
  { to: '/informes', label: 'Informes', icon: <IconChart />, adminOnly: true },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { user, isAdmin, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visible = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.terapeutaOnly && isAdmin) return false;
    return true;
  });

  return (
    <aside className="h-full bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">K</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-primary-800 dark:text-primary-300 leading-tight">KaironTherapy</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Gestión Clínica</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Navegación principal">
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
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700 space-y-1">
        {user && (
          <div className="px-2 py-2 mb-1">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
              {user.nombres} {user.apellidos}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.rol}</p>
          </div>
        )}
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {dark ? <IconSun /> : <IconMoon />}
          {dark ? 'Modo claro' : 'Modo oscuro'}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-colors"
        >
          <IconLogout />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
