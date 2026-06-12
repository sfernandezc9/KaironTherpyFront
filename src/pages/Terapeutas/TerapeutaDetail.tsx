import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTerapeuta,
  updateTerapeuta,
  deleteTerapeuta,
  getTerapeutaSucursales,
  getTerapeutaSesiones,
  assignTerapeutaSucursal,
  unassignTerapeutaSucursal,
} from '../../api/terapeutas';
import { getSucursales } from '../../api/sucursales';
import { Tabs, TabPanel } from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { formatRut, formatDate, formatDateInput, validateRut } from '../../utils/format';
import { NACIONALIDAD_OPTIONS } from '../../utils/nacionalidades';
import type { TerapeutaForm } from '../../types/terapeuta';

const TABS = [
  { id: 'datos', label: 'Datos' },
  { id: 'sucursales', label: 'Sucursales' },
  { id: 'sesiones', label: 'Sesiones' },
];

const GENERO_OPTIONS = [
  { value: 'Hombre', label: 'Hombre' },
  { value: 'Mujer', label: 'Mujer' },
  { value: 'Transfemenino', label: 'Transfemenino' },
  { value: 'No binario', label: 'No binario' },
  { value: 'Otro', label: 'Otro' },
];

const ESTADO_COLORS: Record<string, 'green' | 'yellow' | 'red'> = {
  realizada: 'green',
  pendiente: 'yellow',
  cancelada: 'red',
};

