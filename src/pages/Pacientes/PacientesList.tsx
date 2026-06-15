import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getPacientes, createPaciente } from '../../api/pacientes';
import { getSucursales } from '../../api/sucursales';
import { useAuth } from '../../context/AuthContext';
import Table, { type Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { formatRut, formatDate, validateRut } from '../../utils/format';
import { NACIONALIDAD_OPTIONS } from '../../utils/nacionalidades';
import type { Paciente, PacienteForm } from '../../types/paciente';

const GENERO_OPTIONS = [
  { value: 'Hombre', label: 'Hombre' },
  { value: 'Mujer', label: 'Mujer' },
  { value: 'Transfemenino', label: 'Transfemenino' },
  { value: 'No binario', label: 'No binario' },
  { value: 'Otro', label: 'Otro' },
];

const empty: PacienteForm = {
  rut: '', nombres: '', apellidos: '', fecha_nacimiento: '',
  genero: '', telefono: '', email: '', direccion: '', nacionalidad: '',
  id_sucursal: 0, prevision: '',
  contacto_emergencia_nombre: '', contacto_emergencia_parentesco: '',
  contacto_emergencia_telefono: '', contacto_emergencia_email: '',
  contacto2_nombre: '', contacto2_parentesco: '',
  contacto2_telefono: '', contacto2_email: '',
};

export default function PacientesList() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [filterSucursal, setFilterSucursal] = useState('');
  const [filterActivo, setFilterActivo] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<PacienteForm>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof PacienteForm, string>>>({});
  const [showContact2, setShowContact2] = useState(false);

  const { data: pacientes, isLoading } = useQuery({ queryKey: ['pacientes'], queryFn: getPacientes });
  const { data: sucursales } = useQuery({ queryKey: ['sucursales'], queryFn: getSucursales, enabled: isAdmin });

  const mutation = useMutation({
    mutationFn: createPaciente,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pacientes'] });
      showToast('Paciente creado exitosamente', 'success');
      setModalOpen(false);
      setForm(empty);
      setShowContact2(false);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const validate = (): boolean => {
    const errs: Partial<Record<keyof PacienteForm, string>> = {};
    if (!form.rut) errs.rut = 'Requerido';
    else if (!validateRut(form.rut)) errs.rut = 'RUT inválido';
    if (!form.nombres) errs.nombres = 'Requerido';
    if (!form.apellidos) errs.apellidos = 'Requerido';
    if (!form.fecha_nacimiento) errs.fecha_nacimiento = 'Requerido';
    if (!form.genero) errs.genero = 'Requerido';
    if (!form.id_sucursal) errs.id_sucursal = 'Requerido';
    if (!form.contacto_emergencia_nombre) errs.contacto_emergencia_nombre = 'Requerido';
    if (!form.contacto_emergencia_telefono) errs.contacto_emergencia_telefono = 'Requerido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate(form);
  };

  const filtered = (pacientes ?? []).filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.nombres.toLowerCase().includes(q) ||
      p.apellidos.toLowerCase().includes(q) ||
      p.rut.toLowerCase().includes(q);
    const matchesSucursal = !filterSucursal || String(p.id_sucursal) === filterSucursal;
    const matchesActivo =
      filterActivo === '' ? true : filterActivo === 'true' ? p.activo : !p.activo;
    return matchesSearch && matchesSucursal && matchesActivo;
  });

  const columns: Column<Paciente>[] = [
    {
      key: 'rut',
      header: 'RUT',
      sortable: true,
      accessor: (r) => r.rut,
      render: (r) => formatRut(r.rut),
    },
    {
      key: 'nombre',
      header: 'Nombre',
      sortable: true,
      accessor: (r) => `${r.apellidos} ${r.nombres}`,
      render: (r) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {r.apellidos}, {r.nombres}
        </span>
      ),
    },
    {
      key: 'fecha_nacimiento',
      header: 'Nacimiento',
      sortable: true,
      accessor: (r) => r.fecha_nacimiento,
      render: (r) => formatDate(r.fecha_nacimiento),
    },
    { key: 'prevision', header: 'Previsión', sortable: true, accessor: (r) => r.prevision },
    {
      key: 'sucursal',
      header: 'Sucursal',
      sortable: true,
      accessor: (r) => r.nombre_sucursal ?? '',
      render: (r) => <span className="text-slate-500 dark:text-slate-400">{r.nombre_sucursal ?? '—'}</span>,
    },
    {
      key: 'activo',
      header: 'Estado',
      render: (r) => (
        <Badge label={r.activo ? 'Activo' : 'Inactivo'} color={r.activo ? 'green' : 'slate'} dot />
      ),
    },
  ];

  const sucursalOptions = (sucursales ?? []).map((s) => ({
    value: String(s.id_sucursal),
    label: s.nombre,
  }));

  if (isLoading) return <PageSpinner />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pacientes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{filtered.length} pacientes</p>
        </div>
        {isAdmin && <Button onClick={() => setModalOpen(true)}>+ Nuevo paciente</Button>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="search"
          placeholder="Buscar por nombre o RUT…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <select
          value={filterSucursal}
          onChange={(e) => setFilterSucursal(e.target.value)}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Todas las sucursales</option>
          {sucursalOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={filterActivo}
          onChange={(e) => setFilterActivo(e.target.value)}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id_paciente}
        onRowClick={(r) => navigate(`/pacientes/${r.id_paciente}`)}
        emptyMessage="No se encontraron pacientes"
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo paciente" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="RUT" required value={form.rut} onChange={(e) => setForm({ ...form, rut: formatRut(e.target.value) })} error={errors.rut} placeholder="12.345.678-9" />
          <Input label="Nombres" required value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} error={errors.nombres} />
          <Input label="Apellidos" required value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} error={errors.apellidos} />
          <Input label="Fecha de nacimiento" type="date" required value={form.fecha_nacimiento} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} error={errors.fecha_nacimiento} />
          <Select label="Identidad sexogenérica" required options={GENERO_OPTIONS} value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value })} placeholder="Seleccionar…" error={errors.genero} />
          <Select label="Nacionalidad" options={NACIONALIDAD_OPTIONS} value={form.nacionalidad} onChange={(e) => setForm({ ...form, nacionalidad: e.target.value })} placeholder="Seleccionar…" />
          <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Select
            label="Sucursal"
            required
            options={sucursalOptions}
            value={form.id_sucursal || ''}
            onChange={(e) => setForm({ ...form, id_sucursal: Number(e.target.value) })}
            placeholder="Seleccionar…"
            error={errors.id_sucursal}
          />
          <div className="col-span-2">
            <Input label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
          </div>
          <Input label="Previsión" value={form.prevision} onChange={(e) => setForm({ ...form, prevision: e.target.value })} />

          {/* Contacto de emergencia 1 */}
          <div className="col-span-2 mt-2 border-t border-slate-200 dark:border-slate-700 pt-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Contacto de emergencia 1 <span className="text-red-500">*</span></p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nombre" required value={form.contacto_emergencia_nombre} onChange={(e) => setForm({ ...form, contacto_emergencia_nombre: e.target.value })} error={errors.contacto_emergencia_nombre} />
              <Input label="Parentesco" value={form.contacto_emergencia_parentesco} onChange={(e) => setForm({ ...form, contacto_emergencia_parentesco: e.target.value })} />
              <Input label="Teléfono" required value={form.contacto_emergencia_telefono} onChange={(e) => setForm({ ...form, contacto_emergencia_telefono: e.target.value })} error={errors.contacto_emergencia_telefono} />
              <Input label="Email" type="email" value={form.contacto_emergencia_email} onChange={(e) => setForm({ ...form, contacto_emergencia_email: e.target.value })} />
            </div>
          </div>

          {/* Contacto de emergencia 2 */}
          <div className="col-span-2">
            {!showContact2 ? (
              <button
                type="button"
                className="text-sm text-primary-700 dark:text-primary-400 hover:underline"
                onClick={() => setShowContact2(true)}
              >
                + Agregar segundo contacto de emergencia
              </button>
            ) : (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contacto de emergencia 2</p>
                  <button
                    type="button"
                    className="text-xs text-slate-400 hover:text-red-500"
                    onClick={() => { setShowContact2(false); setForm({ ...form, contacto2_nombre: '', contacto2_parentesco: '', contacto2_telefono: '', contacto2_email: '' }); }}
                  >
                    Eliminar
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Nombre" value={form.contacto2_nombre} onChange={(e) => setForm({ ...form, contacto2_nombre: e.target.value })} />
                  <Input label="Parentesco" value={form.contacto2_parentesco} onChange={(e) => setForm({ ...form, contacto2_parentesco: e.target.value })} />
                  <Input label="Teléfono" value={form.contacto2_telefono} onChange={(e) => setForm({ ...form, contacto2_telefono: e.target.value })} />
                  <Input label="Email" type="email" value={form.contacto2_email} onChange={(e) => setForm({ ...form, contacto2_email: e.target.value })} />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={mutation.isPending}>Crear paciente</Button>
        </div>
      </Modal>
    </div>
  );
}
