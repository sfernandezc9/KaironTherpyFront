import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { getSucursalPacientes } from '../../api/sucursales';
import { formatRut } from '../../utils/format';
import { PageSpinner } from '../../components/ui/Spinner';
import type { SucursalAsignada } from '../../types/auth';

// ── Pacientes panel per sucursal ─────────────────────────────────────────────

interface SucursalPanelProps {
  sucursal: SucursalAsignada;
}

function SucursalPanel({ sucursal }: SucursalPanelProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: pacientes, isLoading } = useQuery({
    queryKey: ['sucursalPacientes', sucursal.id_sucursal],
    queryFn: () => getSucursalPacientes(sucursal.id_sucursal),
    enabled: open,
  });

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-800/10 dark:bg-primary-300/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <IconBuilding />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{sucursal.nombre}</p>
            {sucursal.direccion && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{sucursal.direccion}</p>
            )}
          </div>
        </div>
        <ChevronIcon open={open} />
      </button>

      {/* Patient list */}
      {open && (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <PageSpinner />
            </div>
          ) : !pacientes?.length ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
              Sin pacientes registrados en esta sucursal
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Nombre
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    RUT
                  </th>
                  <th className="hidden sm:table-cell px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Teléfono
                  </th>
                  <th className="hidden md:table-cell px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pacientes.map((p) => (
                  <tr
                    key={p.id_paciente}
                    onClick={() => navigate(`/pacientes/${p.id_paciente}`)}
                    className="hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                      {p.apellidos}, {p.nombres}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono">
                      {formatRut(p.rut)}
                    </td>
                    <td className="hidden sm:table-cell px-5 py-3 text-sm text-slate-500 dark:text-slate-400">
                      {p.telefono || '—'}
                    </td>
                    <td className="hidden md:table-cell px-5 py-3 text-sm text-slate-500 dark:text-slate-400">
                      {p.email || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function MisSucursalesPage() {
  const { user } = useAuth();
  const sucursales = user?.sucursales ?? [];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mis Sucursales</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {sucursales.length} sucursal{sucursales.length !== 1 ? 'es' : ''} asignada{sucursales.length !== 1 ? 's' : ''}
        </p>
      </div>

      {sucursales.length === 0 ? (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          <div className="flex justify-center mb-3 opacity-40">
            <IconBuilding large />
          </div>
          <p className="text-sm">No tienes sucursales asignadas.</p>
          <p className="text-xs mt-1">Contacta al administrador para que te asigne una sucursal.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sucursales.map((s) => (
            <SucursalPanel key={s.id_sucursal} sucursal={s} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────

function IconBuilding({ large }: { large?: boolean }) {
  const cls = large ? 'w-12 h-12' : 'w-5 h-5 text-primary-800 dark:text-primary-300';
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="14" height="14" rx="1" />
      <path d="M17 7l4 0v14h-4" />
      <path d="M7 11h4M7 15h4M7 19h4" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
