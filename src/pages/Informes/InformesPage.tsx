import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInformes, createInforme, updateInforme, deleteInforme } from '../../api/informes';
import { getEmpresas } from '../../api/empresas';
import { getSucursales } from '../../api/sucursales';
import { getPacientes } from '../../api/pacientes';
import { getTerapeutas } from '../../api/terapeutas';
import { getInsumos } from '../../api/insumos';
import Table, { type Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input, { TextArea } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';
import type { Informe, InformeForm, TipoInforme } from '../../types/informe';

const TIPO_OPTIONS: { value: TipoInforme; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'sucursal', label: 'Sucursal' },
  { value: 'paciente', label: 'Paciente' },
  { value: 'terapeuta', label: 'Terapeuta' },
  { value: 'insumo', label: 'Insumo' },
];

const emptyForm: InformeForm = {
  titulo: '', tipo: 'general',
  fecha_desde: '', fecha_hasta: '',
  contenido: '', generado_por: '',
};

export default function InformesPage() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInforme, setEditingInforme] = useState<Informe | null>(null);
  const [form, setForm] = useState<InformeForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterTipo, setFilterTipo] = useState<TipoInforme | ''>('');

  const { data: informes, isLoading } = useQuery({
    queryKey: ['informes', filterTipo],
    queryFn: () => getInformes(filterTipo || undefined),
  });

  const { data: empresas } = useQuery({ queryKey: ['empresas'], queryFn: getEmpresas });
  const { data: sucursales } = useQuery({ queryKey: ['sucursales'], queryFn: getSucursales });
  const { data: pacientes } = useQuery({ queryKey: ['pacientes'], queryFn: getPacientes });
  const { data: terapeutas } = useQuery({ queryKey: ['terapeutas'], queryFn: getTerapeutas });
  const { data: insumos } = useQuery({ queryKey: ['insumos'], queryFn: getInsumos });

  const mut = useMutation({
    mutationFn: (f: InformeForm) =>
      editingInforme ? updateInforme(editingInforme.id_informe, f) : createInforme(f),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['informes'] });
      showToast(editingInforme ? 'Informe actualizado' : 'Informe creado', 'success');
      setModalOpen(false);
      setEditingInforme(null);
      setForm(emptyForm);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteInforme(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['informes'] });
      showToast('Informe eliminado', 'success');
      setDeleteId(null);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const openEdit = (inf: Informe) => {
    setEditingInforme(inf);
    setForm({
      titulo: inf.titulo, tipo: inf.tipo,
      id_empresa: inf.id_empresa, id_sucursal: inf.id_sucursal,
      id_paciente: inf.id_paciente, id_terapeuta: inf.id_terapeuta,
      id_insumo: inf.id_insumo,
      fecha_desde: inf.fecha_desde, fecha_hasta: inf.fecha_hasta,
      contenido: inf.contenido, url_documento: inf.url_documento,
      generado_por: inf.generado_por,
    });
    setModalOpen(true);
  };

  const columns: Column<Informe>[] = [
    { key: 'titulo', header: 'Título', sortable: true, accessor: (r) => r.titulo, render: (r) => <span className="font-medium text-slate-900 dark:text-slate-100">{r.titulo}</span> },
    { key: 'tipo', header: 'Tipo', sortable: true, accessor: (r) => r.tipo, render: (r) => <span className="capitalize">{r.tipo}</span> },
    { key: 'desde', header: 'Período desde', sortable: true, accessor: (r) => r.fecha_desde, render: (r) => formatDate(r.fecha_desde) },
    { key: 'hasta', header: 'Hasta', sortable: true, accessor: (r) => r.fecha_hasta, render: (r) => formatDate(r.fecha_hasta) },
    { key: 'generado_por', header: 'Generado por', accessor: (r) => r.generado_por },
    {
      key: 'acciones', header: '',
      render: (r) => (
        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>Editar</Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteId(r.id_informe)}>Eliminar</Button>
        </div>
      ),
    },
  ];

  const empresaOptions = (empresas ?? []).map((e) => ({ value: e.id_empresa, label: e.nombre }));
  const sucursalOptions = (sucursales ?? []).map((s) => ({ value: s.id_sucursal, label: s.nombre }));
  const pacienteOptions = (pacientes ?? []).map((p) => ({ value: p.id_paciente, label: `${p.apellidos}, ${p.nombres}` }));
  const terapeutaOptions = (terapeutas ?? []).map((t) => ({ value: t.id_terapeuta, label: `${t.apellidos}, ${t.nombres}` }));
  const insumoOptions = (insumos ?? []).map((i) => ({ value: i.id_insumo, label: i.nombre }));

  if (isLoading) return <PageSpinner />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Informes</h1>
        <Button onClick={() => { setEditingInforme(null); setForm(emptyForm); setModalOpen(true); }}>+ Nuevo informe</Button>
      </div>

      <div className="mb-6">
        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value as TipoInforme | '')}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos los tipos</option>
          {TIPO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <Table
        columns={columns}
        data={informes ?? []}
        keyExtractor={(r) => r.id_informe}
        emptyMessage="Sin informes registrados"
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingInforme ? 'Editar informe' : 'Nuevo informe'} size="lg">
        <div className="space-y-4">
          <Input label="Título" required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tipo" required options={TIPO_OPTIONS} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoInforme })} />
            <Input label="Generado por" required value={form.generado_por} onChange={(e) => setForm({ ...form, generado_por: e.target.value })} />
            <Input label="Fecha desde" type="date" required value={form.fecha_desde} onChange={(e) => setForm({ ...form, fecha_desde: e.target.value })} />
            <Input label="Fecha hasta" type="date" required value={form.fecha_hasta} onChange={(e) => setForm({ ...form, fecha_hasta: e.target.value })} />
          </div>

          {/* Conditional FK fields */}
          {form.tipo === 'empresa' && (
            <Select label="Empresa" options={empresaOptions} value={form.id_empresa ?? ''} onChange={(e) => setForm({ ...form, id_empresa: Number(e.target.value) })} placeholder="Seleccionar…" />
          )}
          {form.tipo === 'sucursal' && (
            <Select label="Sucursal" options={sucursalOptions} value={form.id_sucursal ?? ''} onChange={(e) => setForm({ ...form, id_sucursal: Number(e.target.value) })} placeholder="Seleccionar…" />
          )}
          {form.tipo === 'paciente' && (
            <Select label="Paciente" options={pacienteOptions} value={form.id_paciente ?? ''} onChange={(e) => setForm({ ...form, id_paciente: Number(e.target.value) })} placeholder="Seleccionar…" />
          )}
          {form.tipo === 'terapeuta' && (
            <Select label="Terapeuta" options={terapeutaOptions} value={form.id_terapeuta ?? ''} onChange={(e) => setForm({ ...form, id_terapeuta: Number(e.target.value) })} placeholder="Seleccionar…" />
          )}
          {form.tipo === 'insumo' && (
            <Select label="Insumo" options={insumoOptions} value={form.id_insumo ?? ''} onChange={(e) => setForm({ ...form, id_insumo: Number(e.target.value) })} placeholder="Seleccionar…" />
          )}

          <TextArea label="Contenido" rows={4} value={form.contenido} onChange={(e) => setForm({ ...form, contenido: e.target.value })} />
          <Input label="URL documento" value={form.url_documento ?? ''} onChange={(e) => setForm({ ...form, url_documento: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={() => mut.mutate(form)} loading={mut.isPending}>{editingInforme ? 'Guardar' : 'Crear'}</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        message="¿Eliminar este informe?"
        onConfirm={() => deleteId !== null && deleteMut.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
        loading={deleteMut.isPending}
      />
    </div>
  );
}
