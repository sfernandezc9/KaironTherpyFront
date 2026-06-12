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
  createSucursal,
  updateSucursal,
  deleteSucursal,
  getSucursalResponsables,
  createResponsable,
  updateResponsable,
  deleteResponsable,
} from '../../api/sucursales';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { formatRut, validateRut } from '../../utils/format';
import type { Empresa, EmpresaForm } from '../../types/empresa';
import type { Sucursal, SucursalForm, Responsable, ResponsableForm } from '../../types/sucursal';

const emptyEmpresa: EmpresaForm = { nombre: '', rut: '', direccion: '', telefono: '', email: '' };
const emptySucursal: SucursalForm = { id_empresa: 0, nombre: '', direccion: '', activa: true };
const emptyResponsable: ResponsableForm = { nombre: '', cargo: '', email: '', celular: '' };

// ── Sub-components ────────────────────────────────────────────

function ResponsableRow({
  r,
  onEdit,
  onDelete,
}: {
  r: Responsable;
  onEdit: (r: Responsable) => void;
  onDelete: (r: Responsable) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
      <div className="flex-1 min-w-0">
        <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">{r.nombre}</span>
        {r.cargo && <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{r.cargo}</span>}
        <div className="flex gap-4 mt-0.5 text-xs text-slate-400 dark:text-slate-500">
          {r.email  && <span>{r.email}</span>}
          {r.celular && <span>{r.celular}</span>}
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => onEdit(r)}>Editar</Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(r)}>Eliminar</Button>
      </div>
    </div>
  );
}

