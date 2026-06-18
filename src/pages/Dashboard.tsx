import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPacientes } from '../api/pacientes';
import { getTerapeutas } from '../api/terapeutas';
import { getSesiones } from '../api/sesiones';
import { getStockBajoMinimo } from '../api/stock';
import { PageSpinner } from '../components/ui/Spinner';
import Badge, { StockBajoBadge } from '../components/ui/Badge';
import { formatDate } from '../utils/format';
import type { EstadoSesion } from '../types/sesion';

// ── KPI Icons ────────────────────────────────────────────────────────────────
const KpiIconUser = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="9" r="4" />
    <path d="M5 21c0-4 3.1-7 7-7s7 3 7 7" />
  </svg>
);
const KpiIconCalendar = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M8 2v4M16 2v4M3 10h18" />
    <path d="M8 14h.01M12 14h.01M16 14h.01" />
  </svg>
);
const KpiIconUsers = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20c0-3.3 2.7-5.5 6-5.5" />
    <circle cx="17" cy="8" r="3.5" />
    <path d="M21 20c0-3.3-2.7-5.5-6-5.5s-6 2.2-6 5.5" />
  </svg>
);
const KpiIconAlert = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

const estadoColor: Record<EstadoSesion, 'green' | 'yellow' | 'red'> = {
  realizada: 'green',
  pendiente: 'yellow',
  cancelada: 'red',
};

const estadoLabel: Record<EstadoSesion, string> = {
  realizada: 'Realizada',
  pendiente: 'Pendiente',
  cancelada: 'Cancelada',
};

// ── Pie chart ─────────────────────────────────────────────────────────────────

const PALETTE = [
  '#0f5c5c', '#2563eb', '#16a34a', '#9333ea',
  '#ea580c', '#0891b2', '#d97706', '#be185d',
];

