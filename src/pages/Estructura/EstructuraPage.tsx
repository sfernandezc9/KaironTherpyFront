import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEmpresas,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  getEmpresaSucursales,
} from '../../api/empresas';
import {
  getSucursales,
  createSucursal,
  updateSucursal,
  deleteSucursal,
  getSucursalTerapeutas,
} from '../../api/sucursales';
import { Tabs, TabPanel } from '../../components/ui/Tabs';
import Table, { type Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { formatRut } from '../../utils/format';
import type { Empresa, EmpresaForm } from '../../types/empresa';
import type { Sucursal, SucursalForm } from '../../types/sucursal';

const TABS = [
  { id: 'empresas', label: 'Empresas' },
  { id: 'sucursales', label: 'Sucursales' },
];

const emptyEmpresa: EmpresaForm = { nombre: '', rut: '', direccion: '', telefono: '', email: '' };
const emptySucursal: SucursalForm = { id_empresa: 0, nombre: '', direccion: '', telefono: '', email: '', activa: true };

export default function EstructuraPage() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('empresas');

  // Empresa state
  const [empresaModalOpen, setEmpresaModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [empresaForm, setEmpresaForm] = useState<EmpresaForm>(emptyEmpresa);
  const [deleteEmpresaId, setDeleteEmpresaId] = useState<number | null>(null);
  const [expandedEmpresa, setExpandedEmpresa] = useState<number | null>(null);

  // Sucursal state
  const [sucursalModalOpen, setSucursalModalOpen] = useState(false);
  const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null);
  const [sucursalForm, setSucursalForm] = useState<SucursalForm>(emptySucursal);
  const [deleteSucursalId, setDeleteSucursalId] = useState<number | null>(null);
  const [expandedSucursal, setExpandedSucursal] = useState<number | null>(null);

  const { data: empresas, isLoading: loadingE } = useQuery({ queryKey: ['empresas'], queryFn: getEmpresas });
  const { data: sucursales, isLoading: loadingS } = useQuery({ queryKey: ['sucursales'], queryFn: getSucursales });

  const { data: empresaSucursales } = useQuery({
    queryKey: ['empresaSucursales', expandedEmpresa],
    queryFn: () => getEmpresaSucursales(expandedEmpresa!),
    enabled: expandedEmpresa !== null,
  });

  const { data: sucursalTerapeutas } = useQuery({
    queryKey: ['sucursalTerapeutas', expandedSucursal],
    queryFn: () => getSucursalTerapeutas(expandedSucursal!),
    enabled: expandedSucursal !== null,
  });

  const empresaMut = useMutation({
    mutationFn: (form: EmpresaForm) =>
      editingEmpresa ? updateEmpresa(editingEmpresa.id_empresa, form) : createEmpresa(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['empresas'] });
      showToast(editingEmpresa ? 'Empresa actualizada' : 'Empresa creada', 'success');
      setEmpresaModalOpen(false);
      setEditingEmpresa(null);
      setEmpresaForm(emptyEmpresa);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const deleteEmpresaMut = useMutation({
    mutationFn: (id: number) => deleteEmpresa(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['empresas'] });
      showToast('Empresa eliminada', 'success');
      setDeleteEmpresaId(null);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const sucursalMut = useMutation({
    mutationFn: (form: SucursalForm) =>
      editingSucursal ? updateSucursal(editingSucursal.id_sucursal, form) : createSucursal(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sucursales'] });
      showToast(editingSucursal ? 'Sucursal actualizada' : 'Sucursal creada', 'success');
      setSucursalModalOpen(false);
      setEditingSucursal(null);
      setSucursalForm(emptySucursal);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const deleteSucursalMut = useMutation({
    mutationFn: (id: number) => deleteSucursal(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sucursales'] });
      showToast('Sucursal eliminada', 'success');
      setDeleteSucursalId(null);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const empresaColumns: Column<Empresa>[] = [
    { key: 'rut', header: 'RUT', sortable: true, accessor: (r) => r.rut, render: (r) => formatRut(r.rut) },
    { key: 'nombre', header: 'Nombre', sortable: true, accessor: (r) => r.nombre, render: (r) => <span className="font-medium text-slate-900">{r.nombre}</span> },
    { key: 'email', header: 'Email', accessor: (r) => r.email },
    { key: 'telefono', header: 'Teléfono', accessor: (r) => r.telefono },
    {
      key: 'acciones', header: '',
      render: (r) => (
        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => {
            setEditingEmpresa(r);
            setEmpresaForm({ nombre: r.nombre, rut: r.rut, direccion: r.direccion, telefono: r.telefono, email: r.email });
            setEmpresaModalOpen(true);
          }}>Editar</Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteEmpresaId(r.id_empresa)}>Eliminar</Button>
        </div>
      ),
    },
  ];

  const sucursalColumns: Column<Sucursal>[] = [
    { key: 'nombre', header: 'Nombre', sortable: true, accessor: (r) => r.nombre, render: (r) => <span className="font-medium text-slate-900">{r.nombre}</span> },
    { key: 'empresa', header: 'Empresa', sortable: true, accessor: (r) => r.nombre_empresa ?? '', render: (r) => <span className="text-slate-500">{r.nombre_empresa ?? '—'}</span> },
    { key: 'email', header: 'Email', accessor: (r) => r.email },
    { key: 'activa', header: 'Estado', render: (r) => <Badge label={r.activa ? 'Activa' : 'Inactiva'} color={r.activa ? 'green' : 'slate'} dot /> },
    {
      key: 'acciones', header: '',
      render: (r) => (
        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => {
            setEditingSucursal(r);
            setSucursalForm({ id_empresa: r.id_empresa, nombre: r.nombre, direccion: r.direccion, telefono: r.telefono, email: r.email, activa: r.activa });
            setSucursalModalOpen(true);
          }}>Editar</Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteSucursalId(r.id_sucursal)}>Eliminar</Button>
        </div>
      ),
    },
  ];

  const empresaOptions = (empresas ?? []).map((e) => ({ value: e.id_empresa, label: e.nombre }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Estructura</h1>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab}>
        <TabPanel id="empresas" active={activeTab}>
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditingEmpresa(null); setEmpresaForm(emptyEmpresa); setEmpresaModalOpen(true); }}>
              + Nueva empresa
            </Button>
          </div>
          {loadingE ? <PageSpinner /> : (
            <>
              <Table
                columns={empresaColumns}
                data={empresas ?? []}
                keyExtractor={(r) => r.id_empresa}
                onRowClick={(r) => setExpandedEmpresa(expandedEmpresa === r.id_empresa ? null : r.id_empresa)}
                emptyMessage="Sin empresas registradas"
              />
              {expandedEmpresa !== null && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Sucursales</p>
                  {!empresaSucursales?.length ? (
                    <p className="text-sm text-slate-400">Sin sucursales</p>
                  ) : (
                    <ul className="space-y-2">
                      {empresaSucursales.map((s) => (
                        <li key={s.id_sucursal} className="flex items-center gap-3 text-sm text-slate-700">
                          <Badge label={s.activa ? 'Activa' : 'Inactiva'} color={s.activa ? 'green' : 'slate'} />
                          <span className="font-medium">{s.nombre}</span>
                          <span className="text-slate-400">{s.direccion}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </TabPanel>

        <TabPanel id="sucursales" active={activeTab}>
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditingSucursal(null); setSucursalForm(emptySucursal); setSucursalModalOpen(true); }}>
              + Nueva sucursal
            </Button>
          </div>
          {loadingS ? <PageSpinner /> : (
            <>
              <Table
                columns={sucursalColumns}
                data={sucursales ?? []}
                keyExtractor={(r) => r.id_sucursal}
                onRowClick={(r) => setExpandedSucursal(expandedSucursal === r.id_sucursal ? null : r.id_sucursal)}
                emptyMessage="Sin sucursales"
              />
              {expandedSucursal !== null && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Terapeutas activos</p>
                  {!sucursalTerapeutas?.length ? (
                    <p className="text-sm text-slate-400">Sin terapeutas asignados</p>
                  ) : (
                    <ul className="space-y-2">
                      {sucursalTerapeutas.map((t) => (
                        <li key={t.id_terapeuta} className="flex items-center gap-3 text-sm text-slate-700">
                          <span className="font-medium">{t.apellidos}, {t.nombres}</span>
                          <span className="text-slate-400">{t.especialidad}</span>
                          <span className="text-slate-400">{formatRut(t.rut)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </TabPanel>
      </Tabs>

      {/* Empresa modal */}
      <Modal open={empresaModalOpen} onClose={() => setEmpresaModalOpen(false)} title={editingEmpresa ? 'Editar empresa' : 'Nueva empresa'} size="md">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre" required value={empresaForm.nombre} onChange={(e) => setEmpresaForm({ ...empresaForm, nombre: e.target.value })} />
          <Input label="RUT" required value={empresaForm.rut} onChange={(e) => setEmpresaForm({ ...empresaForm, rut: e.target.value })} />
          <Input label="Teléfono" value={empresaForm.telefono} onChange={(e) => setEmpresaForm({ ...empresaForm, telefono: e.target.value })} />
          <Input label="Email" type="email" value={empresaForm.email} onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })} />
          <div className="col-span-2">
            <Input label="Dirección" value={empresaForm.direccion} onChange={(e) => setEmpresaForm({ ...empresaForm, direccion: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setEmpresaModalOpen(false)}>Cancelar</Button>
          <Button onClick={() => empresaMut.mutate(empresaForm)} loading={empresaMut.isPending}>{editingEmpresa ? 'Guardar' : 'Crear'}</Button>
        </div>
      </Modal>

      {/* Sucursal modal */}
      <Modal open={sucursalModalOpen} onClose={() => setSucursalModalOpen(false)} title={editingSucursal ? 'Editar sucursal' : 'Nueva sucursal'} size="md">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Empresa" required options={empresaOptions} value={sucursalForm.id_empresa || ''} onChange={(e) => setSucursalForm({ ...sucursalForm, id_empresa: Number(e.target.value) })} placeholder="Seleccionar…" />
          <Input label="Nombre" required value={sucursalForm.nombre} onChange={(e) => setSucursalForm({ ...sucursalForm, nombre: e.target.value })} />
          <Input label="Teléfono" value={sucursalForm.telefono} onChange={(e) => setSucursalForm({ ...sucursalForm, telefono: e.target.value })} />
          <Input label="Email" type="email" value={sucursalForm.email} onChange={(e) => setSucursalForm({ ...sucursalForm, email: e.target.value })} />
          <div className="col-span-2">
            <Input label="Dirección" value={sucursalForm.direccion} onChange={(e) => setSucursalForm({ ...sucursalForm, direccion: e.target.value })} />
          </div>
          <Select label="Estado" options={[{ value: 'true', label: 'Activa' }, { value: 'false', label: 'Inactiva' }]} value={String(sucursalForm.activa)} onChange={(e) => setSucursalForm({ ...sucursalForm, activa: e.target.value === 'true' })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setSucursalModalOpen(false)}>Cancelar</Button>
          <Button onClick={() => sucursalMut.mutate(sucursalForm)} loading={sucursalMut.isPending}>{editingSucursal ? 'Guardar' : 'Crear'}</Button>
        </div>
      </Modal>

      <ConfirmDialog open={deleteEmpresaId !== null} message="¿Eliminar esta empresa?" onConfirm={() => deleteEmpresaId !== null && deleteEmpresaMut.mutate(deleteEmpresaId)} onCancel={() => setDeleteEmpresaId(null)} loading={deleteEmpresaMut.isPending} />
      <ConfirmDialog open={deleteSucursalId !== null} message="¿Eliminar esta sucursal?" onConfirm={() => deleteSucursalId !== null && deleteSucursalMut.mutate(deleteSucursalId)} onCancel={() => setDeleteSucursalId(null)} loading={deleteSucursalMut.isPending} />
    </div>
  );
}