function SucursalCard({
  s,
  onEdit,
  onDelete,
}: {
  s: Sucursal;
  onEdit: (s: Sucursal) => void;
  onDelete: (s: Sucursal) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingResp, setEditingResp] = useState<Responsable | null>(null);
  const [respForm, setRespForm] = useState<ResponsableForm>(emptyResponsable);
  const [respModalOpen, setRespModalOpen] = useState(false);
  const [deleteRespTarget, setDeleteRespTarget] = useState<Responsable | null>(null);
  const { showToast } = useToast();
  const qc = useQueryClient();

  const { data: responsables } = useQuery({
    queryKey: ['sucursalResponsables', s.id_sucursal],
    queryFn: () => getSucursalResponsables(s.id_sucursal),
    enabled: expanded,
  });

  const respMut = useMutation({
    mutationFn: (form: ResponsableForm) =>
      editingResp
        ? updateResponsable(s.id_sucursal, editingResp.id_responsable, form)
        : createResponsable(s.id_sucursal, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sucursalResponsables', s.id_sucursal] });
      showToast(editingResp ? 'Responsable actualizado' : 'Responsable creado', 'success');
      setRespModalOpen(false);
      setEditingResp(null);
      setRespForm(emptyResponsable);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const deleteRespMut = useMutation({
    mutationFn: (r: Responsable) => deleteResponsable(s.id_sucursal, r.id_responsable),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sucursalResponsables', s.id_sucursal] });
      showToast('Responsable eliminado', 'success');
      setDeleteRespTarget(null);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const openAddResp = () => {
    setEditingResp(null);
    setRespForm(emptyResponsable);
    setRespModalOpen(true);
  };

  const openEditResp = (r: Responsable) => {
    setEditingResp(r);
    setRespForm({ nombre: r.nombre, cargo: r.cargo, email: r.email, celular: r.celular });
    setRespModalOpen(true);
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      {/* Sucursal header */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750 select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-slate-400 text-xs w-4 shrink-0">{expanded ? '▼' : '▶'}</span>
        <Badge label={s.activa ? 'Activa' : 'Inactiva'} color={s.activa ? 'green' : 'slate'} dot />
        <span className="font-medium text-slate-800 dark:text-slate-200 flex-1 text-sm">{s.nombre}</span>
        {s.direccion && <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">{s.direccion}</span>}
        <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => onEdit(s)}>Editar</Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(s)}>Eliminar</Button>
        </div>
      </div>

      {/* Responsables panel */}
      {expanded && (
        <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Encargados</span>
            <Button size="sm" variant="secondary" onClick={openAddResp}>+ Encargado</Button>
          </div>
          {!responsables ? (
            <p className="text-xs text-slate-400 py-1">Cargando…</p>
          ) : responsables.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-1">Sin encargados registrados</p>
          ) : (
            <div className="space-y-2">
              {responsables.map((r) => (
                <ResponsableRow
                  key={r.id_responsable}
                  r={r}
                  onEdit={openEditResp}
                  onDelete={setDeleteRespTarget}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Responsable modal */}
      <Modal
        open={respModalOpen}
        onClose={() => setRespModalOpen(false)}
        title={editingResp ? 'Editar encargado' : 'Nuevo encargado'}
        size="sm"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Nombre" required value={respForm.nombre} onChange={(e) => setRespForm({ ...respForm, nombre: e.target.value })} />
          </div>
          <Input label="Cargo" value={respForm.cargo} onChange={(e) => setRespForm({ ...respForm, cargo: e.target.value })} />
          <Input label="Celular" value={respForm.celular} onChange={(e) => setRespForm({ ...respForm, celular: e.target.value })} />
          <div className="col-span-2">
            <Input label="Email" type="email" value={respForm.email} onChange={(e) => setRespForm({ ...respForm, email: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setRespModalOpen(false)}>Cancelar</Button>
          <Button onClick={() => respMut.mutate(respForm)} loading={respMut.isPending}>
            {editingResp ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteRespTarget !== null}
        message={`¿Eliminar encargado "${deleteRespTarget?.nombre}"?`}
        onConfirm={() => deleteRespTarget && deleteRespMut.mutate(deleteRespTarget)}
        onCancel={() => setDeleteRespTarget(null)}
        loading={deleteRespMut.isPending}
      />
    </div>
  );
}

function EmpresaRow({
  e,
  onEdit,
  onDelete,
}: {
  e: Empresa;
  onEdit: (e: Empresa) => void;
  onDelete: (e: Empresa) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null);
  const [sucursalForm, setSucursalForm] = useState<SucursalForm>(emptySucursal);
  const [sucursalModalOpen, setSucursalModalOpen] = useState(false);
  const [deleteSucursalTarget, setDeleteSucursalTarget] = useState<Sucursal | null>(null);
  const { showToast } = useToast();
  const qc = useQueryClient();

  const { data: sucursales } = useQuery({
    queryKey: ['empresaSucursales', e.id_empresa],
    queryFn: () => getEmpresaSucursales(e.id_empresa),
    enabled: expanded,
  });

  const sucursalMut = useMutation({
    mutationFn: (form: SucursalForm) =>
      editingSucursal
        ? updateSucursal(editingSucursal.id_sucursal, form)
        : createSucursal(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['empresaSucursales', e.id_empresa] });
      showToast(editingSucursal ? 'Sucursal actualizada' : 'Sucursal creada', 'success');
      setSucursalModalOpen(false);
      setEditingSucursal(null);
      setSucursalForm(emptySucursal);
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const deleteSucursalMut = useMutation({
    mutationFn: (s: Sucursal) => deleteSucursal(s.id_sucursal),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['empresaSucursales', e.id_empresa] });
      showToast('Sucursal eliminada', 'success');
      setDeleteSucursalTarget(null);
    },
    onError: (err: Error) => showToast(err.message, 'error'),
  });

  const openAddSucursal = () => {
    setEditingSucursal(null);
    setSucursalForm({ ...emptySucursal, id_empresa: e.id_empresa });
    setSucursalModalOpen(true);
  };

  const openEditSucursal = (s: Sucursal) => {
    setEditingSucursal(s);
    setSucursalForm({ id_empresa: s.id_empresa, nombre: s.nombre, direccion: s.direccion, activa: s.activa });
    setSucursalModalOpen(true);
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
      {/* Empresa header */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-slate-400 text-xs w-4 shrink-0">{expanded ? '▼' : '▶'}</span>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-slate-900 dark:text-slate-100">{e.nombre}</span>
          <span className="ml-3 text-sm text-slate-400 dark:text-slate-500">{formatRut(e.rut)}</span>
        </div>
        {e.email && <span className="text-sm text-slate-400 dark:text-slate-500 hidden md:block">{e.email}</span>}
        <div className="flex gap-1 shrink-0" onClick={(ev) => ev.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => onEdit(e)}>Editar</Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(e)}>Eliminar</Button>
        </div>
      </div>

      {/* Sucursales panel */}
      {expanded && (
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sucursales</span>
            <Button size="sm" onClick={openAddSucursal}>+ Sucursal</Button>
          </div>
          {!sucursales ? (
            <p className="text-xs text-slate-400 py-1">Cargando…</p>
          ) : sucursales.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-1">Sin sucursales</p>
          ) : (
            <div className="space-y-2">
              {sucursales.map((s) => (
                <SucursalCard
                  key={s.id_sucursal}
                  s={s}
                  onEdit={openEditSucursal}
                  onDelete={setDeleteSucursalTarget}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sucursal modal */}
      <Modal
        open={sucursalModalOpen}
        onClose={() => setSucursalModalOpen(false)}
        title={editingSucursal ? 'Editar sucursal' : 'Nueva sucursal'}
        size="sm"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Nombre" required value={sucursalForm.nombre} onChange={(ev) => setSucursalForm({ ...sucursalForm, nombre: ev.target.value })} />
          </div>
          <div className="col-span-2">
            <Input label="Dirección" value={sucursalForm.direccion} onChange={(ev) => setSucursalForm({ ...sucursalForm, direccion: ev.target.value })} />
          </div>
          <Select
            label="Estado"
            options={[{ value: 'true', label: 'Activa' }, { value: 'false', label: 'Inactiva' }]}
            value={String(sucursalForm.activa)}
            onChange={(ev) => setSucursalForm({ ...sucursalForm, activa: ev.target.value === 'true' })}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setSucursalModalOpen(false)}>Cancelar</Button>
          <Button onClick={() => sucursalMut.mutate(sucursalForm)} loading={sucursalMut.isPending}>
            {editingSucursal ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteSucursalTarget !== null}
        message={`¿Eliminar sucursal "${deleteSucursalTarget?.nombre}"?`}
        onConfirm={() => deleteSucursalTarget && deleteSucursalMut.mutate(deleteSucursalTarget)}
        onCancel={() => setDeleteSucursalTarget(null)}
        loading={deleteSucursalMut.isPending}
      />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function EstructuraPage() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  const [empresaModalOpen, setEmpresaModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [empresaForm, setEmpresaForm] = useState<EmpresaForm>(emptyEmpresa);
  const [deleteEmpresaId, setDeleteEmpresaId] = useState<number | null>(null);
  const [empresaRutError, setEmpresaRutError] = useState('');

  const { data: empresas, isLoading } = useQuery({ queryKey: ['empresas'], queryFn: getEmpresas });

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

  const openAddEmpresa = () => {
    setEditingEmpresa(null);
    setEmpresaForm(emptyEmpresa);
    setEmpresaRutError('');
    setEmpresaModalOpen(true);
  };

  const openEditEmpresa = (e: Empresa) => {
    setEditingEmpresa(e);
    setEmpresaForm({ nombre: e.nombre, rut: e.rut, direccion: e.direccion, telefono: e.telefono, email: e.email });
    setEmpresaRutError('');
    setEmpresaModalOpen(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Estructura</h1>
        <Button onClick={openAddEmpresa}>+ Nueva empresa</Button>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : !empresas?.length ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <p className="text-lg">Sin empresas registradas</p>
          <p className="text-sm mt-1">Crea una empresa para empezar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {empresas.map((e) => (
            <EmpresaRow
              key={e.id_empresa}
              e={e}
              onEdit={openEditEmpresa}
              onDelete={(emp) => setDeleteEmpresaId(emp.id_empresa)}
            />
          ))}
        </div>
      )}

      {/* Empresa modal */}
      <Modal
        open={empresaModalOpen}
        onClose={() => setEmpresaModalOpen(false)}
        title={editingEmpresa ? 'Editar empresa' : 'Nueva empresa'}
        size="md"
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre" required
            value={empresaForm.nombre}
            onChange={(e) => setEmpresaForm({ ...empresaForm, nombre: e.target.value })}
          />
          <Input
            label="RUT" required
            value={empresaForm.rut}
            onChange={(e) => { setEmpresaForm({ ...empresaForm, rut: e.target.value }); setEmpresaRutError(''); }}
            error={empresaRutError}
          />
          <Input
            label="Teléfono"
            value={empresaForm.telefono}
            onChange={(e) => setEmpresaForm({ ...empresaForm, telefono: e.target.value })}
          />
          <Input
            label="Email" type="email"
            value={empresaForm.email}
            onChange={(e) => setEmpresaForm({ ...empresaForm, email: e.target.value })}
          />
          <div className="col-span-2">
            <Input
              label="Dirección"
              value={empresaForm.direccion}
              onChange={(e) => setEmpresaForm({ ...empresaForm, direccion: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setEmpresaModalOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              if (!empresaForm.rut) { setEmpresaRutError('Requerido'); return; }
              if (!validateRut(empresaForm.rut)) { setEmpresaRutError('RUT inválido'); return; }
              empresaMut.mutate(empresaForm);
            }}
            loading={empresaMut.isPending}
          >
            {editingEmpresa ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteEmpresaId !== null}
        message="¿Eliminar esta empresa? Se eliminarán todas sus sucursales."
        onConfirm={() => deleteEmpresaId !== null && deleteEmpresaMut.mutate(deleteEmpresaId)}
        onCancel={() => setDeleteEmpresaId(null)}
        loading={deleteEmpresaMut.isPending}
      />
    </div>
  );
}
