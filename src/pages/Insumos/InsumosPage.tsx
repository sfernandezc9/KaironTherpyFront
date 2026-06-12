import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInsumos, createInsumo, updateInsumo, deleteInsumo } from '../../api/insumos';
import {
  getStock, createStock, ajustarStock, deleteStock,
  getStockProveedor, createStockProveedor, ajustarStockProveedor,
  transferirStock, getTransferencias,
  getSolicitudes, aprobarSolicitud, rechazarSolicitud,
} from '../../api/stock';
import { getSucursales } from '../../api/sucursales';
import { Tabs, TabPanel } from '../../components/ui/Tabs';
import Table, { type Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { StockBajoBadge } from '../../components/ui/Badge';
import Badge from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../utils/format';
import type { Insumo, InsumoForm } from '../../types/insumo';
import type { Stock, StockForm, StockProveedor, StockProveedorForm, Transferencia, TransferenciaFilters, Solicitud } from '../../types/stock';

const TABS = [
  { id: 'catalogo',    label: 'Catálogo' },
  { id: 'stock',       label: 'Stock' },
  { id: 'solicitudes', label: 'Solicitudes' },
  { id: 'historial',   label: 'Historial' },
];

const emptyInsumo: InsumoForm = { nombre: '', descripcion: '', unidad_medida: '' };
const emptyStockForm: StockForm = { id_sucursal: 0, id_insumo: 0, cantidad_minima: 0 };
const emptyProveedorForm: StockProveedorForm = { id_insumo: 0, cantidad: 0, cantidad_minima: 0 };

export default function InsumosPage() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('catalogo');

  // ── Catálogo state ─────────────────────────────────────────
  const [insumoModalOpen, setInsumoModalOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);
  const [insumoForm, setInsumoForm] = useState<InsumoForm>(emptyInsumo);
  const [deleteInsumoId, setDeleteInsumoId] = useState<number | null>(null);

  // ── Proveedor state ────────────────────────────────────────
  const [proveedorCreateOpen, setProveedorCreateOpen] = useState(false);
  const [proveedorForm, setProveedorForm] = useState<StockProveedorForm>(emptyProveedorForm);
  const [ingresarOpen, setIngresarOpen] = useState(false);
  const [ingresarTarget, setIngresarTarget] = useState<StockProveedor | null>(null);
  const [ingresarDelta, setIngresarDelta] = useState(1);
  const [showBajoMinimo, setShowBajoMinimo] = useState(false);

  // ── Transfer state ─────────────────────────────────────────
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferProveedor, setTransferProveedor] = useState<StockProveedor | null>(null);
  const [transferIdStock, setTransferIdStock] = useState(0);
  const [transferCantidad, setTransferCantidad] = useState(1);
  const [transferNotas, setTransferNotas] = useState('');

  // ── Stock sucursal state ───────────────────────────────────
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockForm, setStockForm] = useState<StockForm>(emptyStockForm);
  const [deleteStockId, setDeleteStockId] = useState<number | null>(null);
  const [filterSucursal, setFilterSucursal] = useState('');
  const [mermaOpen, setMermaOpen] = useState(false);
  const [mermaTarget, setMermaTarget] = useState<Stock | null>(null);
  const [mermaDelta, setMermaDelta] = useState(1);

  // ── Solicitudes state ──────────────────────────────────────
  const [filterEstado, setFilterEstado] = useState<'pendiente' | 'aprobada' | 'rechazada' | ''>('pendiente');
  const [aprobarTarget, setAprobarTarget] = useState<Solicitud | null>(null);
  const [rechazarTarget, setRechazarTarget] = useState<Solicitud | null>(null);
  const [respuesta, setRespuesta] = useState('');

  // ── Historial state ────────────────────────────────────────
  const [transFilters, setTransFilters] = useState<TransferenciaFilters>({});

  // ── Queries ────────────────────────────────────────────────
  const { data: insumos,       isLoading: loadingI } = useQuery({ queryKey: ['insumos'],       queryFn: getInsumos });
  const { data: stock,         isLoading: loadingS } = useQuery({ queryKey: ['stock'],         queryFn: getStock });
  const { data: sucursales }                          = useQuery({ queryKey: ['sucursales'],    queryFn: getSucursales });
  const { data: stockProveedor, isLoading: loadingP } = useQuery({ queryKey: ['stockProveedor'], queryFn: getStockProveedor });
  const { data: transferencias, isLoading: loadingT } = useQuery({
    queryKey: ['transferencias', transFilters],
    queryFn: () => getTransferencias(transFilters),
  });
  const { data: solicitudes, isLoading: loadingSol } = useQuery({
    queryKey: ['solicitudes'],
    queryFn: getSolicitudes,
  });

  // ── Insumo mutations ───────────────────────────────────────
  const insumoMut = useMutation({
    mutationFn: (form: InsumoForm) =>
      editingInsumo ? updateInsumo(editingInsumo.id_insumo, form) : createInsumo(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['insumos'] });
      showToast(editingInsumo ? 'Insumo actualizado' : 'Insumo creado', 'success');
      setInsumoModalOpen(false); setEditingInsumo(null); setInsumoForm(emptyInsumo);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const deleteInsumoMut = useMutation({
    mutationFn: deleteInsumo,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['insumos'] }); showToast('Insumo eliminado', 'success'); setDeleteInsumoId(null); },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  // ── Proveedor mutations ────────────────────────────────────
  const createProveedorMut = useMutation({
    mutationFn: createStockProveedor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stockProveedor'] });
      showToast('Registro creado', 'success');
      setProveedorCreateOpen(false); setProveedorForm(emptyProveedorForm);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const ingresarMut = useMutation({
    mutationFn: ({ id, delta }: { id: number; delta: number }) => ajustarStockProveedor(id, delta),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stockProveedor'] });
      showToast('Mercadería ingresada', 'success');
      setIngresarOpen(false); setIngresarTarget(null); setIngresarDelta(1);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const transferMut = useMutation({
    mutationFn: transferirStock,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stockProveedor'] });
      qc.invalidateQueries({ queryKey: ['stock'] });
      qc.invalidateQueries({ queryKey: ['transferencias'] });
      showToast('Transferencia realizada', 'success');
      closeTransferModal();
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  // ── Stock sucursal mutations ───────────────────────────────
  const createStockMut = useMutation({
    mutationFn: createStock,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock'] });
      showToast('Registro creado', 'success');
      setStockModalOpen(false); setStockForm(emptyStockForm);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const mermaMut = useMutation({
    mutationFn: ({ id, delta }: { id: number; delta: number }) => ajustarStock(id, { delta }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock'] });
      showToast('Merma registrada', 'success');
      setMermaOpen(false); setMermaTarget(null); setMermaDelta(1);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const deleteStockMut = useMutation({
    mutationFn: deleteStock,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stock'] }); showToast('Registro eliminado', 'success'); setDeleteStockId(null); },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  // ── Solicitudes mutations ──────────────────────────────────
  const aprobarMut = useMutation({
    mutationFn: ({ id, notas }: { id: number; notas?: string }) => aprobarSolicitud(id, notas),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['solicitudes'] });
      qc.invalidateQueries({ queryKey: ['stockProveedor'] });
      qc.invalidateQueries({ queryKey: ['stock'] });
      qc.invalidateQueries({ queryKey: ['transferencias'] });
      showToast('Solicitud aprobada y stock transferido', 'success');
      setAprobarTarget(null); setRespuesta('');
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const rechazarMut = useMutation({
    mutationFn: ({ id, notas }: { id: number; notas?: string }) => rechazarSolicitud(id, notas),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['solicitudes'] });
      showToast('Solicitud rechazada', 'success');
      setRechazarTarget(null); setRespuesta('');
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  // ── Helpers ────────────────────────────────────────────────
  function openTransferModal(prov: StockProveedor) {
    setTransferProveedor(prov); setTransferIdStock(0); setTransferCantidad(1); setTransferNotas('');
    setTransferOpen(true);
  }

  function closeTransferModal() {
    setTransferOpen(false); setTransferProveedor(null); setTransferIdStock(0);
  }

  // ── Derived ────────────────────────────────────────────────
  const sucursalOptions = (sucursales ?? []).map((s) => ({ value: s.id_sucursal, label: s.nombre }));
  const insumoOptions   = (insumos ?? []).map((i) => ({ value: i.id_insumo, label: i.nombre }));
  const filteredStock   = (stock ?? []).filter((s) => !filterSucursal || String(s.id_sucursal) === filterSucursal);
  const displayedProv   = showBajoMinimo ? (stockProveedor ?? []).filter((p) => p.stock_bajo) : (stockProveedor ?? []);
  const filteredSolicitudes = (solicitudes ?? []).filter((s) => !filterEstado || s.estado === filterEstado);

  const transferDestOptions = transferProveedor
    ? (stock ?? [])
        .filter((s) => s.id_insumo === transferProveedor.id_insumo)
        .map((s) => ({ value: s.id_stock, label: s.nombre_sucursal ?? `Sucursal ${s.id_sucursal}` }))
    : [];

  // ── Column definitions ─────────────────────────────────────
  const insumoColumns: Column<Insumo>[] = [
    { key: 'nombre',       header: 'Nombre',      sortable: true, accessor: (r) => r.nombre, render: (r) => <span className="font-medium text-slate-900 dark:text-slate-100">{r.nombre}</span> },
    { key: 'descripcion',  header: 'Descripción', accessor: (r) => r.descripcion },
    { key: 'unidad_medida',header: 'Unidad',      sortable: true, accessor: (r) => r.unidad_medida },
    {
      key: 'acciones', header: '',
      render: (r) => (
        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => { setEditingInsumo(r); setInsumoForm({ nombre: r.nombre, descripcion: r.descripcion, unidad_medida: r.unidad_medida }); setInsumoModalOpen(true); }}>Editar</Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteInsumoId(r.id_insumo)}>Eliminar</Button>
        </div>
      ),
    },
  ];

  const proveedorColumns: Column<StockProveedor>[] = [
    { key: 'insumo',  header: 'Insumo',  sortable: true, accessor: (r) => r.nombre_insumo, render: (r) => <span className="font-medium text-slate-900 dark:text-slate-100">{r.nombre_insumo}</span> },
    { key: 'unidad',  header: 'Unidad',  accessor: (r) => r.unidad_medida, render: (r) => <span className="text-slate-400 dark:text-slate-500 text-sm">{r.unidad_medida}</span> },
    {
      key: 'cantidad', header: 'Disponible', sortable: true, accessor: (r) => r.cantidad,
      render: (r) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {r.cantidad} <span className="font-normal text-slate-400 dark:text-slate-500 text-xs">{r.unidad_medida}</span>
          {r.stock_bajo && <StockBajoBadge />}
        </span>
      ),
    },
    { key: 'minimo', header: 'Mínimo', accessor: (r) => r.cantidad_minima, render: (r) => <span className="text-slate-500 dark:text-slate-400">{r.cantidad_minima}</span> },
    {
      key: 'acciones', header: '',
      render: (r) => (
        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => { setIngresarTarget(r); setIngresarDelta(1); setIngresarOpen(true); }}>+ Ingresar</Button>
          <Button variant="secondary" size="sm" onClick={() => openTransferModal(r)}>Enviar a sucursal →</Button>
        </div>
      ),
    },
  ];

  const stockSucursalColumns: Column<Stock>[] = [
    { key: 'insumo',   header: 'Insumo',   sortable: true, accessor: (r) => r.nombre_insumo ?? '', render: (r) => <span className="font-medium text-slate-900 dark:text-slate-100">{r.nombre_insumo ?? '—'}</span> },
    { key: 'sucursal', header: 'Sucursal', sortable: true, accessor: (r) => r.nombre_sucursal ?? '', render: (r) => <span className="text-slate-500 dark:text-slate-400">{r.nombre_sucursal ?? '—'}</span> },
    {
      key: 'cantidad', header: 'Cantidad', sortable: true, accessor: (r) => r.cantidad,
      render: (r) => (
        <span className="font-medium">
          {r.cantidad} <span className="text-slate-400 text-xs">{r.unidad_medida}</span>
          {r.stock_bajo && <span className="ml-2"><StockBajoBadge /></span>}
        </span>
      ),
    },
    { key: 'minimo', header: 'Mínimo', accessor: (r) => r.cantidad_minima, render: (r) => <span className="text-slate-500 dark:text-slate-400">{r.cantidad_minima} {r.unidad_medida ?? ''}</span> },
    {
      key: 'acciones', header: '',
      render: (r) => (
        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => { setMermaTarget(r); setMermaDelta(1); setMermaOpen(true); }}>Registrar merma</Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteStockId(r.id_stock)}>Eliminar</Button>
        </div>
      ),
    },
  ];

  const estadoSolicitudColor = (e: string) =>
    e === 'pendiente' ? 'yellow' : e === 'aprobada' ? 'green' : 'red';

  const solicitudColumns: Column<Solicitud>[] = [
    { key: 'fecha',    header: 'Fecha',    sortable: true, accessor: (r) => r.created_at, render: (r) => <span className="text-sm text-slate-500 dark:text-slate-400">{formatDateTime(r.created_at)}</span> },
    { key: 'terapeuta',header: 'Terapeuta',accessor: (r) => r.nombre_terapeuta, render: (r) => <span className="font-medium text-slate-900 dark:text-slate-100">{r.nombre_terapeuta}</span> },
    { key: 'insumo',   header: 'Insumo',   sortable: true, accessor: (r) => r.nombre_insumo },
    { key: 'sucursal', header: 'Sucursal', accessor: (r) => r.nombre_sucursal, render: (r) => <span className="text-slate-500 dark:text-slate-400">{r.nombre_sucursal}</span> },
    {
      key: 'cantidad', header: 'Cantidad', accessor: (r) => r.cantidad,
      render: (r) => <span className="font-medium">{r.cantidad} <span className="text-slate-400 text-xs">{r.unidad_medida}</span></span>,
    },
    { key: 'notas',    header: 'Notas',    accessor: (r) => r.notas ?? '', render: (r) => <span className="text-slate-500 dark:text-slate-400 text-sm">{r.notas ?? '—'}</span> },
    { key: 'estado',   header: 'Estado',   render: (r) => <Badge label={r.estado} color={estadoSolicitudColor(r.estado)} /> },
    {
      key: 'acciones', header: '',
      render: (r) => r.estado === 'pendiente' ? (
        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => { setAprobarTarget(r); setRespuesta(''); }}>Aprobar</Button>
          <Button variant="danger" size="sm" onClick={() => { setRechazarTarget(r); setRespuesta(''); }}>Rechazar</Button>
        </div>
      ) : (
        <span className="text-xs text-slate-400 dark:text-slate-500">{r.notas_respuesta ?? ''}</span>
      ),
    },
  ];

  const transferenciaColumns: Column<Transferencia>[] = [
    { key: 'fecha',        header: 'Fecha',            sortable: true, accessor: (r) => r.fecha,            render: (r) => <span className="text-sm text-slate-500 dark:text-slate-400">{formatDateTime(r.fecha)}</span> },
    { key: 'insumo',       header: 'Insumo',           sortable: true, accessor: (r) => r.nombre_insumo,   render: (r) => <span className="font-medium text-slate-900 dark:text-slate-100">{r.nombre_insumo}</span> },
    {
      key: 'cantidad', header: 'Cantidad', sortable: true, accessor: (r) => r.cantidad,
      render: (r) => <span className="font-medium">{r.cantidad} <span className="text-slate-400 text-xs">{r.unidad_medida}</span></span>,
    },
    { key: 'sucursal',     header: 'Sucursal destino', sortable: true, accessor: (r) => r.nombre_sucursal },
    { key: 'realizado_por',header: 'Realizado por',    accessor: (r) => r.realizado_por },
    { key: 'notas',        header: 'Notas',            accessor: (r) => r.notas ?? '', render: (r) => <span className="text-slate-500 dark:text-slate-400 text-sm">{r.notas ?? '—'}</span> },
  ];

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Insumos & Stock</h1>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab}>

        {/* ── Catálogo ──────────────────────────────────────── */}
        <TabPanel id="catalogo" active={activeTab}>
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditingInsumo(null); setInsumoForm(emptyInsumo); setInsumoModalOpen(true); }}>
              + Nuevo insumo
            </Button>
          </div>
          {loadingI ? <PageSpinner /> : (
            <Table columns={insumoColumns} data={insumos ?? []} keyExtractor={(r) => r.id_insumo} emptyMessage="Sin insumos registrados" />
          )}
        </TabPanel>

        {/* ── Stock ─────────────────────────────────────────── */}
        <TabPanel id="stock" active={activeTab}>
          {/* Bodega central */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Bodega central</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Stock disponible para distribuir a sucursales</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={showBajoMinimo} onChange={(e) => setShowBajoMinimo(e.target.checked)} className="rounded" />
                  Solo bajo mínimo
                </label>
                <Button size="sm" variant="secondary" onClick={() => { setProveedorForm(emptyProveedorForm); setProveedorCreateOpen(true); }}>
                  + Crear registro
                </Button>
              </div>
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              {loadingP ? <PageSpinner /> : (
                <Table columns={proveedorColumns} data={displayedProv} keyExtractor={(r) => r.id_stock_proveedor} emptyMessage="Sin stock en bodega central" />
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 dark:border-slate-700 mb-8" />

          {/* Stock por sucursal */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Stock en sucursales</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Insumos disponibles en cada sucursal. Se incrementa con transferencias desde la bodega central.</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={filterSucursal}
                  onChange={(e) => setFilterSucursal(e.target.value)}
                  className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Todas las sucursales</option>
                  {sucursalOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <Button size="sm" variant="secondary" onClick={() => setStockModalOpen(true)}>+ Crear registro</Button>
              </div>
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              {loadingS ? <PageSpinner /> : (
                <Table columns={stockSucursalColumns} data={filteredStock} keyExtractor={(r) => r.id_stock} emptyMessage="Sin stock registrado en sucursales" />
              )}
            </div>
          </div>
        </TabPanel>

        {/* ── Solicitudes ───────────────────────────────────── */}
        <TabPanel id="solicitudes" active={activeTab}>
          <div className="flex items-center gap-3 mb-4">
            {(['', 'pendiente', 'aprobada', 'rechazada'] as const).map((e) => (
              <button
                key={e}
                onClick={() => setFilterEstado(e)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterEstado === e
                    ? 'bg-primary-800 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {e === '' ? 'Todas' : e.charAt(0).toUpperCase() + e.slice(1)}
              </button>
            ))}
          </div>
          {loadingSol ? <PageSpinner /> : (
            <Table
              columns={solicitudColumns}
              data={filteredSolicitudes}
              keyExtractor={(r) => r.id_solicitud}
              emptyMessage="Sin solicitudes"
            />
          )}
        </TabPanel>

        {/* ── Historial ─────────────────────────────────────── */}
        <TabPanel id="historial" active={activeTab}>
          <div className="flex flex-wrap gap-3 mb-4">
            <select
              value={transFilters.id_sucursal ?? ''}
              onChange={(e) => setTransFilters({ ...transFilters, id_sucursal: e.target.value ? Number(e.target.value) : undefined })}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas las sucursales</option>
              {sucursalOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              value={transFilters.id_insumo ?? ''}
              onChange={(e) => setTransFilters({ ...transFilters, id_insumo: e.target.value ? Number(e.target.value) : undefined })}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos los insumos</option>
              {insumoOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input type="date" value={transFilters.desde ?? ''} onChange={(e) => setTransFilters({ ...transFilters, desde: e.target.value || undefined })} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <input type="date" value={transFilters.hasta ?? ''} onChange={(e) => setTransFilters({ ...transFilters, hasta: e.target.value || undefined })} className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            {Object.values(transFilters).some(Boolean) && (
              <Button variant="ghost" size="sm" onClick={() => setTransFilters({})}>Limpiar</Button>
            )}
          </div>
          {loadingT ? <PageSpinner /> : (
            <Table columns={transferenciaColumns} data={transferencias ?? []} keyExtractor={(r) => r.id_transferencia} emptyMessage="Sin transferencias registradas" />
          )}
        </TabPanel>
      </Tabs>

      {/* ── Modals ──────────────────────────────────────────── */}

      {/* Catálogo */}
      <Modal open={insumoModalOpen} onClose={() => setInsumoModalOpen(false)} title={editingInsumo ? 'Editar insumo' : 'Nuevo insumo'} size="sm">
        <div className="space-y-4">
          <Input label="Nombre" required value={insumoForm.nombre} onChange={(e) => setInsumoForm({ ...insumoForm, nombre: e.target.value })} />
          <Input label="Descripción" value={insumoForm.descripcion} onChange={(e) => setInsumoForm({ ...insumoForm, descripcion: e.target.value })} />
          <Input label="Unidad de medida" required value={insumoForm.unidad_medida} onChange={(e) => setInsumoForm({ ...insumoForm, unidad_medida: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setInsumoModalOpen(false)}>Cancelar</Button>
          <Button onClick={() => insumoMut.mutate(insumoForm)} loading={insumoMut.isPending}>{editingInsumo ? 'Guardar' : 'Crear'}</Button>
        </div>
      </Modal>

      {/* Crear proveedor */}
      <Modal open={proveedorCreateOpen} onClose={() => setProveedorCreateOpen(false)} title="Crear registro en bodega central" size="sm">
        <div className="space-y-4">
          <Select label="Insumo" required options={insumoOptions} value={proveedorForm.id_insumo || ''} onChange={(e) => setProveedorForm({ ...proveedorForm, id_insumo: Number(e.target.value) })} placeholder="Seleccionar…" />
          <Input label="Cantidad inicial" type="number" min={0} value={proveedorForm.cantidad ?? 0} onChange={(e) => setProveedorForm({ ...proveedorForm, cantidad: Number(e.target.value) })} />
          <Input label="Cantidad mínima" type="number" min={0} value={proveedorForm.cantidad_minima ?? 0} onChange={(e) => setProveedorForm({ ...proveedorForm, cantidad_minima: Number(e.target.value) })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setProveedorCreateOpen(false)}>Cancelar</Button>
          <Button onClick={() => createProveedorMut.mutate(proveedorForm)} loading={createProveedorMut.isPending} disabled={!proveedorForm.id_insumo}>Crear</Button>
        </div>
      </Modal>

      {/* Ingresar mercadería */}
      <Modal open={ingresarOpen} onClose={() => setIngresarOpen(false)} title="Ingresar mercadería a bodega" size="sm">
        {ingresarTarget && (
          <>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-3 mb-4 text-sm">
              <p className="font-semibold text-slate-800 dark:text-slate-200">{ingresarTarget.nombre_insumo} <span className="font-normal text-slate-400">{ingresarTarget.unidad_medida}</span></p>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Stock actual: <strong>{ingresarTarget.cantidad}</strong></p>
            </div>
            <Input label="Cantidad a ingresar" type="number" min={1} value={ingresarDelta} onChange={(e) => setIngresarDelta(Math.max(1, Number(e.target.value)))} />
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setIngresarOpen(false)}>Cancelar</Button>
              <Button onClick={() => ingresarMut.mutate({ id: ingresarTarget.id_stock_proveedor, delta: ingresarDelta })} loading={ingresarMut.isPending}>Ingresar</Button>
            </div>
          </>
        )}
      </Modal>

      {/* Enviar a sucursal */}
      <Modal open={transferOpen} onClose={closeTransferModal} title="Enviar a sucursal" size="sm">
        {transferProveedor && (
          <>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-3 mb-4 text-sm">
              <p className="font-semibold text-slate-800 dark:text-slate-200">{transferProveedor.nombre_insumo} <span className="font-normal text-slate-400">{transferProveedor.unidad_medida}</span></p>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Disponible en bodega: <strong className={transferProveedor.cantidad === 0 ? 'text-red-600' : 'text-green-700 dark:text-green-400'}>{transferProveedor.cantidad}</strong>
              </p>
            </div>
            {transferDestOptions.length === 0 ? (
              <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-4 py-3 mb-4">
                No hay registros de stock para <strong>{transferProveedor.nombre_insumo}</strong> en ninguna sucursal. Crea uno en la sección <em>Stock en sucursales</em>.
              </p>
            ) : (
              <div className="space-y-4">
                <Select label="Sucursal destino" required options={transferDestOptions} value={transferIdStock || ''} onChange={(e) => setTransferIdStock(Number(e.target.value))} placeholder="Seleccionar sucursal…" />
                <Input label={`Cantidad (máx. ${transferProveedor.cantidad})`} type="number" min={1} max={transferProveedor.cantidad} value={transferCantidad} onChange={(e) => setTransferCantidad(Math.min(transferProveedor.cantidad, Math.max(1, Number(e.target.value))))} />
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas (opcional)</label>
                  <textarea value={transferNotas} onChange={(e) => setTransferNotas(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" placeholder="Motivo…" />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={closeTransferModal}>Cancelar</Button>
              {transferDestOptions.length > 0 && (
                <Button onClick={() => transferMut.mutate({ id_stock_proveedor: transferProveedor.id_stock_proveedor, id_stock: transferIdStock, cantidad: transferCantidad, notas: transferNotas || undefined })} loading={transferMut.isPending} disabled={!transferIdStock || transferCantidad <= 0 || transferCantidad > transferProveedor.cantidad}>
                  Enviar
                </Button>
              )}
            </div>
          </>
        )}
      </Modal>

      {/* Crear registro sucursal */}
      <Modal open={stockModalOpen} onClose={() => setStockModalOpen(false)} title="Crear registro de stock en sucursal" size="sm">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">La cantidad inicial será 0. Para cargar stock usa <strong>Enviar a sucursal</strong> desde la bodega central.</p>
        <div className="space-y-4">
          <Select label="Sucursal" required options={sucursalOptions} value={stockForm.id_sucursal || ''} onChange={(e) => setStockForm({ ...stockForm, id_sucursal: Number(e.target.value) })} placeholder="Seleccionar…" />
          <Select label="Insumo" required options={insumoOptions} value={stockForm.id_insumo || ''} onChange={(e) => setStockForm({ ...stockForm, id_insumo: Number(e.target.value) })} placeholder="Seleccionar…" />
          <Input label="Cantidad mínima" type="number" min={0} value={stockForm.cantidad_minima ?? 0} onChange={(e) => setStockForm({ ...stockForm, cantidad_minima: Number(e.target.value) })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setStockModalOpen(false)}>Cancelar</Button>
          <Button onClick={() => createStockMut.mutate(stockForm)} loading={createStockMut.isPending} disabled={!stockForm.id_sucursal || !stockForm.id_insumo}>Crear</Button>
        </div>
      </Modal>

      {/* Registrar merma */}
      <Modal open={mermaOpen} onClose={() => setMermaOpen(false)} title="Registrar merma" size="sm">
        {mermaTarget && (
          <>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-3 mb-4 text-sm">
              <p className="font-semibold text-slate-800 dark:text-slate-200">{mermaTarget.nombre_insumo} <span className="font-normal text-slate-400">{mermaTarget.unidad_medida}</span></p>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Sucursal: <strong>{mermaTarget.nombre_sucursal ?? '—'}</strong></p>
              <p className="text-slate-500 dark:text-slate-400">Stock actual: <strong>{mermaTarget.cantidad}</strong></p>
            </div>
            <Input
              label={`Cantidad a descontar (máx. ${mermaTarget.cantidad})`}
              type="number" min={1} max={mermaTarget.cantidad}
              value={mermaDelta}
              onChange={(e) => setMermaDelta(Math.min(mermaTarget.cantidad, Math.max(1, Number(e.target.value))))}
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setMermaOpen(false)}>Cancelar</Button>
              <Button variant="danger" onClick={() => mermaMut.mutate({ id: mermaTarget.id_stock, delta: -mermaDelta })} loading={mermaMut.isPending} disabled={mermaTarget.cantidad === 0}>
                Registrar merma
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Aprobar solicitud */}
      <Modal open={aprobarTarget !== null} onClose={() => setAprobarTarget(null)} title="Aprobar solicitud" size="sm">
        {aprobarTarget && (
          <>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-3 mb-4 text-sm space-y-1">
              <p><span className="text-slate-400">Terapeuta:</span> <strong className="text-slate-800 dark:text-slate-200">{aprobarTarget.nombre_terapeuta}</strong></p>
              <p><span className="text-slate-400">Insumo:</span> <strong className="text-slate-800 dark:text-slate-200">{aprobarTarget.nombre_insumo}</strong></p>
              <p><span className="text-slate-400">Sucursal:</span> <strong className="text-slate-800 dark:text-slate-200">{aprobarTarget.nombre_sucursal}</strong></p>
              <p><span className="text-slate-400">Cantidad:</span> <strong className="text-slate-800 dark:text-slate-200">{aprobarTarget.cantidad} {aprobarTarget.unidad_medida}</strong></p>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Al aprobar se transferirá automáticamente desde la bodega central a la sucursal.</p>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Respuesta (opcional)</label>
              <textarea value={respuesta} onChange={(e) => setRespuesta(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setAprobarTarget(null)}>Cancelar</Button>
              <Button onClick={() => aprobarMut.mutate({ id: aprobarTarget.id_solicitud, notas: respuesta || undefined })} loading={aprobarMut.isPending}>
                Aprobar y transferir
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Rechazar solicitud */}
      <Modal open={rechazarTarget !== null} onClose={() => setRechazarTarget(null)} title="Rechazar solicitud" size="sm">
        {rechazarTarget && (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              ¿Rechazar solicitud de <strong>{rechazarTarget.cantidad} {rechazarTarget.unidad_medida}</strong> de <strong>{rechazarTarget.nombre_insumo}</strong> para {rechazarTarget.nombre_sucursal}?
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motivo (opcional)</label>
              <textarea value={respuesta} onChange={(e) => setRespuesta(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setRechazarTarget(null)}>Cancelar</Button>
              <Button variant="danger" onClick={() => rechazarMut.mutate({ id: rechazarTarget.id_solicitud, notas: respuesta || undefined })} loading={rechazarMut.isPending}>
                Rechazar
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Confirm deletes */}
      <ConfirmDialog open={deleteInsumoId !== null} message="¿Eliminar este insumo?" onConfirm={() => deleteInsumoId !== null && deleteInsumoMut.mutate(deleteInsumoId)} onCancel={() => setDeleteInsumoId(null)} loading={deleteInsumoMut.isPending} />
      <ConfirmDialog open={deleteStockId !== null} message="¿Eliminar este registro de stock?" onConfirm={() => deleteStockId !== null && deleteStockMut.mutate(deleteStockId)} onCancel={() => setDeleteStockId(null)} loading={deleteStockMut.isPending} />
    </div>
  );
}
