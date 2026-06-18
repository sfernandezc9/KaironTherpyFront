import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSesiones,
  getSesionInsumos,
  addSesionInsumo,
  removeSesionInsumo,
  deleteSesion,
  updateSesion,
  createSesion,
  getStockSucursalSesion,
  uploadSesionArchivo,
  downloadSesionArchivo,
  deleteSesionArchivo,
} from '../../api/sesiones';
import { getSucursales, getSucursalStock } from '../../api/sucursales';
import { getTerapeutas } from '../../api/terapeutas';
import { getFichas } from '../../api/fichas';
import { getPacienteSesiones } from '../../api/pacientes';
import { useAuth } from '../../context/AuthContext';
import Table, { type Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input, { TextArea } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatDateTime, formatRut } from '../../utils/format';
import type { Sesion, SesionForm, SesionFilters, EstadoSesion } from '../../types/sesion';

const ESTADO_OPTIONS = [
  { value: 'realizada', label: 'Realizada' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'cancelada', label: 'Cancelada' },
];

const ESTADO_COLORS: Record<EstadoSesion, 'green' | 'yellow' | 'red'> = {
  realizada: 'green',
  pendiente: 'yellow',
  cancelada: 'red',
};

export default function SesionesList() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const { user, isAdmin, isTerapeuta } = useAuth();

  const emptySesion: SesionForm = {
    id_ficha: 0,
    id_terapeuta: isTerapeuta ? (user?.id_terapeuta ?? 0) : 0,
    id_sucursal: 0,
    fecha: '',
    duracion_minutos: 60,
    estado: 'pendiente',
    notas_sesion: '',
    observaciones: '',
    tipo_observacion: '',
    nuevas_indicaciones: '',
  };

  const [filters, setFilters] = useState<SesionFilters>({});
  const [selectedSesion, setSelectedSesion] = useState<Sesion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<SesionForm>(emptySesion);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<SesionForm>(emptySesion);

  const [archivoFile, setArchivoFile] = useState<File | null>(null);
  const [archivoUploading, setArchivoUploading] = useState(false);
  const [deleteArchivoTarget, setDeleteArchivoTarget] = useState<number | null>(null);
  const [deletingArchivo, setDeletingArchivo] = useState(false);

  const [addInsumoSucursal, setAddInsumoSucursal] = useState(0);
  const [addInsumoStock, setAddInsumoStock] = useState(0);
  const [addInsumoCantidad, setAddInsumoCantidad] = useState(1);
  const [deleteInsumoTarget, setDeleteInsumoTarget] = useState<{ id_sesion: number; id_uso: number } | null>(null);

  const { data: sesiones, isLoading } = useQuery({
    queryKey: ['sesiones', filters],
    queryFn: () => getSesiones(filters),
  });

  const { data: sucursales } = useQuery({
    queryKey: ['sucursales'],
    queryFn: getSucursales,
    enabled: isAdmin,
  });

  const { data: terapeutas } = useQuery({
    queryKey: ['terapeutas'],
    queryFn: getTerapeutas,
    enabled: isAdmin,
  });

  const { data: fichas } = useQuery({ queryKey: ['fichas'], queryFn: getFichas });

  const { data: insumos } = useQuery({
    queryKey: ['sesionInsumos', selectedSesion?.id_sesion],
    queryFn: () => getSesionInsumos(selectedSesion!.id_sesion),
    enabled: !!selectedSesion,
  });

  const { data: pacienteSesiones } = useQuery({
    queryKey: ['pacienteSesiones', selectedSesion?.id_paciente],
    queryFn: () => getPacienteSesiones(selectedSesion!.id_paciente!),
    enabled: !!selectedSesion?.id_paciente,
  });

  const sortedPacienteSesiones = pacienteSesiones
    ? [...pacienteSesiones].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    : [];

  const numeroSesion = selectedSesion && sortedPacienteSesiones.length
    ? sortedPacienteSesiones.findIndex((s) => s.id_sesion === selectedSesion.id_sesion) + 1
    : null;

  const prevIndicaciones = selectedSesion && sortedPacienteSesiones.length && numeroSesion && numeroSesion > 1
    ? (sortedPacienteSesiones[numeroSesion - 2]?.nuevas_indicaciones ?? null)
    : null;

  const { data: stockSucursal } = useQuery({
    queryKey: ['sesionStock', addInsumoSucursal, isTerapeuta],
    queryFn: () =>
      isTerapeuta
        ? getStockSucursalSesion(addInsumoSucursal)
        : getSucursalStock(addInsumoSucursal),
    enabled: addInsumoSucursal > 0,
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteSesion(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sesiones'] });
      showToast('Sesión eliminada', 'success');
      setDeleteTarget(null);
      setSelectedSesion(null);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, form }: { id: number; form: Partial<SesionForm> }) => updateSesion(id, form),
    onSuccess: (_, { id, form }) => {
      qc.invalidateQueries({ queryKey: ['sesiones'] });
      qc.invalidateQueries({ queryKey: ['pacienteSesiones'] });
      if (selectedSesion && selectedSesion.id_sesion === id) {
        setSelectedSesion({
          ...selectedSesion,
          ...form,
          tipo_observacion: form.tipo_observacion ? form.tipo_observacion : null,
        });
      }
      setEditOpen(false);
      showToast('Sesión actualizada', 'success');
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const createMut = useMutation({
    mutationFn: createSesion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sesiones'] });
      showToast('Sesión creada', 'success');
      setCreateOpen(false);
      setCreateForm(emptySesion);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const addInsumoMut = useMutation({
    mutationFn: () =>
      addSesionInsumo(selectedSesion!.id_sesion, { id_stock: addInsumoStock, cantidad_usada: addInsumoCantidad }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sesionInsumos', selectedSesion?.id_sesion] });
      qc.invalidateQueries({ queryKey: ['stock'] });
      showToast('Insumo agregado', 'success');
      setAddInsumoStock(0);
      setAddInsumoCantidad(1);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const removeInsumoMut = useMutation({
    mutationFn: () => removeSesionInsumo(deleteInsumoTarget!.id_sesion, deleteInsumoTarget!.id_uso),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sesionInsumos', selectedSesion?.id_sesion] });
      qc.invalidateQueries({ queryKey: ['stock'] });
      showToast('Insumo eliminado y stock restaurado', 'success');
      setDeleteInsumoTarget(null);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const handleUploadArchivo = async () => {
    if (!archivoFile || !selectedSesion) return;
    setArchivoUploading(true);
    try {
      const result = await uploadSesionArchivo(selectedSesion.id_sesion, archivoFile);
      setSelectedSesion({ ...selectedSesion, archivo_nombre: result.archivo_nombre, archivo_path: result.archivo_path });
      qc.invalidateQueries({ queryKey: ['sesiones'] });
      setArchivoFile(null);
      showToast('Archivo subido correctamente', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Error al subir archivo', 'error');
    } finally {
      setArchivoUploading(false);
    }
  };

  const handleDownloadArchivo = async () => {
    if (!selectedSesion?.archivo_nombre) return;
    try {
      await downloadSesionArchivo(selectedSesion.id_sesion, selectedSesion.archivo_nombre);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Error al descargar archivo', 'error');
    }
  };

  const handleDeleteArchivo = async () => {
    if (!selectedSesion) return;
    setDeletingArchivo(true);
    try {
      await deleteSesionArchivo(selectedSesion.id_sesion);
      setSelectedSesion({ ...selectedSesion, archivo_nombre: null, archivo_path: null });
      qc.invalidateQueries({ queryKey: ['sesiones'] });
      setDeleteArchivoTarget(null);
      showToast('Archivo eliminado', 'success');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Error al eliminar archivo', 'error');
    } finally {
      setDeletingArchivo(false);
    }
  };

  // Sucursal options: admin uses API, terapeuta uses /me sucursales
  const sucursalOptions = isAdmin
    ? (sucursales ?? []).map((s) => ({ value: s.id_sucursal, label: s.nombre }))
    : (user?.sucursales ?? []).map((s) => ({ value: s.id_sucursal, label: s.nombre }));

  const terapeutaOptions = (terapeutas ?? []).map((t) => ({
    value: t.id_terapeuta,
    label: `${t.nombres} ${t.apellidos}`,
  }));

  const fichaOptions = (fichas ?? []).map((f) => ({
    value: f.id_ficha,
    label: f.nombres ? `${f.nombres} ${f.apellidos} — ${formatRut(f.rut ?? '')}` : `Ficha #${f.id_ficha} — Paciente #${f.id_paciente}`,
  }));

  const stockOptions = (stockSucursal ?? []).map((s) => ({
    value: s.id_stock,
    label: `${s.nombre_insumo} (${s.cantidad} ${s.unidad_medida})`,
  }));

  const diasDiscrepancia = (s: Sesion): number => {
    if (!s.created_at) return 0;
    const sesionDate = new Date(s.fecha);
    const creadoDate = new Date(s.created_at);
    sesionDate.setHours(0, 0, 0, 0);
    creadoDate.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((creadoDate.getTime() - sesionDate.getTime()) / 86_400_000));
  };

  const columns: Column<Sesion>[] = [
    {
      key: 'fecha', header: 'Fecha', sortable: true, accessor: (r) => r.fecha,
      render: (r) => (
        <span className="flex items-center gap-1.5">
          {formatDate(r.fecha)}
          {isAdmin && diasDiscrepancia(r) > 0 && (
            <span title={`Registrada ${diasDiscrepancia(r)} día(s) después de la fecha de sesión`}
              className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex-shrink-0">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3A.75.75 0 018 4.5zm0 6.5a.875.875 0 110-1.75A.875.875 0 018 11z"/></svg>
            </span>
          )}
        </span>
      ),
    },
    { key: 'paciente', header: 'Paciente', sortable: true, accessor: (r) => r.nombre_paciente ?? '', render: (r) => r.nombre_paciente ?? '—' },
    { key: 'terapeuta', header: 'Terapeuta', sortable: true, accessor: (r) => r.nombre_terapeuta ?? '', render: (r) => r.nombre_terapeuta ?? '—' },
    { key: 'sucursal', header: 'Sucursal', accessor: (r) => r.nombre_sucursal ?? '', render: (r) => <span className="text-slate-500 dark:text-slate-400">{r.nombre_sucursal ?? '—'}</span> },
    { key: 'duracion', header: 'Duración', accessor: (r) => r.duracion_minutos, render: (r) => `${r.duracion_minutos} min` },
    {
      key: 'estado',
      header: 'Estado',
      render: (r) => <Badge label={r.estado.charAt(0).toUpperCase() + r.estado.slice(1)} color={ESTADO_COLORS[r.estado]} dot />,
    },
  ];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Sesiones</h1>
        <Button onClick={() => { setCreateForm(emptySesion); setCreateOpen(true); }}>+ Nueva sesión</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <select
          value={filters.id_sucursal ?? ''}
          onChange={(e) => setFilters({ ...filters, id_sucursal: e.target.value ? Number(e.target.value) : undefined })}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todas las sucursales</option>
          {sucursalOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {isAdmin && (
          <select
            value={filters.id_terapeuta ?? ''}
            onChange={(e) => setFilters({ ...filters, id_terapeuta: e.target.value ? Number(e.target.value) : undefined })}
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos los terapeutas</option>
            {terapeutaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}
        <select
          value={filters.estado ?? ''}
          onChange={(e) => setFilters({ ...filters, estado: (e.target.value as EstadoSesion) || undefined })}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos los estados</option>
          {ESTADO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input
          type="date"
          value={filters.desde ?? ''}
          onChange={(e) => setFilters({ ...filters, desde: e.target.value || undefined })}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          type="date"
          value={filters.hasta ?? ''}
          onChange={(e) => setFilters({ ...filters, hasta: e.target.value || undefined })}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <Button variant="ghost" size="sm" onClick={() => setFilters({})}>Limpiar</Button>
      </div>

      <Table
        columns={columns}
        data={sesiones ?? []}
        keyExtractor={(r) => r.id_sesion}
        onRowClick={(r) => { setSelectedSesion(r); setAddInsumoSucursal(r.id_sucursal); setAddInsumoStock(0); }}
        emptyMessage="Sin sesiones"
      />

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nueva sesión" size="md">
        <div className="space-y-4">
          <Select
            label="Ficha clínica"
            required
            options={fichaOptions}
            value={createForm.id_ficha || ''}
            onChange={(e) => setCreateForm({ ...createForm, id_ficha: Number(e.target.value) })}
            placeholder="Seleccionar…"
          />
          {isAdmin && (
            <Select
              label="Terapeuta"
              required
              options={terapeutaOptions}
              value={createForm.id_terapeuta || ''}
              onChange={(e) => setCreateForm({ ...createForm, id_terapeuta: Number(e.target.value) })}
              placeholder="Seleccionar…"
            />
          )}
          <Select
            label="Sucursal"
            required
            options={sucursalOptions}
            value={createForm.id_sucursal || ''}
            onChange={(e) => setCreateForm({ ...createForm, id_sucursal: Number(e.target.value) })}
            placeholder="Seleccionar…"
          />
          <Input
            label="Fecha"
            type="datetime-local"
            required
            value={createForm.fecha}
            onChange={(e) => setCreateForm({ ...createForm, fecha: e.target.value })}
          />
          <Input
            label="Duración (minutos)"
            type="number"
            value={createForm.duracion_minutos}
            onChange={(e) => setCreateForm({ ...createForm, duracion_minutos: Number(e.target.value) })}
          />
          <Select
            label="Estado"
            options={ESTADO_OPTIONS}
            value={createForm.estado}
            onChange={(e) => setCreateForm({ ...createForm, estado: e.target.value as EstadoSesion })}
          />
          <Input
            label="Notas"
            value={createForm.notas_sesion}
            onChange={(e) => setCreateForm({ ...createForm, notas_sesion: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Observaciones <span className="font-normal text-slate-400">(Avance / Retroceso)</span>
            </label>
            <div className="flex gap-2 mb-2">
              {(['avance', 'retroceso'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setCreateForm({ ...createForm, tipo_observacion: createForm.tipo_observacion === t ? '' : t })}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    createForm.tipo_observacion === t
                      ? t === 'avance'
                        ? 'bg-green-100 border-green-400 text-green-800 dark:bg-green-900/40 dark:border-green-600 dark:text-green-300'
                        : 'bg-red-100 border-red-400 text-red-800 dark:bg-red-900/40 dark:border-red-600 dark:text-red-300'
                      : 'bg-white border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <TextArea
              rows={3}
              value={createForm.observaciones ?? ''}
              onChange={(e) => setCreateForm({ ...createForm, observaciones: e.target.value })}
              placeholder="Observaciones de la sesión…"
            />
          </div>
          <TextArea
            label="Nuevas indicaciones"
            rows={3}
            value={createForm.nuevas_indicaciones ?? ''}
            onChange={(e) => setCreateForm({ ...createForm, nuevas_indicaciones: e.target.value })}
            placeholder="Indicaciones para la próxima sesión…"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button onClick={() => createMut.mutate(createForm)} loading={createMut.isPending}>Crear</Button>
        </div>
      </Modal>

      {/* Detail modal */}
      {selectedSesion && (
        <Modal
          open={!!selectedSesion}
          onClose={() => setSelectedSesion(null)}
          title={numeroSesion ? `Sesión #${numeroSesion} — ${formatDate(selectedSesion.fecha)}` : `Sesión — ${formatDate(selectedSesion.fecha)}`}
          size="lg"
        >
          {isAdmin && diasDiscrepancia(selectedSesion) > 0 && (
            <div className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
              </svg>
              <div className="text-xs leading-snug">
                <p className="font-semibold">Discrepancia de registro</p>
                <p>
                  Sesión del <strong>{formatDate(selectedSesion.fecha)}</strong> registrada{' '}
                  <strong>{diasDiscrepancia(selectedSesion)} día(s) después</strong> ({formatDateTime(selectedSesion.created_at!)})
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Paciente</p>
              <p className="text-sm text-slate-800 dark:text-slate-100">{selectedSesion.nombre_paciente ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Terapeuta</p>
              <p className="text-sm text-slate-800 dark:text-slate-100">{selectedSesion.nombre_terapeuta ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Sucursal</p>
              <p className="text-sm text-slate-800 dark:text-slate-100">{selectedSesion.nombre_sucursal ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Duración</p>
              <p className="text-sm text-slate-800 dark:text-slate-100">{selectedSesion.duracion_minutos} min</p>
            </div>
          </div>

          <div className="mb-4">
            <Select
              label="Estado"
              options={ESTADO_OPTIONS}
              value={selectedSesion.estado}
              onChange={(e) => {
                const updated = { ...selectedSesion, estado: e.target.value as EstadoSesion };
                setSelectedSesion(updated);
                updateMut.mutate({ id: selectedSesion.id_sesion, form: { estado: e.target.value as EstadoSesion } });
              }}
            />
          </div>

          {selectedSesion.notas_sesion && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Notas</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{selectedSesion.notas_sesion}</p>
            </div>
          )}

          {/* Indicaciones sesión anterior */}
          {prevIndicaciones && (
            <div className="mb-4 px-3 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase mb-1">
                Indicaciones sesión anterior (#{numeroSesion! - 1})
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">{prevIndicaciones}</p>
            </div>
          )}

          {/* Observaciones */}
          {(selectedSesion.observaciones || selectedSesion.tipo_observacion) && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Observaciones</p>
                {selectedSesion.tipo_observacion && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedSesion.tipo_observacion === 'avance'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                  }`}>
                    {selectedSesion.tipo_observacion.charAt(0).toUpperCase() + selectedSesion.tipo_observacion.slice(1)}
                  </span>
                )}
              </div>
              {selectedSesion.observaciones && (
                <p className="text-sm text-slate-700 dark:text-slate-300">{selectedSesion.observaciones}</p>
              )}
            </div>
          )}

          {/* Nuevas indicaciones */}
          {selectedSesion.nuevas_indicaciones && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Nuevas indicaciones</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{selectedSesion.nuevas_indicaciones}</p>
            </div>
          )}

          {/* Archivo adjunto */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Archivo adjunto</p>
            {selectedSesion.archivo_nombre ? (
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">{selectedSesion.archivo_nombre}</span>
                <Button size="sm" variant="secondary" onClick={handleDownloadArchivo}>Descargar</Button>
                <Button size="sm" variant="danger" onClick={() => setDeleteArchivoTarget(selectedSesion.id_sesion)}>Eliminar</Button>
              </div>
            ) : archivoFile ? (
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">{archivoFile.name}</span>
                <Button size="sm" onClick={handleUploadArchivo} loading={archivoUploading}>Subir</Button>
                <Button size="sm" variant="ghost" onClick={() => setArchivoFile(null)}>✕</Button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-1 p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-teal-600 dark:hover:border-teal-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="text-sm text-slate-500 dark:text-slate-400">Clic para seleccionar un archivo</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">Cualquier tipo — máx 10 MB</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = '';
                    if (!f) return;
                    if (f.size > 10 * 1024 * 1024) {
                      showToast('El archivo supera el límite de 10 MB', 'error');
                      return;
                    }
                    setArchivoFile(f);
                  }}
                />
              </label>
            )}
          </div>

          {/* Insumos */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Insumos utilizados</p>
            {!insumos?.length ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Sin insumos registrados</p>
            ) : (
              <ul className="space-y-2 mb-3">
                {insumos.map((i) => (
                  <li
                    key={i.id_uso}
                    className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2"
                  >
                    <span>{i.nombre_insumo} — {i.cantidad_usada} {i.unidad_medida}{i.fecha_asignacion ? <span className="ml-2 text-xs text-slate-400">{formatDateTime(i.fecha_asignacion)}</span> : null}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteInsumoTarget({ id_sesion: selectedSesion.id_sesion, id_uso: i.id_uso })}
                    >
                      ✕
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add insumo */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Select
                  label="Insumo"
                  options={stockOptions}
                  value={addInsumoStock || ''}
                  onChange={(e) => setAddInsumoStock(Number(e.target.value))}
                  placeholder="Insumo…"
                />
              </div>
              <div className="w-24">
                <Input
                  label="Cantidad"
                  type="number"
                  value={addInsumoCantidad}
                  onChange={(e) => setAddInsumoCantidad(Number(e.target.value))}
                />
              </div>
              <Button onClick={() => addInsumoMut.mutate()} loading={addInsumoMut.isPending} disabled={!addInsumoStock}>
                Agregar
              </Button>
            </div>
          </div>

          <div className="flex justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            {isAdmin && (
              <Button variant="danger" onClick={() => setDeleteTarget(selectedSesion.id_sesion)}>
                Eliminar sesión
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditForm({
                    id_ficha: selectedSesion.id_ficha,
                    id_terapeuta: selectedSesion.id_terapeuta,
                    id_sucursal: selectedSesion.id_sucursal,
                    fecha: selectedSesion.fecha.slice(0, 16),
                    duracion_minutos: selectedSesion.duracion_minutos,
                    estado: selectedSesion.estado,
                    notas_sesion: selectedSesion.notas_sesion ?? '',
                    observaciones: selectedSesion.observaciones ?? '',
                    tipo_observacion: selectedSesion.tipo_observacion ?? '',
                    nuevas_indicaciones: selectedSesion.nuevas_indicaciones ?? '',
                  });
                  setEditOpen(true);
                }}
              >
                Editar
              </Button>
              <Button variant="secondary" onClick={() => setSelectedSesion(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {selectedSesion && (
        <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar sesión" size="md">
          <div className="space-y-4">
            {isAdmin && (
              <Select
                label="Terapeuta"
                options={terapeutaOptions}
                value={editForm.id_terapeuta || ''}
                onChange={(e) => setEditForm({ ...editForm, id_terapeuta: Number(e.target.value) })}
              />
            )}
            <Select
              label="Sucursal"
              options={sucursalOptions}
              value={editForm.id_sucursal || ''}
              onChange={(e) => setEditForm({ ...editForm, id_sucursal: Number(e.target.value) })}
            />
            <Input
              label="Fecha"
              type="datetime-local"
              value={editForm.fecha}
              onChange={(e) => setEditForm({ ...editForm, fecha: e.target.value })}
            />
            <Input
              label="Duración (minutos)"
              type="number"
              value={editForm.duracion_minutos}
              onChange={(e) => setEditForm({ ...editForm, duracion_minutos: Number(e.target.value) })}
            />
            <Select
              label="Estado"
              options={ESTADO_OPTIONS}
              value={editForm.estado}
              onChange={(e) => setEditForm({ ...editForm, estado: e.target.value as EstadoSesion })}
            />
            <Input
              label="Notas"
              value={editForm.notas_sesion}
              onChange={(e) => setEditForm({ ...editForm, notas_sesion: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Observaciones <span className="font-normal text-slate-400">(Avance / Retroceso)</span>
              </label>
              <div className="flex gap-2 mb-2">
                {(['avance', 'retroceso'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, tipo_observacion: editForm.tipo_observacion === t ? '' : t })}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      editForm.tipo_observacion === t
                        ? t === 'avance'
                          ? 'bg-green-100 border-green-400 text-green-800 dark:bg-green-900/40 dark:border-green-600 dark:text-green-300'
                          : 'bg-red-100 border-red-400 text-red-800 dark:bg-red-900/40 dark:border-red-600 dark:text-red-300'
                        : 'bg-white border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <TextArea
                rows={3}
                value={editForm.observaciones ?? ''}
                onChange={(e) => setEditForm({ ...editForm, observaciones: e.target.value })}
                placeholder="Observaciones de la sesión…"
              />
            </div>
            <TextArea
              label="Nuevas indicaciones"
              rows={3}
              value={editForm.nuevas_indicaciones ?? ''}
              onChange={(e) => setEditForm({ ...editForm, nuevas_indicaciones: e.target.value })}
              placeholder="Indicaciones para la próxima sesión…"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => updateMut.mutate({ id: selectedSesion.id_sesion, form: editForm })}
              loading={updateMut.isPending}
            >
              Guardar
            </Button>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        message="¿Eliminar esta sesión? No se puede deshacer."
        onConfirm={() => deleteTarget !== null && deleteMut.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMut.isPending}
      />

      <ConfirmDialog
        open={deleteInsumoTarget !== null}
        message="¿Eliminar este insumo? El stock será restaurado."
        onConfirm={() => removeInsumoMut.mutate()}
        onCancel={() => setDeleteInsumoTarget(null)}
        loading={removeInsumoMut.isPending}
      />

      <ConfirmDialog
        open={deleteArchivoTarget !== null}
        message="¿Eliminar el archivo adjunto? No se puede deshacer."
        onConfirm={handleDeleteArchivo}
        onCancel={() => setDeleteArchivoTarget(null)}
        loading={deletingArchivo}
      />
    </div>
  );
}