interface Slice { label: string; value: number; color: string }

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  // Handle full circle edge case
  if (endDeg - startDeg >= 359.99) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`;
  }
  const s = polarToCartesian(cx, cy, r, startDeg);
  const e = polarToCartesian(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

function PieChart({ slices, title }: { slices: Slice[]; title: string }) {
  const total = slices.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">{title}</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">Sin datos</p>
      </div>
    );
  }

  const cx = 80, cy = 80, r = 70;
  let current = 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4">{title}</p>
      <div className="flex items-center gap-6 flex-wrap">
        <svg viewBox="0 0 160 160" className="w-40 h-40 flex-shrink-0">
          {slices.map((s) => {
            const deg = (s.value / total) * 360;
            const path = slicePath(cx, cy, r, current, current + deg);
            current += deg;
            return <path key={s.label} d={path} fill={s.color} stroke="white" strokeWidth="1.5" />;
          })}
          {/* center label */}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-slate-700 dark:fill-slate-200" fontSize="18" fontWeight="700">{total}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" className="fill-slate-400" fontSize="9">total</text>
        </svg>
        <ul className="flex flex-col gap-2 min-w-0">
          {slices.map((s) => (
            <li key={s.label} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="truncate max-w-[140px]">{s.label}</span>
              <span className="ml-auto font-semibold text-slate-900 dark:text-slate-100 pl-2">
                {s.value} <span className="font-normal text-slate-400">({Math.round((s.value / total) * 100)}%)</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { isAdmin } = useAuth();

  const { data: pacientes, isLoading: loadingP } = useQuery({
    queryKey: ['pacientes'],
    queryFn: getPacientes,
  });

  const { data: terapeutas, isLoading: loadingT } = useQuery({
    queryKey: ['terapeutas'],
    queryFn: getTerapeutas,
    enabled: isAdmin,
  });

  const now = new Date();
  const desde = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const hasta = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const { data: sesiones, isLoading: loadingS } = useQuery({
    queryKey: ['sesiones', { desde, hasta }],
    queryFn: () => getSesiones({ desde, hasta }),
  });

  const { data: allSesiones, isLoading: loadingAS } = useQuery({
    queryKey: ['sesiones', 'recent'],
    queryFn: () => getSesiones({}),
  });

  const { data: stockBajo, isLoading: loadingSB } = useQuery({
    queryKey: ['stock', 'bajo-minimo'],
    queryFn: getStockBajoMinimo,
    enabled: isAdmin,
  });

  const isLoading = loadingP || (isAdmin && loadingT) || loadingS || loadingAS || (isAdmin && loadingSB);

  if (isLoading) return <PageSpinner />;

  const activePacientes = pacientes?.filter((p) => p.activo).length ?? 0;
  const activeTerapeutas = terapeutas?.filter((t) => t.activo).length ?? 0;
  const sesionesMes = sesiones?.length ?? 0;
  const alertasStock = stockBajo?.length ?? 0;
  const recentSesiones = [...(allSesiones ?? [])].slice(-10).reverse();

  // ── Chart data ──────────────────────────────────────────────────────────────

  // Chart 1: pacientes por sucursal
  const porSucursal: Record<string, number> = {};
  (pacientes ?? []).filter((p) => p.activo).forEach((p) => {
    const key = p.nombre_sucursal ?? 'Sin sucursal';
    porSucursal[key] = (porSucursal[key] ?? 0) + 1;
  });
  const slicesSucursal: Slice[] = Object.entries(porSucursal).map(([label, value], i) => ({
    label, value, color: PALETTE[i % PALETTE.length],
  }));

  // Chart 2: atendidos vs no atendidos
  const pacientesConSesion = new Set((allSesiones ?? []).map((s) => s.id_paciente).filter(Boolean));
  const totalActivos = (pacientes ?? []).filter((p) => p.activo);
  const atendidos = totalActivos.filter((p) => pacientesConSesion.has(p.id_paciente)).length;
  const noAtendidos = totalActivos.length - atendidos;
  const slicesAtencion: Slice[] = [
    { label: 'Atendidos', value: atendidos, color: '#16a34a' },
    { label: 'Sin sesiones', value: noAtendidos, color: '#94a3b8' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPI cards */}
      <div className={`grid gap-4 mb-8 ${isAdmin ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'}`}>
        <KpiCard label="Pacientes activos" value={activePacientes} icon={<KpiIconUser />} color="teal" />
        <KpiCard label="Sesiones del mes" value={sesionesMes} icon={<KpiIconCalendar />} color="blue" />
        {isAdmin && <KpiCard label="Terapeutas activos" value={activeTerapeutas} icon={<KpiIconUsers />} color="green" />}
        {isAdmin && (
          <KpiCard
            label="Alertas de stock"
            value={alertasStock}
            icon={<KpiIconAlert />}
            color={alertasStock > 0 ? 'red' : 'slate'}
          />
        )}
      </div>

      {/* Pie charts — admin only */}
      {isAdmin && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8">
          <PieChart title="Pacientes por sucursal" slices={slicesSucursal} />
          <PieChart title="Pacientes atendidos vs sin sesiones" slices={slicesAtencion} />
        </div>
      )}

      <div className={`grid gap-6 ${isAdmin ? 'lg:grid-cols-3' : ''}`}>
        {/* Recent sessions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Sesiones recientes</h2>
            <Link to="/sesiones" className="text-sm text-primary-800 dark:text-primary-300 hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {recentSesiones.length === 0 ? (
              <p className="text-center text-slate-400 dark:text-slate-500 py-10 text-sm">Sin sesiones registradas</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Paciente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Terapeuta</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentSesiones.map((s) => (
                    <tr key={s.id_sesion} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{s.nombre_paciente ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{s.nombre_terapeuta ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(s.fecha)}</td>
                      <td className="px-4 py-3">
                        <Badge label={estadoLabel[s.estado]} color={estadoColor[s.estado]} dot />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Stock alerts — admin only */}
        {isAdmin && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Alertas de stock</h2>
              <Link to="/insumos" className="text-sm text-primary-800 dark:text-primary-300 hover:underline">
                Ver stock →
              </Link>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
              {(stockBajo?.length ?? 0) === 0 ? (
                <p className="text-center text-slate-400 dark:text-slate-500 py-10 text-sm">Sin alertas de stock</p>
              ) : (
                stockBajo!.map((s) => (
                  <div key={s.id_stock} className="px-4 py-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{s.nombre_insumo}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{s.nombre_sucursal}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {s.cantidad} / {s.cantidad_minima} {s.unidad_medida}
                      </p>
                    </div>
                    <StockBajoBadge />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  color: 'teal' | 'blue' | 'green' | 'red' | 'slate';
}) {
  const bg: Record<string, string> = {
    teal: 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800',
    blue: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    green: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    red: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    slate: 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700',
  };
  const iconColor: Record<string, string> = {
    teal: 'text-primary-600 dark:text-primary-400',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    slate: 'text-slate-500 dark:text-slate-400',
  };
  const valueColor: Record<string, string> = {
    teal: 'text-primary-800 dark:text-primary-300',
    blue: 'text-blue-800 dark:text-blue-300',
    green: 'text-green-800 dark:text-green-300',
    red: 'text-red-800 dark:text-red-300',
    slate: 'text-slate-700 dark:text-slate-300',
  };

  return (
    <div className={`rounded-xl border p-5 ${bg[color]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-none">{label}</p>
          <p className={`text-3xl font-bold mt-2.5 leading-none ${valueColor[color]}`}>{value}</p>
        </div>
        <div className={`flex-shrink-0 mt-0.5 ${iconColor[color]}`}>{icon}</div>
      </div>
    </div>
  );
}
