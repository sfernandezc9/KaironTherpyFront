import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPacientes } from '../api/pacientes';
import { getTerapeutas } from '../api/terapeutas';
import { getSesiones } from '../api/sesiones';
import { getStockBajoMinimo } from '../api/stock';
import { PageSpinner } from '../components/ui/Spinner';
import Badge, { StockBajoBadge } from '../components/ui/Badge';
import { formatDate } from '../utils/format';
import type { EstadoSesion } from '../types/sesion';

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

export default function Dashboard() {
  const { data: pacientes, isLoading: loadingP } = useQuery({
    queryKey: ['pacientes'],
    queryFn: getPacientes,
  });

  const { data: terapeutas, isLoading: loadingT } = useQuery({
    queryKey: ['terapeutas'],
    queryFn: getTerapeutas,
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
  });

  const isLoading = loadingP || loadingT || loadingS || loadingAS || loadingSB;

  if (isLoading) return <PageSpinner />;

  const activePacientes = pacientes?.filter((p) => p.activo).length ?? 0;
  const activeTerapeutas = terapeutas?.filter((t) => t.activo).length ?? 0;
  const sesionesMes = sesiones?.length ?? 0;
  const alertasStock = stockBajo?.length ?? 0;
  const recentSesiones = [...(allSesiones ?? [])].slice(-10).reverse();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Pacientes activos" value={activePacientes} icon="👤" color="teal" />
        <KpiCard label="Sesiones del mes" value={sesionesMes} icon="📅" color="blue" />
        <KpiCard label="Terapeutas activos" value={activeTerapeutas} icon="🩺" color="green" />
        <KpiCard
          label="Alertas de stock"
          value={alertasStock}
          icon="⚠️"
          color={alertasStock > 0 ? 'red' : 'slate'}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent sessions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Sesiones recientes</h2>
            <Link to="/sesiones" className="text-sm text-primary-800 hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {recentSesiones.length === 0 ? (
              <p className="text-center text-slate-400 py-10 text-sm">Sin sesiones registradas</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Paciente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Terapeuta</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSesiones.map((s) => (
                    <tr key={s.id_sesion} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700">{s.nombre_paciente ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-700">{s.nombre_terapeuta ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(s.fecha)}</td>
                      <td className="px-4 py-3">
                        <Badge
                          label={estadoLabel[s.estado]}
                          color={estadoColor[s.estado]}
                          dot
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Stock alerts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Alertas de stock</h2>
            <Link to="/insumos" className="text-sm text-primary-800 hover:underline">
              Ver stock →
            </Link>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {(stockBajo?.length ?? 0) === 0 ? (
              <p className="text-center text-slate-400 py-10 text-sm">Sin alertas de stock</p>
            ) : (
              stockBajo!.map((s) => (
                <div key={s.id_stock} className="px-4 py-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{s.nombre_insumo}</p>
                    <p className="text-xs text-slate-500">{s.nombre_sucursal}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {s.cantidad} / {s.cantidad_minima} {s.unidad_medida}
                    </p>
                  </div>
                  <StockBajoBadge />
                </div>
              ))
            )}
          </div>
        </div>
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
  icon: string;
  color: 'teal' | 'blue' | 'green' | 'red' | 'slate';
}) {
  const bg: Record<string, string> = {
    teal: 'bg-primary-50 border-primary-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    slate: 'bg-slate-50 border-slate-200',
  };
  const text: Record<string, string> = {
    teal: 'text-primary-800',
    blue: 'text-blue-800',
    green: 'text-green-800',
    red: 'text-red-800',
    slate: 'text-slate-700',
  };

  return (
    <div className={`rounded-xl border p-5 ${bg[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${text[color]}`}>{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}
