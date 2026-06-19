import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEmpresas, getEmpresaSucursales } from '../../api/empresas';
import { getSucursales } from '../../api/sucursales';
import { getTerapeutas, getTerapeutaInforme } from '../../api/terapeutas';
import Table, { type Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { Tabs, TabPanel } from '../../components/ui/Tabs';
import { PageSpinner } from '../../components/ui/Spinner';
import { exportToExcel, type ExcelColumn } from '../../utils/excel';
import type { Sucursal } from '../../types/sucursal';

// Row for the "General" report: one row per sucursal, joined to its empresa.
interface GeneralRow {
  id_empresa: number;
  empresa: string;
  rut_empresa: string;
  id_sucursal: number | null;
  sucursal: string;
  direccion: string;
  activa: boolean | null;
}

export default function InformesPage() {
  const [tab, setTab] = useState('general');
  const [empresaId, setEmpresaId] = useState<number | ''>('');
  const [terapeutaId, setTerapeutaId] = useState<number | ''>('');

  const { data: empresas, isLoading: loadingEmpresas } = useQuery({
    queryKey: ['empresas'],
    queryFn: getEmpresas,
  });
  const { data: sucursales, isLoading: loadingSucursales } = useQuery({
    queryKey: ['sucursales'],
    queryFn: getSucursales,
  });

  // ---- General report: all empresas with their sucursales ----
  const generalRows = useMemo<GeneralRow[]>(() => {
    if (!empresas) return [];
    const byEmpresa = new Map<number, Sucursal[]>();
    (sucursales ?? []).forEach((s) => {
      const list = byEmpresa.get(s.id_empresa) ?? [];
      list.push(s);
      byEmpresa.set(s.id_empresa, list);
    });
    const rows: GeneralRow[] = [];
    empresas.forEach((e) => {
      const sucs = byEmpresa.get(e.id_empresa) ?? [];
      if (sucs.length === 0) {
        rows.push({
          id_empresa: e.id_empresa, empresa: e.nombre, rut_empresa: e.rut,
          id_sucursal: null, sucursal: '—', direccion: '—', activa: null,
        });
      } else {
        sucs.forEach((s) => rows.push({
          id_empresa: e.id_empresa, empresa: e.nombre, rut_empresa: e.rut,
          id_sucursal: s.id_sucursal, sucursal: s.nombre, direccion: s.direccion, activa: s.activa,
        }));
      }
    });
    return rows;
  }, [empresas, sucursales]);

  const generalColumns: Column<GeneralRow>[] = [
    { key: 'empresa', header: 'Empresa', sortable: true, accessor: (r) => r.empresa, render: (r) => <span className="font-medium text-slate-900 dark:text-slate-100">{r.empresa}</span> },
    { key: 'rut_empresa', header: 'RUT empresa', accessor: (r) => r.rut_empresa },
    { key: 'sucursal', header: 'Sucursal', sortable: true, accessor: (r) => r.sucursal },
    { key: 'direccion', header: 'Dirección', accessor: (r) => r.direccion },
    {
      key: 'activa', header: 'Estado',
      render: (r) => r.activa === null ? <span className="text-slate-400">—</span>
        : <Badge color={r.activa ? 'green' : 'red'} label={r.activa ? 'Activa' : 'Inactiva'} />,
    },
  ];

  const exportGeneral = () => {
    const cols: ExcelColumn<GeneralRow>[] = [
      { header: 'Empresa', accessor: (r) => r.empresa },
      { header: 'RUT empresa', accessor: (r) => r.rut_empresa },
      { header: 'Sucursal', accessor: (r) => r.sucursal },
      { header: 'Dirección', accessor: (r) => r.direccion },
      { header: 'Estado', accessor: (r) => r.activa === null ? '—' : r.activa ? 'Activa' : 'Inactiva' },
    ];
    exportToExcel('informe-general', cols, generalRows);
  };

  // ---- Empresa report: all sucursales of one empresa ----
  const { data: empresaSucursales, isLoading: loadingEmpresaSucursales } = useQuery({
    queryKey: ['empresaSucursales', empresaId],
    queryFn: () => getEmpresaSucursales(empresaId as number),
    enabled: empresaId !== '',
  });

  const empresaColumns: Column<Sucursal>[] = [
    { key: 'nombre', header: 'Sucursal', sortable: true, accessor: (r) => r.nombre, render: (r) => <span className="font-medium text-slate-900 dark:text-slate-100">{r.nombre}</span> },
    { key: 'direccion', header: 'Dirección', accessor: (r) => r.direccion },
    {
      key: 'activa', header: 'Estado',
      render: (r) => <Badge color={r.activa ? 'green' : 'red'} label={r.activa ? 'Activa' : 'Inactiva'} />,
    },
  ];

  const empresaName = empresas?.find((e) => e.id_empresa === empresaId)?.nombre ?? 'empresa';

  const exportEmpresa = () => {
    const cols: ExcelColumn<Sucursal>[] = [
      { header: 'Sucursal', accessor: (r) => r.nombre },
      { header: 'Dirección', accessor: (r) => r.direccion },
      { header: 'Estado', accessor: (r) => r.activa ? 'Activa' : 'Inactiva' },
    ];
    exportToExcel(`informe-${empresaName.toLowerCase().replace(/\s+/g, '-')}`, cols, empresaSucursales ?? []);
  };

  const empresaOptions = (empresas ?? []).map((e) => ({ value: e.id_empresa, label: e.nombre }));

  // ---- Terapeuta report: trabajadores tratados / activos / alta + casos de consumo ----
  const { data: terapeutas } = useQuery({ queryKey: ['terapeutas'], queryFn: getTerapeutas });
  const { data: informeTerapeuta, isLoading: loadingInformeTerapeuta } = useQuery({
    queryKey: ['informeTerapeuta', terapeutaId],
    queryFn: () => getTerapeutaInforme(terapeutaId as number),
    enabled: terapeutaId !== '',
  });

  const terapeutaOptions = (terapeutas ?? []).map((t) => ({
    value: t.id_terapeuta, label: `${t.apellidos}, ${t.nombres}`,
  }));

  const SUSTANCIA_LABELS: Record<string, string> = {
    oh: 'OH (Alcohol)', thc: 'THC', cc: 'CC', pbc: 'PBC', bzo: 'BZO', amp: 'AMP', otros: 'Otros',
  };

  const exportTerapeuta = () => {
    if (!informeTerapeuta) return;
    const t = informeTerapeuta.terapeuta;
    const rows: { campo: string; valor: string | number }[] = [
      { campo: 'Terapeuta', valor: `${t.apellidos}, ${t.nombres}` },
      { campo: 'RUT', valor: t.rut },
      { campo: 'Registro profesional', valor: t.registro_profesional ?? '—' },
      { campo: 'Especialidad', valor: [t.especialidad_1, t.especialidad_2, t.especialidad_3].filter(Boolean).join(' / ') },
      { campo: 'Email', valor: t.email ?? '—' },
      { campo: 'Teléfono', valor: t.telefono ?? '—' },
      { campo: 'Trabajadores tratados (activos + alta)', valor: informeTerapeuta.trabajadores_tratados },
      { campo: 'Trabajadores activos', valor: informeTerapeuta.trabajadores_activos },
      { campo: 'Trabajadores con alta', valor: informeTerapeuta.trabajadores_alta },
      ...Object.entries(SUSTANCIA_LABELS).map(([k, label]) => ({
        campo: `Casos de consumo — ${label}`,
        valor: informeTerapeuta.consumo[k as keyof typeof informeTerapeuta.consumo],
      })),
    ];
    const cols: ExcelColumn<typeof rows[number]>[] = [
      { header: 'Campo', accessor: (r) => r.campo },
      { header: 'Valor', accessor: (r) => r.valor },
    ];
    exportToExcel(`informe-terapeuta-${t.apellidos.toLowerCase()}`, cols, rows);
  };

  if (loadingEmpresas || loadingSucursales) return <PageSpinner />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Informes</h1>

      <Tabs
        tabs={[
          { id: 'general', label: 'Informe General' },
          { id: 'empresa', label: 'Informe Empresa' },
          { id: 'terapeuta', label: 'Informe Terapeuta' },
        ]}
        active={tab}
        onChange={setTab}
      >
        <TabPanel id="general" active={tab}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Todas las empresas con sus sucursales</p>
            <Button onClick={exportGeneral} disabled={generalRows.length === 0}>Exportar a Excel</Button>
          </div>
          <Table
            columns={generalColumns}
            data={generalRows}
            keyExtractor={(r) => `${r.id_empresa}-${r.id_sucursal ?? 'none'}`}
            emptyMessage="Sin empresas registradas"
          />
        </TabPanel>

        <TabPanel id="empresa" active={tab}>
          <div className="flex items-end justify-between mb-4 gap-4">
            <div className="w-72">
              <Select
                label="Empresa"
                options={empresaOptions}
                value={empresaId}
                onChange={(e) => setEmpresaId(e.target.value ? Number(e.target.value) : '')}
                placeholder="Seleccionar empresa…"
              />
            </div>
            <Button onClick={exportEmpresa} disabled={empresaId === '' || (empresaSucursales ?? []).length === 0}>Exportar a Excel</Button>
          </div>
          {empresaId === '' ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">Seleccione una empresa para ver sus sucursales</p>
          ) : loadingEmpresaSucursales ? (
            <PageSpinner />
          ) : (
            <Table
              columns={empresaColumns}
              data={empresaSucursales ?? []}
              keyExtractor={(r) => r.id_sucursal}
              emptyMessage="Esta empresa no tiene sucursales"
            />
          )}
        </TabPanel>

        <TabPanel id="terapeuta" active={tab}>
          <div className="flex items-end justify-between mb-4 gap-4">
            <div className="w-72">
              <Select
                label="Terapeuta"
                options={terapeutaOptions}
                value={terapeutaId}
                onChange={(e) => setTerapeutaId(e.target.value ? Number(e.target.value) : '')}
                placeholder="Seleccionar terapeuta…"
              />
            </div>
            <Button onClick={exportTerapeuta} disabled={!informeTerapeuta}>Exportar a Excel</Button>
          </div>

          {terapeutaId === '' ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">Seleccione un terapeuta para ver su informe</p>
          ) : loadingInformeTerapeuta || !informeTerapeuta ? (
            <PageSpinner />
          ) : (
            <div className="space-y-6">
              {/* Información del terapeuta */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  {informeTerapeuta.terapeuta.apellidos}, {informeTerapeuta.terapeuta.nombres}
                </h2>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div><dt className="text-slate-500 dark:text-slate-400">RUT</dt><dd className="text-slate-800 dark:text-slate-200">{informeTerapeuta.terapeuta.rut}</dd></div>
                  <div><dt className="text-slate-500 dark:text-slate-400">Registro profesional</dt><dd className="text-slate-800 dark:text-slate-200">{informeTerapeuta.terapeuta.registro_profesional ?? '—'}</dd></div>
                  <div><dt className="text-slate-500 dark:text-slate-400">Especialidad</dt><dd className="text-slate-800 dark:text-slate-200">{[informeTerapeuta.terapeuta.especialidad_1, informeTerapeuta.terapeuta.especialidad_2, informeTerapeuta.terapeuta.especialidad_3].filter(Boolean).join(' / ')}</dd></div>
                  <div><dt className="text-slate-500 dark:text-slate-400">Email</dt><dd className="text-slate-800 dark:text-slate-200">{informeTerapeuta.terapeuta.email ?? '—'}</dd></div>
                  <div><dt className="text-slate-500 dark:text-slate-400">Teléfono</dt><dd className="text-slate-800 dark:text-slate-200">{informeTerapeuta.terapeuta.telefono ?? '—'}</dd></div>
                </dl>
              </div>

              {/* Trabajadores */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Trabajadores tratados" sublabel="activos + alta" value={informeTerapeuta.trabajadores_tratados} />
                <StatCard label="Trabajadores activos" value={informeTerapeuta.trabajadores_activos} />
                <StatCard label="Trabajadores con alta" value={informeTerapeuta.trabajadores_alta} />
              </div>

              {/* Casos de consumo */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Casos de consumo</h3>
                <div className="grid grid-cols-4 gap-3 md:grid-cols-7">
                  {Object.entries(SUSTANCIA_LABELS).map(([k, label]) => (
                    <div key={k} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-center">
                      <div className="text-2xl font-bold text-primary-800 dark:text-primary-300">
                        {informeTerapeuta.consumo[k as keyof typeof informeTerapeuta.consumo]}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabPanel>
      </Tabs>
    </div>
  );
}

function StatCard({ label, sublabel, value }: { label: string; sublabel?: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
      <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">{label}</div>
      {sublabel && <div className="text-xs text-slate-400 dark:text-slate-500">{sublabel}</div>}
    </div>
  );
}
