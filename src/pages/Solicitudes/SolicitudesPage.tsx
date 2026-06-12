import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { getSolicitudes, createSolicitud } from '../../api/stock';
import { getStockSucursalSolicitud } from '../../api/sesiones';
import Table, { type Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../utils/format';
import type { Stock } from '../../types/stock';
import type { Solicitud } from '../../types/stock';

const estadoColor = (e: string) =>
  e === 'pendiente' ? 'yellow' : e === 'aprobada' ? 'green' : 'red';

export default function SolicitudesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const qc = useQueryClient();

  const sucursales = user?.sucursales ?? [];

  const [selectedSucursal, setSelectedSucursal] = useState<number>(
    sucursales.length === 1 ? sucursales[0].id_sucursal : 0
  );
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState('');

  const { data: stockItems, isLoading: loadingStock } = useQuery({
    queryKey: ['stockSucursal', selectedSucursal],
    queryFn: () => getStockSucursalSolicitud(selectedSucursal),
    enabled: selectedSucursal > 0,
  });

  const { data: solicitudes, isLoading: loadingSol } = useQuery({
    queryKey: ['solicitudes'],
    queryFn: getSolicitudes,
  });

  const createMut = useMutation({
    mutationFn: () => createSolicitud({ id_stock: selectedStock!.id_stock, cantidad, notas: notas || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['solicitudes'] });
      showToast('Solicitud enviada', 'success');
      setSelectedStock(null);
      setCantidad(1);
      setNotas('');
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const solicitudColumns: Column<Solicitud>[] = [
    { key: 'fecha',    header: 'Fecha',    sortable: true, accessor: (r) => r.created_at, render: (r) => <span className="text-sm text-slate-500 dark:text-slate-400">{formatDateTime(r.created_at)}</span> },
    { key: 'insumo',   header: 'Insumo',   sortable: true, accessor: (r) => r.nombre_insumo, render: (r) => <span className="font-medium text-slate-900 dark:text-slate-100">{r.nombre_insumo}</span> },
    { key: 'sucursal', header: 'Sucursal', accessor: (r) => r.nombre_sucursal, render: (r) => <span className="text-slate-500 dark:text-slate-400">{r.nombre_sucursal}</span> },
    {
      key: 'cantidad', header: 'Cantidad', accessor: (r) => r.cantidad,
      render: (r) => <span className="font-medium">{r.cantidad} <span className="text-slate-400 text-xs">{r.unidad_medida}</span></span>,
    },
    { key: 'notas',    header: 'Notas',    accessor: (r) => r.notas ?? '', render: (r) => <span className="text-slate-500 dark:text-slate-400 text-sm">{r.notas ?? '—'}</span> },
    { key: 'estado',   header: 'Estado',   render: (r) => <Badge label={r.estado} color={estadoColor(r.estado)} /> },
    { key: 'respuesta',header: 'Respuesta',accessor: (r) => r.notas_respuesta ?? '', render: (r) => <span className="text-slate-500 dark:text-slate-400 text-sm">{r.notas_respuesta ?? '—'}</span> },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Solicitar insumos</h1>

      {sucursales.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">No tienes sucursales asignadas actualmente.</p>
      ) : (
        <>
          {/* Nueva solicitud */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-8">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">Nueva solicitud</h2>

            {/* Sucursal selector */}
            {sucursales.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sucursal</label>
                <div className="flex flex-wrap gap-2">
                  {sucursales.map((s) => (
                    <button
                      key={s.id_sucursal}
                      onClick={() => { setSelectedSucursal(s.id_sucursal); setSelectedStock(null); }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedSucursal === s.id_sucursal
                          ? 'bg-primary-800 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {s.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedSucursal === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">Selecciona una sucursal para ver el stock disponible.</p>
            ) : loadingStock ? (
              <PageSpinner />
            ) : !stockItems?.length ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">Sin insumos registrados en esta sucursal.</p>
            ) : (
              <>
                {/* Insumo selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Insumo</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {stockItems.map((item) => (
                      <button
                        key={item.id_stock}
                        onClick={() => { setSelectedStock(item); setCantidad(1); }}
                        className={`flex flex-col items-start px-3 py-2.5 rounded-lg border text-left transition-colors ${
                          selectedStock?.id_stock === item.id_stock
                            ? 'border-primary-800 bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <span className="font-medium text-sm">{item.nombre_insumo}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          Disponible: {item.cantidad} {item.unidad_medida}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cantidad + notas */}
                {selectedStock && (
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <Input
                      label={`Cantidad solicitada`}
                      type="number" min={1}
                      value={cantidad}
                      onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
                    />
                    <Input
                      label="Notas (opcional)"
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      placeholder="Motivo de la solicitud…"
                    />
                    <div className="col-span-2 flex justify-end">
                      <Button
                        onClick={() => createMut.mutate()}
                        loading={createMut.isPending}
                        disabled={!selectedStock || cantidad <= 0}
                      >
                        Enviar solicitud
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mis solicitudes */}
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-3">Mis solicitudes</h2>
            {loadingSol ? <PageSpinner /> : (
              <Table
                columns={solicitudColumns}
                data={solicitudes ?? []}
                keyExtractor={(r) => r.id_solicitud}
                emptyMessage="Sin solicitudes enviadas"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