export default function TerapeutaDetail() {
  const { id } = useParams<{ id: string }>();
  const tid = Number(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('datos');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ id_sucursal: 0, fecha_inicio: '' });
  const [unassignTarget, setUnassignTarget] = useState<{ id_sucursal: number; nombre: string } | null>(null);
  const [unassignFechaFin, setUnassignFechaFin] = useState('');
  const [filterDesde, setFilterDesde] = useState('');
  const [filterHasta, setFilterHasta] = useState('');

  const { data: terapeuta, isLoading } = useQuery({
    queryKey: ['terapeuta', tid],
    queryFn: () => getTerapeuta(tid),
  });

  const { data: sucursalesAsig } = useQuery({
    queryKey: ['terapeutaSucursales', tid],
    queryFn: () => getTerapeutaSucursales(tid),
    enabled: activeTab === 'sucursales',
  });

  const { data: sesiones, isLoading: loadingS } = useQuery({
    queryKey: ['terapeutaSesiones', tid, filterDesde, filterHasta],
    queryFn: () => getTerapeutaSesiones(tid, filterDesde || undefined, filterHasta || undefined),
    enabled: activeTab === 'sesiones',
  });

  const { data: allSucursales } = useQuery({
    queryKey: ['sucursales'],
    queryFn: getSucursales,
  });

  const [editForm, setEditForm] = useState<Partial<TerapeutaForm> | null>(null);
  const [editRutError, setEditRutError] = useState('');

  const updateMut = useMutation({
    mutationFn: (form: Partial<TerapeutaForm>) => updateTerapeuta(tid, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['terapeuta', tid] });
      qc.invalidateQueries({ queryKey: ['terapeutas'] });
      showToast('Terapeuta actualizado', 'success');
      setEditForm(null);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteTerapeuta(tid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['terapeutas'] });
      showToast('Terapeuta eliminado', 'success');
      navigate('/terapeutas');
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const assignMut = useMutation({
    mutationFn: () => assignTerapeutaSucursal(tid, assignForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['terapeutaSucursales', tid] });
      showToast('Sucursal asignada', 'success');
      setAssignOpen(false);
      setAssignForm({ id_sucursal: 0, fecha_inicio: '' });
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const unassignMut = useMutation({
    mutationFn: () => unassignTerapeutaSucursal(tid, unassignTarget!.id_sucursal, unassignFechaFin),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['terapeutaSucursales', tid] });
      showToast('Sucursal desasignada', 'success');
      setUnassignTarget(null);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  if (isLoading) return <PageSpinner />;
  if (!terapeuta) return <div className="p-6 text-red-600 dark:text-red-400">Terapeuta no encontrado</div>;

  const ef = editForm ?? {
    rut: terapeuta.rut,
    nombres: terapeuta.nombres,
    apellidos: terapeuta.apellidos,
    fecha_nacimiento: formatDateInput(terapeuta.fecha_nacimiento),
    genero: terapeuta.genero,
    telefono: terapeuta.telefono,
    email: terapeuta.email,
    direccion: terapeuta.direccion,
    nacionalidad: terapeuta.nacionalidad ?? '',
    especialidad_1: terapeuta.especialidad_1,
    especialidad_2: terapeuta.especialidad_2 ?? '',
    especialidad_3: terapeuta.especialidad_3 ?? '',
    registro_profesional: terapeuta.registro_profesional,
    activo: terapeuta.activo,
  };

  const sucursalOptions = (allSucursales ?? []).map((s) => ({
    value: s.id_sucursal,
    label: s.nombre,
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => navigate('/terapeutas')} className="text-sm text-primary-800 hover:underline mb-2">
            ← Terapeutas
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {terapeuta.apellidos}, {terapeuta.nombres}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-slate-500 dark:text-slate-400">{formatRut(terapeuta.rut)}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {terapeuta.especialidad_1}
              {terapeuta.especialidad_2 && ` · ${terapeuta.especialidad_2}`}
              {terapeuta.especialidad_3 && ` · ${terapeuta.especialidad_3}`}
            </span>
            <Badge label={terapeuta.activo ? 'Activo' : 'Inactivo'} color={terapeuta.activo ? 'green' : 'slate'} dot />
          </div>
        </div>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>Eliminar</Button>
      </div>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab}>
        <TabPanel id="datos" active={activeTab}>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Input label="RUT" value={ef.rut ?? ''} onChange={(e) => { setEditForm({ ...ef, rut: e.target.value }); setEditRutError(''); }} error={editRutError} />
            <Input label="Nombres" value={ef.nombres ?? ''} onChange={(e) => setEditForm({ ...ef, nombres: e.target.value })} />
            <Input label="Apellidos" value={ef.apellidos ?? ''} onChange={(e) => setEditForm({ ...ef, apellidos: e.target.value })} />
            <Input label="Fecha de nacimiento" type="date" value={ef.fecha_nacimiento ?? ''} onChange={(e) => setEditForm({ ...ef, fecha_nacimiento: e.target.value })} />
            <Select label="Identidad sexogenérica" options={GENERO_OPTIONS} value={ef.genero ?? ''} onChange={(e) => setEditForm({ ...ef, genero: e.target.value })} />
            <Select label="Nacionalidad" options={NACIONALIDAD_OPTIONS} value={ef.nacionalidad ?? ''} onChange={(e) => setEditForm({ ...ef, nacionalidad: e.target.value })} placeholder="Seleccionar…" />
            <Input label="Teléfono" value={ef.telefono ?? ''} onChange={(e) => setEditForm({ ...ef, telefono: e.target.value })} />
            <Input label="Email" type="email" value={ef.email ?? ''} onChange={(e) => setEditForm({ ...ef, email: e.target.value })} />
            <div className="col-span-2">
              <Input label="Dirección" value={ef.direccion ?? ''} onChange={(e) => setEditForm({ ...ef, direccion: e.target.value })} />
            </div>
            <Input label="Especialidad 1" required value={ef.especialidad_1 ?? ''} onChange={(e) => setEditForm({ ...ef, especialidad_1: e.target.value })} />
            <Input label="Registro profesional" value={ef.registro_profesional ?? ''} onChange={(e) => setEditForm({ ...ef, registro_profesional: e.target.value })} />
            <Input label="Especialidad 2" value={ef.especialidad_2 ?? ''} onChange={(e) => setEditForm({ ...ef, especialidad_2: e.target.value })} />
            <Input label="Especialidad 3" value={ef.especialidad_3 ?? ''} onChange={(e) => setEditForm({ ...ef, especialidad_3: e.target.value })} />
            <Select label="Estado" options={[{ value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }]} value={String(ef.activo ?? true)} onChange={(e) => setEditForm({ ...ef, activo: e.target.value === 'true' })} />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => {
              if (ef.rut && !validateRut(ef.rut)) { setEditRutError('RUT inválido'); return; }
              updateMut.mutate(ef as Partial<TerapeutaForm>);
            }} loading={updateMut.isPending}>
              Guardar cambios
            </Button>
          </div>
        </TabPanel>

        <TabPanel id="sucursales" active={activeTab}>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setAssignOpen(true)}>+ Asignar sucursal</Button>
          </div>
          {!sucursalesAsig?.length ? (
            <p className="text-slate-500 dark:text-slate-400">Sin sucursales asignadas.</p>
          ) : (
            <div className="space-y-2">
              {sucursalesAsig.map((s) => (
                <div key={s.id_sucursal} className="flex items-center justify-between px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{s.nombre}</p>
                    {s.nombre_empresa && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">{s.nombre_empresa}</p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Desde {formatDate(s.fecha_inicio)}
                      {s.fecha_fin ? ` · Hasta ${formatDate(s.fecha_fin)}` : ' · Activo'}
                    </p>
                  </div>
                  {!s.fecha_fin && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setUnassignTarget({ id_sucursal: s.id_sucursal, nombre: s.nombre })}
                    >
                      Desasignar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabPanel>

        <TabPanel id="sesiones" active={activeTab}>
          <div className="flex gap-3 mb-4">
            <Input label="Desde" type="date" value={filterDesde} onChange={(e) => setFilterDesde(e.target.value)} />
            <Input label="Hasta" type="date" value={filterHasta} onChange={(e) => setFilterHasta(e.target.value)} />
          </div>
          {loadingS ? (
            <PageSpinner />
          ) : !sesiones?.length ? (
            <p className="text-slate-500 dark:text-slate-400">Sin sesiones en el período.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Paciente</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Duración</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {sesiones.map((s) => (
                    <tr key={s.id_sesion} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="px-4 py-3">{formatDate(s.fecha)}</td>
                      <td className="px-4 py-3">{s.nombre_paciente ?? '—'}</td>
                      <td className="px-4 py-3">{s.duracion_minutos} min</td>
                      <td className="px-4 py-3">
                        <Badge label={s.estado} color={ESTADO_COLORS[s.estado]} dot />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabPanel>
      </Tabs>

      {/* Assign sucursal modal */}
      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Asignar sucursal" size="sm">
        <div className="space-y-4">
          <Select
            label="Sucursal"
            required
            options={sucursalOptions}
            value={assignForm.id_sucursal || ''}
            onChange={(e) => setAssignForm({ ...assignForm, id_sucursal: Number(e.target.value) })}
            placeholder="Seleccionar…"
          />
          <Input
            label="Fecha inicio"
            type="date"
            required
            value={assignForm.fecha_inicio}
            onChange={(e) => setAssignForm({ ...assignForm, fecha_inicio: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setAssignOpen(false)}>Cancelar</Button>
          <Button onClick={() => assignMut.mutate()} loading={assignMut.isPending}>Asignar</Button>
        </div>
      </Modal>

      {/* Unassign modal */}
      <Modal open={!!unassignTarget} onClose={() => setUnassignTarget(null)} title={`Desasignar de ${unassignTarget?.nombre}`} size="sm">
        <Input
          label="Fecha fin"
          type="date"
          required
          value={unassignFechaFin}
          onChange={(e) => setUnassignFechaFin(e.target.value)}
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setUnassignTarget(null)}>Cancelar</Button>
          <Button onClick={() => unassignMut.mutate()} loading={unassignMut.isPending}>Desasignar</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        message={`¿Eliminar al terapeuta ${terapeuta.nombres} ${terapeuta.apellidos}?`}
        onConfirm={() => deleteMut.mutate()}
        onCancel={() => setDeleteOpen(false)}
        loading={deleteMut.isPending}
      />
    </div>
  );
}
