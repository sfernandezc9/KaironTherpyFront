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
} from '../../api/sesiones';
import { getSucursales } from '../../api/sucursales';
import { getTerapeutas } from '../../api/terapeutas';
import { getSucursalStock } from '../../api/sucursales';
import { getFichas } from '../../api/fichas';
import Table, { type Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';
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

const emptySesion: SesionForm = {
  id_ficha: 0,
  id_terapeuta: 0,
  id_sucursal: 0,
  fecha: '',
  duracion_minutos: 60,
  estado: 'pendiente',
  notas_sesion: '',
};

export default function SesionesList() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  const [filters, setFilters] = useState<SesionFilters>({});
  const [selectedSesion, setSelectedSesion] = useState<Sesion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<SesionForm>(emptySesion);

  // Insumo add form (inside detail modal)
  const [addInsumoSucursal, setAddInsumoSucursal] = useState(0);
  const [addInsumoStock, setAddInsumoStock] = useState(0);
  const [addInsumoCantidad, setAddInsumoCantidad] = useState(1);
  const [deleteInsumoTarget, setDeleteInsumoTarget] = useState<{ id_sesion: number; id_uso: number } | null>(null);

  const { data: sesiones, isLoading } = useQuery({
    queryKey: ['sesiones', filters],
    queryFn: () => getSesiones(filters),
  });

  const { data: sucursales } = useQuery({ queryKey: ['sucursales'], queryFn: getSucursales });
  const { data: terapeutas } = useQuery({ queryKey: ['terapeutas'], queryFn: getTerapeutas });
  const { data: fichas } = useQuery({ queryKey: ['fichas'], queryFn: getFichas });

  const { data: insumos } = useQuery({
    queryKey: ['sesionInsumos', selectedSesion?.id_sesion],
    queryFn: () => getSesionInsumos(selectedSesion!.id_sesion),
    enabled: !!selectedSesion,
  });

  const { data: stockSucursal } = useQuery({
    queryKey: ['sucursalStock', addInsumoSucursal],
    queryFn: () => getSucursalStock(addInsumoSucursal),
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sesiones'] });
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
    mutationFn: () => addSesionInsumo(selectedSesion!.id_sesion, { id_stock: addInsumoStock, cantidad_usada: addInsumoCantidad }),
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

  const sucursalOptions = (sucursales ?? []).map((s) => ({ value: s.id_sucursal, label: s.nombre }));
  const terapeutaOptions = (terapeutas ?? []).map((t) => ({ value: t.id_terapeuta, label: `${t.nombres} ${t.apellidos}` }));
  const fichaOptions = (fichas ?? []).map((f) => ({ value: f.id_ficha, label: `Ficha #${f.id_ficha} — Paciente #${f.id_paciente}` }));
  const stockOptions = (stockSucursal ?? []).map((s) => ({
    value: s.id_stock,
    label: `${s.nombre_insumo} (${s.cantidad} ${s.unidad_medida})`,
  }));

  const columns: Column<Sesion>[] = [
    { key: 'fecha', header: 'Fecha', sortable: true, accessor: (r) => r.fecha, render: (r) => formatDate(r.fecha) },
    { key: 'paciente', header: 'Paciente', sortable: true, accessor: (r) => r.nombre_paciente ?? '', render: (r) => r.nombre_paciente ?? '—' },
    { key: 'terapeuta', header: 'Terapeuta', sortable: true, accessor: (r) => r.nombre_terapeuta ?? '', render: (r) => r.nombre_terapeuta ?? '—' },
    { key: 'sucursal', header: 'Sucursal', accessor: (r) => r.nombre_sucursal ?? '', render: (r) => <span className="text-slate-500">{r.nombre_sucursal ?? '—'}</span> },
    { key: 'duracion', header: 'Duración', accessor: (r) => r.duracion_minutos, render: (r) => `${r.duracion_minutos} min` },
    {
      key: 'estado', header: 'Estado',
      render: (r) => <Badge label={r.estado.charAt(0).toUpperCase() + r.estado.slice(1)} color={ESTADO_COLORS[r.estado]} dot />,
    },
  ];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Sesiones</h1>
        <Button onClick={() => setCreateOpen(true)}>+ Nueva sesión</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <select
          value={filters.id_sucursal ?? ''}
          onChange={(e) => setFilters({ ...filters, id_sucursal: e.target.value ? Number(e.target.value) : undefined })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todas las sucursales</option>
          {sucursalOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={filters.id_terapeuta ?? ''}
          onChange={(e) => setFilters({ ...filters, id_terapeuta: e.target.value ? Number(e.target.value) : undefined })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos los terapeutas</option>
          {terapeutaOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={filters.estado ?? ''}
          onChange={(e) => setFilters({ ...filters, estado: (e.target.value as EstadoSesion) || undefined })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos los estados</option>
          {ESTADO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input type="date" value={filters.desde ?? ''} onChange={(e) => setFilters({ ...filters, desde: e.target.value || undefined })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        <input type="date" value={filters.hasta ?? ''} onChange={(e) => setFilters({ ...filters, hasta: e.target.value || undefined })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        <Button variant="ghost" size="sm" onClick={() => setFilters({})}>Limpiar</Button>
      </div>

      <Table
        columns={columns}
        data={sesiones ?? []}
        keyExtractor={(r) => r.id_sesion}
        onRowClick={(r) => setSelectedSesion(r)}
        emptyMessage="Sin sesiones"
      />

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nueva sesión" size="md">
        <div className="space-y-4">
          <Select label="Ficha clínica" required options={fichaOptions} value={createForm.id_ficha || ''} onChange={(e) => setCreateForm({ ...createForm, id_ficha: Number(e.target.value) })} placeholder="Seleccionar…" />
          <Select label="Terapeuta" required options={terapeutaOptions} value={createForm.id_terapeuta || ''} onChange={(e) => setCreateForm({ ...createForm, id_terapeuta: Number(e.target.value) })} placeholder="Seleccionar…" />
          <Select label="Sucursal" required options={sucursalOptions} value={createForm.id_sucursal || ''} onChange={(e) => setCreateForm({ ...createForm, id_sucursal: Number(e.target.value) })} placeholder="Seleccionar…" />
          <Input label="Fecha" type="datetime-local" required value={createForm.fecha} onChange={(e) => setCreateForm({ ...createForm, fecha: e.target.value })} />
          <Input label="Duración (minutos)" type="number" value={createForm.duracion_minutos} onChange={(e) => setCreateForm({ ...createForm, duracion_minutos: Number(e.target.value) })} />
          <Select label="Estado" options={ESTADO_OPTIONS} value={createForm.estado} onChange={(e) => setCreateForm({ ...createForm, estado: e.target.value as EstadoSesion })} />
          <Input label="Notas" value={createForm.notas_sesion} onChange={(e) => setCreateForm({ ...createForm, notas_sesion: e.target.value })} />
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
          title={`Sesión — ${formatDate(selectedSesion.fecha)}`}
          size="lg"
        >
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Paciente</p>
              <p className="text-sm text-slate-800">{selectedSesion.nombre_paciente ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Terapeuta</p>
              <p className="text-sm text-slate-800">{selectedSesion.nombre_terapeuta ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Sucursal</p>
              <p className="text-sm text-slate-800">{selectedSesion.nombre_sucursal ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Duración</p>
              <p className="text-sm text-slate-800">{selectedSesion.duracion_minutos} min</p>
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
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Notas</p>
              <p className="text-sm text-slate-700">{selectedSesion.notas_sesion}</p>
            </div>
          )}

          {/* Insumos */}
          <div className="border-t border-slate-200 pt-4 mt-4">
            <p className="text-sm font-semibold text-slate-800 mb-3">Insumos utilizados</p>
            {!insumos?.length ? (
              <p className="text-xs text-slate-400 mb-3">Sin insumos registrados</p>
            ) : (
              <ul className="space-y-2 mb-3">
                {insumos.map((i) => (
                  <li key={i.id_uso} className="flex items-center justify-between text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2">
                    <span>{i.nombre_insumo} — {i.cantidad_usada} {i.unidad_medida}</span>
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
                  label="Sucursal del stock"
                  options={sucursalOptions}
                  value={addInsumoSucursal || ''}
                  onChange={(e) => { setAddInsumoSucursal(Number(e.target.value)); setAddInsumoStock(0); }}
                  placeholder="Sucursal…"
                />
              </div>
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

          <div className="flex justify-between mt-6 pt-4 border-t border-slate-200">
            <Button variant="danger" onClick={() => setDeleteTarget(selectedSesion.id_sesion)}>
              Eliminar sesión
            </Button>
            <Button variant="secondary" onClick={() => setSelectedSesion(null)}>Cerrar</Button>
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
    </div>
  );
}
