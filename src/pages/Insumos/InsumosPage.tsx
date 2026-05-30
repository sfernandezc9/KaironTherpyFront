import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInsumos, createInsumo, updateInsumo, deleteInsumo } from '../../api/insumos';
import { getStock, createStock, ajustarStock, deleteStock } from '../../api/stock';
import { getSucursales } from '../../api/sucursales';
import { Tabs, TabPanel } from '../../components/ui/Tabs';
import Table, { type Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { StockBajoBadge } from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import type { Insumo, InsumoForm } from '../../types/insumo';
import type { Stock, StockForm } from '../../types/stock';

const TABS = [
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'stock', label: 'Stock' },
];

const emptyInsumo: InsumoForm = { nombre: '', descripcion: '', unidad_medida: '' };
const emptyStock: StockForm = { id_sucursal: 0, id_insumo: 0, cantidad: 0, cantidad_minima: 0 };

export default function InsumosPage() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('catalogo');

  // Insumo state
  const [insumoModalOpen, setInsumoModalOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);
  const [insumoForm, setInsumoForm] = useState<InsumoForm>(emptyInsumo);
  const [deleteInsumoId, setDeleteInsumoId] = useState<number | null>(null);

  // Stock state
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockForm, setStockForm] = useState<StockForm>(emptyStock);
  const [deleteStockId, setDeleteStockId] = useState<number | null>(null);
  const [adjustValues, setAdjustValues] = useState<Record<number, number>>({});
  const [filterSucursal, setFilterSucursal] = useState('');

  const { data: insumos, isLoading: loadingI } = useQuery({ queryKey: ['insumos'], queryFn: getInsumos });
  const { data: stock, isLoading: loadingS } = useQuery({ queryKey: ['stock'], queryFn: getStock });
  const { data: sucursales } = useQuery({ queryKey: ['sucursales'], queryFn: getSucursales });

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
    mutationFn: (id: number) => deleteInsumo(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['insumos'] });
      showToast('Insumo eliminado', 'success');
      setDeleteInsumoId(null);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const createStockMut = useMutation({
    mutationFn: createStock,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock'] });
      showToast('Stock creado', 'success');
      setStockModalOpen(false);
      setStockForm(emptyStock);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const ajustarMut = useMutation({
    mutationFn: ({ id, delta }: { id: number; delta: number }) => ajustarStock(id, { delta }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock'] });
      showToast('Stock ajustado', 'success');
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const deleteStockMut = useMutation({
    mutationFn: (id: number) => deleteStock(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock'] });
      showToast('Stock eliminado', 'success');
      setDeleteStockId(null);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const insumoColumns: Column<Insumo>[] = [
    { key: 'nombre', header: 'Nombre', sortable: true, accessor: (r) => r.nombre },
    { key: 'descripcion', header: 'Descripción', accessor: (r) => r.descripcion },
    { key: 'unidad_medida', header: 'Unidad', sortable: true, accessor: (r) => r.unidad_medida },
    {
      key: 'acciones', header: '',
      render: (r) => (
        <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost" size="sm"
            onClick={() => { setEditingInsumo(r); setInsumoForm({ nombre: r.nombre, descripcion: r.descripcion, unidad_medida: r.unidad_medida }); setInsumoModalOpen(true); }}
          >
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteInsumoId(r.id_insumo)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  const filteredStock = (stock ?? []).filter((s) =>
    !filterSucursal || String(s.id_sucursal) === filterSucursal
  );

  const stockColumns: Column<Stock>[] = [
    { key: 'insumo', header: 'Insumo', sortable: true, accessor: (r) => r.nombre_insumo ?? '', render: (r) => r.nombre_insumo ?? '—' },
    { key: 'sucursal', header: 'Sucursal', sortable: true, accessor: (r) => r.nombre_sucursal ?? '', render: (r) => <span className="text-slate-500">{r.nombre_sucursal ?? '—'}</span> },
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
      key: 'ajuste', header: 'Ajustar',
      render: (r) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => ajustarMut.mutate({ id: r.id_stock, delta: -(adjustValues[r.id_stock] ?? 1) })}
            className="w-7 h-7 flex items-center justify-center rounded border border-slate-300 hover:bg-red-50 text-red-600 font-bold"
          >−</button>
          <input
            type="number"
            min={1}
            value={adjustValues[r.id_stock] ?? 1}
            onChange={(e) => setAdjustValues({ ...adjustValues, [r.id_stock]: Number(e.target.value) })}
            className="w-14 border border-slate-300 rounded px-2 py-1 text-sm text-center"
          />
          <button
            onClick={() => ajustarMut.mutate({ id: r.id_stock, delta: adjustValues[r.id_stock] ?? 1 })}
            className="w-7 h-7 flex items-center justify-center rounded border border-slate-300 hover:bg-green-50 text-green-600 font-bold"
          >+</button>
        </div>
      ),
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

  const sucursalOptions = (sucursales ?? []).map((s) => ({ value: s.id_sucursal, label: s.nombre }));
  const insumoOptions = (insumos ?? []).map((i) => ({ value: i.id_insumo, label: i.nombre }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Insumos & Stock</h1>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab}>
        <TabPanel id="catalogo" active={activeTab}>
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditingInsumo(null); setInsumoForm(emptyInsumo); setInsumoModalOpen(true); }}>
              + Nuevo insumo
            </Button>
          </div>
          {loadingI ? <PageSpinner /> : (
            <Table
              columns={insumoColumns}
              data={insumos ?? []}
              keyExtractor={(r) => r.id_insumo}
              emptyMessage="Sin insumos registrados"
            />
          )}
        </TabPanel>

        <TabPanel id="stock" active={activeTab}>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <select
              value={filterSucursal}
              onChange={(e) => setFilterSucursal(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas las sucursales</option>
              {sucursalOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <Button onClick={() => setStockModalOpen(true)}>+ Agregar stock</Button>
          </div>
          {loadingS ? <PageSpinner /> : (
            <Table
              columns={stockColumns}
              data={filteredStock}
              keyExtractor={(r) => r.id_stock}
              emptyMessage="Sin stock registrado"
            />
          )}
        </TabPanel>
      </Tabs>

      {/* Insumo modal */}
      <Modal
        open={insumoModalOpen}
        onClose={() => setInsumoModalOpen(false)}
        title={editingInsumo ? 'Editar insumo' : 'Nuevo insumo'}
        size="sm"
      >
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

      {/* Stock create modal */}
      <Modal open={stockModalOpen} onClose={() => setStockModalOpen(false)} title="Agregar stock" size="sm">
        <div className="space-y-4">
          <Select label="Sucursal" required options={sucursalOptions} value={stockForm.id_sucursal || ''} onChange={(e) => setStockForm({ ...stockForm, id_sucursal: Number(e.target.value) })} placeholder="Seleccionar…" />
          <Select label="Insumo" required options={insumoOptions} value={stockForm.id_insumo || ''} onChange={(e) => setStockForm({ ...stockForm, id_insumo: Number(e.target.value) })} placeholder="Seleccionar…" />
          <Input label="Cantidad" type="number" value={stockForm.cantidad} onChange={(e) => setStockForm({ ...stockForm, cantidad: Number(e.target.value) })} />
          <Input label="Cantidad mínima" type="number" value={stockForm.cantidad_minima} onChange={(e) => setStockForm({ ...stockForm, cantidad_minima: Number(e.target.value) })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setStockModalOpen(false)}>Cancelar</Button>
          <Button onClick={() => createStockMut.mutate(stockForm)} loading={createStockMut.isPending}>Crear</Button>
        </div>
      </Modal>

      <ConfirmDialog open={deleteInsumoId !== null} message="¿Eliminar este insumo?" onConfirm={() => deleteInsumoId !== null && deleteInsumoMut.mutate(deleteInsumoId)} onCancel={() => setDeleteInsumoId(null)} loading={deleteInsumoMut.isPending} />
      <ConfirmDialog open={deleteStockId !== null} message="¿Eliminar este registro de stock?" onConfirm={() => deleteStockId !== null && deleteStockMut.mutate(deleteStockId)} onCancel={() => setDeleteStockId(null)} loading={deleteStockMut.isPending} />
    </div>
  );
}
