import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getTerapeutas, createTerapeuta } from '../../api/terapeutas';
import Table, { type Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { formatRut, validateRut, formatDateTime } from '../../utils/format';
import { NACIONALIDAD_OPTIONS } from '../../utils/nacionalidades';
import type { Terapeuta, TerapeutaForm } from '../../types/terapeuta';

const GENERO_OPTIONS = [
  { value: 'Hombre', label: 'Hombre' },
  { value: 'Mujer', label: 'Mujer' },
  { value: 'Transfemenino', label: 'Transfemenino' },
  { value: 'No binario', label: 'No binario' },
  { value: 'Otro', label: 'Otro' },
];

const empty: TerapeutaForm = {
  rut: '', nombres: '', apellidos: '', fecha_nacimiento: '',
  genero: '', telefono: '', email: '', direccion: '', nacionalidad: '',
  especialidad_1: '', especialidad_2: '', especialidad_3: '', registro_profesional: '',
};

export default function TerapeutasList() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<TerapeutaForm>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof TerapeutaForm, string>>>({});
  const [search, setSearch] = useState('');

  const { data: terapeutas, isLoading } = useQuery({
    queryKey: ['terapeutas'],
    queryFn: getTerapeutas,
  });

  const mutation = useMutation({
    mutationFn: createTerapeuta,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['terapeutas'] });
      showToast('Terapeuta creado exitosamente', 'success');
      setModalOpen(false);
      setForm(empty);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const validate = () => {
    const errs: Partial<Record<keyof TerapeutaForm, string>> = {};
    if (!form.rut) errs.rut = 'Requerido';
    else if (!validateRut(form.rut)) errs.rut = 'RUT inválido';
    if (!form.nombres) errs.nombres = 'Requerido';
    if (!form.apellidos) errs.apellidos = 'Requerido';
    if (!form.especialidad_1) errs.especialidad_1 = 'Requerido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate(form);
  };

  const filtered = (terapeutas ?? []).filter((t) => {
    const q = search.toLowerCase();
    return (
      !q ||
      t.nombres.toLowerCase().includes(q) ||
      t.apellidos.toLowerCase().includes(q) ||
      t.rut.toLowerCase().includes(q) ||
      t.especialidad_1.toLowerCase().includes(q) ||
      (t.especialidad_2 ?? '').toLowerCase().includes(q) ||
      (t.especialidad_3 ?? '').toLowerCase().includes(q)
    );
  });

  const columns: Column<Terapeuta>[] = [
    {
      key: 'rut', header: 'RUT', sortable: true,
      accessor: (r) => r.rut, render: (r) => formatRut(r.rut),
    },
    {
      key: 'nombre', header: 'Nombre', sortable: true,
      accessor: (r) => `${r.apellidos} ${r.nombres}`,
      render: (r) => <span className="font-medium text-slate-900 dark:text-slate-100">{r.apellidos}, {r.nombres}</span>,
    },
    {
      key: 'especialidad_1', header: 'Especialidad', sortable: true,
      accessor: (r) => r.especialidad_1,
      render: (r) => (
        <span>
          {r.especialidad_1}
          {r.especialidad_2 && <span className="text-slate-400 dark:text-slate-500"> · {r.especialidad_2}</span>}
          {r.especialidad_3 && <span className="text-slate-400 dark:text-slate-500"> · {r.especialidad_3}</span>}
        </span>
      ),
    },
    { key: 'telefono', header: 'Celular', accessor: (r) => r.telefono },
    { key: 'email', header: 'Correo', accessor: (r) => r.email },
    {
      key: 'activo', header: 'Estado',
      render: (r) => <Badge label={r.activo ? 'Activo' : 'Inactivo'} color={r.activo ? 'green' : 'slate'} dot />,
    },
    {
      key: 'ultimo_login', header: 'Último acceso', sortable: true,
      accessor: (r) => r.ultimo_login ?? '',
      render: (r) => (
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {r.ultimo_login ? formatDateTime(r.ultimo_login) : <span className="italic text-slate-300 dark:text-slate-600">Nunca</span>}
        </span>
      ),
    },
  ];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Terapeutas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{filtered.length} terapeutas</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Nuevo terapeuta</Button>
      </div>

      <div className="mb-6">
        <input
          type="search"
          placeholder="Buscar por nombre, RUT o especialidad…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id_terapeuta}
        onRowClick={(r) => navigate(`/terapeutas/${r.id_terapeuta}`)}
        emptyMessage="No se encontraron terapeutas"
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo terapeuta" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="RUT" required value={form.rut} onChange={(e) => setForm({ ...form, rut: formatRut(e.target.value) })} error={errors.rut} placeholder="12.345.678-9" />
          <Input label="Nombres" required value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} error={errors.nombres} />
          <Input label="Apellidos" required value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} error={errors.apellidos} />
          <Input label="Fecha de nacimiento" type="date" value={form.fecha_nacimiento} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} />
          <Select label="Identidad sexogenérica" options={GENERO_OPTIONS} value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value })} placeholder="Seleccionar…" />
          <Select label="Nacionalidad" options={NACIONALIDAD_OPTIONS} value={form.nacionalidad} onChange={(e) => setForm({ ...form, nacionalidad: e.target.value })} placeholder="Seleccionar…" />
          <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="col-span-2">
            <Input label="Dirección" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
          </div>
          <Input label="Especialidad 1" required value={form.especialidad_1} onChange={(e) => setForm({ ...form, especialidad_1: e.target.value })} error={errors.especialidad_1} />
          <Input label="Registro profesional" value={form.registro_profesional} onChange={(e) => setForm({ ...form, registro_profesional: e.target.value })} />
          <Input label="Especialidad 2" value={form.especialidad_2} onChange={(e) => setForm({ ...form, especialidad_2: e.target.value })} />
          <Input label="Especialidad 3" value={form.especialidad_3} onChange={(e) => setForm({ ...form, especialidad_3: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} loading={mutation.isPending}>Crear terapeuta</Button>
        </div>
      </Modal>
    </div>
  );
}
