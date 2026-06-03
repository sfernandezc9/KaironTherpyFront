import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInsumos, createInsumo, updateInsumo, deleteInsumo } from '../../api/insumos';
import {
  getStock, createStock, ajustarStock, deleteStock,
  getStockProveedor, createStockProveedor, ajustarStockProveedor,
  transferirStock, getTransferencias,
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
import type { Stock, StockForm, StockProveedor, StockProveedorForm, Transferencia, TransferenciaFilters } from '../../types/stock';

const TABS = [
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'stock-sucursal', label: 'Stock Sucursales' },
  { id: 'stock-proveedor', label: 'Stock Proveedor' },
  { id: 'transferencias', label: 'Transferencias' },
];

const emptyInsumo: InsumoForm = { nombre: '', descripcion: '', unidad_medida: '' };
const emptyStockForm: StockForm = { id_sucursal: 0, id_insumo: 0, cantidad_minima: 0 };
const emptyProveedorForm: StockProveedorForm = { id_insumo: 0, cantidad: 0, cantidad_minima: 0 };

export default function InsumosPage() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('catalogo');

  // Insumo state
  const [insumoModalOpen, setInsumoModalOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);
  const [insumoForm, setInsumoForm] = useState<InsumoForm>(emptyInsumo);
  const [deleteInsumoId, setDeleteInsumoId] = useState<number | null>(null);

  // Stock sucursal state
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockForm, setStockForm] = useState<StockForm>(emptyStockForm);
  const [deleteStockId, setDeleteStockId] = useState<number | null>(null);
  const [mermaValues, setMermaValues] = useState<Record<number, number>>({});
  const [filterSucursal, setFilterSucursal] = useState('');

  // Stock proveedor state
  const [proveedorCreateOpen, setProveedorCreateOpen] = useState(false);
  const [proveedorForm, setProveedorForm] = useState<StockProveedorForm>(emptyProveedorForm);
  const [ingresarOpen, setIngresarOpen] = useState(false);
  const [ingresarTarget, setIngresarTarget] = useState<StockProveedor | null>(null);
  const [ingresarDelta, setIngresarDelta] = useState(1);
  const [showBajoMinimo, setShowBajoMinimo] = useState(false);

  // Transfer modal state
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferProveedor, setTransferProveedor] = useState<StockProveedor | null>(null);
  const [transferIdStock, setTransferIdStock] = useState(0);
  const [transferCantidad, setTransferCantidad] = useState(1);
  const [transferNotas, setTransferNotas] = useState('');

  // Transferencias filters
  const [transFilters, setTransFilters] = useState<TransferenciaFilters>({});

  // Queries
  const { data: insumos, isLoading: loadingI } = useQuery({ queryKey: ['insumos'], queryFn: getInsumos });
  const { data: stock, isLoading: loadingS } = useQuery({ queryKey: ['stock'], queryFn: getStock });
  const { data: sucursales } = useQuery({ queryKey: ['sucursales'], queryFn: getSucursales });
  const { data: stockProveedor, isLoading: loadingP } = useQuery({ queryKey: ['stockProveedor'], queryFn: getStockProveedor });
  const { data: transferencias, isLoading: loadingT } = useQuery({
    queryKey: ['transferencias', transFilters],
    queryFn: () => getTransferencias(transFilters),
  });

  // Insumo mutations
  const insumoMut = useMutation({
    mutationFn: (form: InsumoForm) =>
      editingInsumo ? updateInsumo(editingInsumo.id_insumo, form) : createInsumo(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['insumos'] });
      showToast(editingInsumo ? 'Insumo actualizado' : 'Insumo creado', 'success');
      setInsumoModalOpen(false);
      setEditingInsumo(null);
      setInsumoForm(emptyInsumo);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const deleteInsumoMut = useMutation({
    mutationFn: deleteInsumo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['insumos'] });
      showToast('Insumo eliminado', 'success');
      setDeleteInsumoId(null);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  // Stock sucursal mutations
  const createStockMut = useMutation({
    mutationFn: createStock,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock'] });
      showToast('Registro de stock creado', 'success');
      setStockModalOpen(false);
      setStockForm(emptyStockForm);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const mermaMut = useMutation({
    mutationFn: ({ id, delta }: { id: number; delta: number }) => ajustarStock(id, { delta }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock'] });
      showToast('Merma registrada', 'success');
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const deleteStockMut = useMutation({
    mutationFn: deleteStock,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock'] });
      showToast('Registro eliminado', 'success');
      setDeleteStockId(null);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  // Stock proveedor mutations
  const createProveedorMut = useMutation({
    mutationFn: createStockProveedor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stockProveedor'] });
      showToast('Registro proveedor creado', 'success');
      setProveedorCreateOpen(false);
      setProveedorForm(emptyProveedorForm);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const ingresarMut = useMutation({
    mutationFn: ({ id, delta }: { id: number; delta: number }) => ajustarStockProveedor(id, delta),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stockProveedor'] });
      showToast('Mercadería ingresada', 'success');
      setIngresarOpen(false);
      setIngresarTarget(null);
      setIngresarDelta(1);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  // Transfer mutation
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

  function openTransferModal(prov: StockProveedor) {
    setTransferProveedor(prov);
    setTransferIdStock(0);
    setTransferCantidad(1);
    setTransferNotas('');
    setTransferOpen(true);
  }

  function closeTransferModal() {
    setTransferOpen(false);
    setTransferProveedor(null);
    setTransferIdStock(0);
    setTransferCantidad(1);
    setTransferNotas('');
  }

  function openIngresarModal(prov: StockProveedor) {
    setIngresarTarget(prov);
    setIngresarDelta(1);
    setIngresarOpen(true);
  }

  // Derived data
  const sucursalOptions = (sucursales ?? []).map((s) => ({ value: s.id_sucursal, label: s.nombre }));
  const insumoOptions = (insumos ?? []).map((i) => ({ value: i.id_insumo, label: i.nombre }));

  const filteredStock = (stock ?? []).filter(
    (s) => !filterSucursal || String(s.id_sucursal) === filterSucursal
  );

  const displayedProveedor = showBajoMinimo
    ? (stockProveedor ?? []).filter((p) => p.stock_bajo)
    : (stockProveedor ?? []);

  // Stock sucursal entries that match the proveedor insumo (for transfer destination)
  const transferDestOptions = transferProveedor
    ? (stock ?? [])
        .filter((s) => s.id_insumo === transferProveedor.id_insumo)
        .map((s) => ({ value: s.id_stock, label: s.nombre_sucursal ?? `Sucursal ${s.id_sucursal}` }))
    : [];

  // Column definitions
  const insumoColumns: Column<Insumo>[] = [
    { key: 'nombre', header: 'Nombre', sortable: true, accessor: (r) => r.nombre },
    { key: 'descripcion', header: 'Descripción', accessor: (r) => r.descripcion },
    { key: 'unidad_medida', header: 'Unidad', sortable: true, accessor: (r) => r.unidad_medida },
    {
      key: 'acciones', header: '',
      render: (r) => (
        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => {
            setEditingInsumo(r);
            setInsumoForm({ nombre: r.nombre, descripcion: r.descripcion, unidad_medida: r.unidad_medida });
            setInsumoModalOpen(true);
          }}>Editar</Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteInsumoId(r.id_insumo)}>Eliminar</Button>
        </div>
      ),
    },
  ];

  const stockSucursalColumns: Column<Stock>[] = [
    { key: 'insumo', header: 'Insumo', sortable: true, accessor: (r) => r.nombre_insumo ?? '', render: (r) => r.nombre_insumo ?? '—' },
    { key: 'sucursal', header: 'Sucursal', sortable: true, accessor: (r) => r.nombre_sucursal ?? '', render: (r) => <span className="text-slate-500 dark:text-slate-400">{r.nombre_sucursal ?? '—'}</span> },
    {
      key: 'cantidad', header: 'Cantidad', sortable: true, accessor: (r) => r.cantidad,
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{r.cantidad}</span>
          <span className="text-slate-400 text-xs">{r.unidad_medida}</span>
          {r.stock_bajo && <StockBajoBadge />}
        </div>
      ),
    },
    { key: 'minimo', header: 'Mínimo', sortable: true, accessor: (r) => r.cantidad_minima, render: (r) => `${r.cantidad_minima} ${r.unidad_medida ?? ''}` },
    {
      key: 'merma', header: 'Merma',
      render: (r) => {
        const merma = mermaValues[r.id_stock] ?? 1;
        const excede = merma > r.cantidad;
        return (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs text-slate-400 mr-1">−</span>
            <input
              type="number"
              min={1}
              max={r.cantidad}
              value={merma}
              onChange={(e) => setMermaValues({ ...mermaValues, [r.id_stock]: Math.max(1, Number(e.target.value)) })}
              className={`w-14 border rounded px-2 py-1 text-sm text-center bg-white dark:bg-slate-800 dark:text-slate-100 ${excede ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20' : 'border-slate-300 dark:border-slate-600'}`}
            />
            <Button
              variant="danger"
              size="sm"
              disabled={excede || r.cantidad === 0}
              onClick={() => mermaMut.mutate({ id: r.id_stock, delta: -merma })}
            >
              Aplicar
            </Button>
          </div>
        );
      },
    },
    {
      key: 'acciones', header: '',
      render: (r) => (
        <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteStockId(r.id_stock); }}>
          Eliminar
        </Button>
      ),
    },
  ];

  const stockProveedorColumns: Column<StockProveedor>[] = [
    { key: 'insumo', header: 'Insumo', sortable: true, accessor: (r) => r.nombre_insumo },
    { key: 'unidad', header: 'Unidad', accessor: (r) => r.unidad_medida },
    {
      key: 'cantidad', header: 'Cantidad disponible', sortable: true, accessor: (r) => r.cantidad,
      render: (r) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100">{r.cantidad} <span className="font-normal text-slate-400 dark:text-slate-500 text-xs">{r.unidad_medida}</span></span>
      ),
    },
    { key: 'minimo', header: 'Stock mínimo', sortable: true, accessor: (r) => r.cantidad_minima, render: (r) => r.cantidad_minima },
    {
      key: 'estado', header: 'Estado',
      render: (r) => r.stock_bajo
        ? <Badge label="Stock bajo" color="red" />
        : <Badge label="OK" color="green" />,
    },
    {
      key: 'acciones', header: '',
      render: (r) => (
        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => openIngresarModal(r)}>Ingresar</Button>
          <Button variant="secondary" size="sm" onClick={() => openTransferModal(r)}>Transferir</Button>
        </div>
      ),
    },
  ];

  const transferenciaColumns: Column<Transferencia>[] = [
    { key: 'fecha', header: 'Fecha', sortable: true, accessor: (r) => r.fecha, render: (r) => formatDateTime(r.fecha) },
    { key: 'insumo', header: 'Insumo', sortable: true, accessor: (r) => r.nombre_insumo },
    { key: 'unidad', header: 'Unidad', accessor: (r) => r.unidad_medida },
    {
      key: 'cantidad', header: 'Cantidad', sortable: true, accessor: (r) => r.cantidad,
      render: (r) => <span className="font-medium dark:text-slate-100">{r.cantidad} <span className="text-slate-400 dark:text-slate-500 text-xs">{r.unidad_medida}</span></span>,
    },
    { key: 'sucursal', header: 'Sucursal destino', sortable: true, accessor: (r) => r.nombre_sucursal },
    { key: 'realizado_por', header: 'Realizado por', accessor: (r) => r.realizado_por },
    { key: 'notas', header: 'Notas', accessor: (r) => r.notas ?? '', render: (r) => <span className="text-slate-500 dark:text-slate-400 text-sm">{r.notas ?? '—'}</span> },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Insumos & Stock</h1>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab}>

        {/* ── Catálogo ── */}
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

        {/* ── Stock Sucursales ── */}
        <TabPanel id="stock-sucursal" active={activeTab}>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <select
              value={filterSucursal}
              onChange={(e) => setFilterSucursal(e.target.value)}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas las sucursales</option>
              {sucursalOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <Button onClick={() => setStockModalOpen(true)}>+ Crear registro sucursal</Button>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
            Para aumentar stock de una sucursal, use <strong>Transferir</strong> desde el stock proveedor. Solo se permite registrar mermas aquí.
          </p>
          {loadingS ? <PageSpinner /> : (
            <Table columns={stockSucursalColumns} data={filteredStock} keyExtractor={(r) => r.id_stock} emptyMessage="Sin stock registrado" />
          )}
        </TabPanel>

        {/* ── Stock Proveedor ── */}
        <TabPanel id="stock-proveedor" active={activeTab}>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showBajoMinimo}
                onChange={(e) => setShowBajoMinimo(e.target.checked)}
                className="rounded"
              />
              Solo stock bajo mínimo
            </label>
            <Button onClick={() => { setProveedorForm(emptyProveedorForm); setProveedorCreateOpen(true); }}>
              + Crear registro proveedor
            </Button>
          </div>
          {loadingP ? <PageSpinner /> : (
            <Table columns={stockProveedorColumns} data={displayedProveedor} keyExtractor={(r) => r.id_stock_proveedor} emptyMessage="Sin stock proveedor registrado" />
          )}
        </TabPanel>

        {/* ── Transferencias ── */}
        <TabPanel id="transferencias" active={activeTab}>
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
            <input
              type="date"
              value={transFilters.desde ?? ''}
              onChange={(e) => setTransFilters({ ...transFilters, desde: e.target.value || undefined })}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="date"
              value={transFilters.hasta ?? ''}
              onChange={(e) => setTransFilters({ ...transFilters, hasta: e.target.value || undefined })}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {Object.values(transFilters).some(Boolean) && (
              <Button variant="ghost" size="sm" onClick={() => setTransFilters({})}>Limpiar filtros</Button>
            )}
          </div>
          {loadingT ? <PageSpinner /> : (
            <Table columns={transferenciaColumns} data={transferencias ?? []} keyExtractor={(r) => r.id_transferencia} emptyMessage="Sin transferencias registradas" />
          )}
        </TabPanel>
      </Tabs>

      {/* ── Modal: Nuevo/Editar Insumo ── */}
      <Modal open={insumoModalOpen} onClose={() => setInsumoModalOpen(false)} title={editingInsumo ? 'Editar insumo' : 'Nuevo insumo'} size="sm">
        <div className="space-y-4">
          <Input label="Nombre" required value={insumoForm.nombre} onChange={(e) => setInsumoForm({ ...insumoForm, nombre: e.target.value })} />
          <Input label="Descripción" value={insumoForm.descripcion} onChange={(e) => setInsumoForm({ ...insumoForm, descripcion: e.target.value })} />
          <Input label="Unidad de medida" required value={insumoForm.unidad_medida} onChange={(e) => setInsumoForm({ ...insumoForm, unidad_medida: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setInsumoModalOpen(false)}>Cancelar</Button>
          <Button onClick={() => insumoMut.mutate(insumoForm)} loading={insumoMut.isPending}>
            {editingInsumo ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </Modal>

      {/* ── Modal: Crear registro stock sucursal ── */}
      <Modal open={stockModalOpen} onClose={() => setStockModalOpen(false)} title="Crear registro de stock sucursal" size="sm">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Crea el registro de stock para una sucursal. La cantidad inicial será 0; para cargar stock use <strong>Transferir</strong> desde el proveedor.
        </p>
        <div className="space-y-4">
          <Select label="Sucursal" required options={sucursalOptions} value={stockForm.id_sucursal || ''} onChange={(e) => setStockForm({ ...stockForm, id_sucursal: Number(e.target.value) })} placeholder="Seleccionar…" />
          <Select label="Insumo" required options={insumoOptions} value={stockForm.id_insumo || ''} onChange={(e) => setStockForm({ ...stockForm, id_insumo: Number(e.target.value) })} placeholder="Seleccionar…" />
          <Input label="Cantidad mínima" type="number" min={0} value={stockForm.cantidad_minima ?? 0} onChange={(e) => setStockForm({ ...stockForm, cantidad_minima: Number(e.target.value) })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setStockModalOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => createStockMut.mutate(stockForm)}
            loading={createStockMut.isPending}
            disabled={!stockForm.id_sucursal || !stockForm.id_insumo}
          >
            Crear
          </Button>
        </div>
      </Modal>

      {/* ── Modal: Crear registro stock proveedor ── */}
      <Modal open={proveedorCreateOpen} onClose={() => setProveedorCreateOpen(false)} title="Crear registro proveedor" size="sm">
        <div className="space-y-4">
          <Select label="Insumo" required options={insumoOptions} value={proveedorForm.id_insumo || ''} onChange={(e) => setProveedorForm({ ...proveedorForm, id_insumo: Number(e.target.value) })} placeholder="Seleccionar…" />
          <Input label="Cantidad inicial" type="number" min={0} value={proveedorForm.cantidad ?? 0} onChange={(e) => setProveedorForm({ ...proveedorForm, cantidad: Number(e.target.value) })} />
          <Input label="Cantidad mínima" type="number" min={0} value={proveedorForm.cantidad_minima ?? 0} onChange={(e) => setProveedorForm({ ...proveedorForm, cantidad_minima: Number(e.target.value) })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setProveedorCreateOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => createProveedorMut.mutate(proveedorForm)}
            loading={createProveedorMut.isPending}
            disabled={!proveedorForm.id_insumo}
          >
            Crear
          </Button>
        </div>
      </Modal>

      {/* ── Modal: Ingresar mercadería ── */}
      <Modal open={ingresarOpen} onClose={() => setIngresarOpen(false)} title="Ingresar mercadería" size="sm">
        {ingresarTarget && (
          <>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-3 mb-4 text-sm">
              <span className="font-medium dark:text-slate-100">{ingresarTarget.nombre_insumo}</span>
              <span className="text-slate-400 dark:text-slate-500 ml-2">{ingresarTarget.unidad_medida}</span>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Stock actual: <strong>{ingresarTarget.cantidad}</strong></p>
            </div>
            <Input
              label="Cantidad a ingresar"
              type="number"
              min={1}
              value={ingresarDelta}
              onChange={(e) => setIngresarDelta(Math.max(1, Number(e.target.value)))}
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setIngresarOpen(false)}>Cancelar</Button>
              <Button
                onClick={() => ingresarMut.mutate({ id: ingresarTarget.id_stock_proveedor, delta: ingresarDelta })}
                loading={ingresarMut.isPending}
              >
                Ingresar
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* ── Modal: Transferir a sucursal ── */}
      <Modal open={transferOpen} onClose={closeTransferModal} title="Transferir a sucursal" size="sm">
        {transferProveedor && (
          <>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-4 py-3 mb-4 text-sm">
              <span className="font-medium dark:text-slate-100">{transferProveedor.nombre_insumo}</span>
              <span className="text-slate-400 dark:text-slate-500 ml-2">{transferProveedor.unidad_medida}</span>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Disponible en proveedor: <strong className={transferProveedor.cantidad === 0 ? 'text-red-600' : 'text-green-700'}>{transferProveedor.cantidad}</strong>
              </p>
            </div>

            {transferDestOptions.length === 0 ? (
              <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-4 py-3 mb-4">
                No hay registros de stock sucursal para <strong>{transferProveedor.nombre_insumo}</strong>. Crea uno primero en la pestaña <em>Stock Sucursales</em>.
              </p>
            ) : (
              <div className="space-y-4">
                <Select
                  label="Sucursal destino"
                  required
                  options={transferDestOptions}
                  value={transferIdStock || ''}
                  onChange={(e) => setTransferIdStock(Number(e.target.value))}
                  placeholder="Seleccionar sucursal…"
                />
                <Input
                  label={`Cantidad (máx. ${transferProveedor.cantidad})`}
                  type="number"
                  min={1}
                  max={transferProveedor.cantidad}
                  value={transferCantidad}
                  onChange={(e) => setTransferCantidad(Math.min(transferProveedor.cantidad, Math.max(1, Number(e.target.value))))}
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas (opcional)</label>
                  <textarea
                    value={transferNotas}
                    onChange={(e) => setTransferNotas(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="Motivo de la transferencia…"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={closeTransferModal}>Cancelar</Button>
              {transferDestOptions.length > 0 && (
                <Button
                  onClick={() => transferMut.mutate({
                    id_stock_proveedor: transferProveedor.id_stock_proveedor,
                    id_stock: transferIdStock,
                    cantidad: transferCantidad,
                    notas: transferNotas || undefined,
                  })}
                  loading={transferMut.isPending}
                  disabled={!transferIdStock || transferCantidad <= 0 || transferCantidad > transferProveedor.cantidad}
                >
                  Transferir
                </Button>
              )}
            </div>
          </>
        )}
      </Modal>

      {/* ── Confirm dialogs ── */}
      <ConfirmDialog
        open={deleteInsumoId !== null}
        message="¿Eliminar este insumo?"
        onConfirm={() => deleteInsumoId !== null && deleteInsumoMut.mutate(deleteInsumoId)}
        onCancel={() => setDeleteInsumoId(null)}
        loading={deleteInsumoMut.isPending}
      />
      <ConfirmDialog
        open={deleteStockId !== null}
        message="¿Eliminar este registro de stock sucursal?"
        onConfirm={() => deleteStockId !== null && deleteStockMut.mutate(deleteStockId)}
        onCancel={() => setDeleteStockId(null)}
        loading={deleteStockMut.isPending}
      />
    </div>
  );
}
