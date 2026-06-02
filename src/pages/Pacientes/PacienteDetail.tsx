import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPaciente,
  updatePaciente,
  deletePaciente,
  getPacienteFicha,
  getPacienteSesiones,
} from '../../api/pacientes';
import { updateFicha, createFicha, getFichaHistorial } from '../../api/fichas';
import { getTerapeutas } from '../../api/terapeutas';
import { getSucursales } from '../../api/sucursales';
import { getSesionInsumos } from '../../api/sesiones';
import { Tabs, TabPanel } from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';
import Input, { TextArea } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { formatRut, formatDate, formatDateTime, formatDateInput } from '../../utils/format';
import type { PacienteForm } from '../../types/paciente';
import type { FichaForm, FichaUpdateForm } from '../../types/ficha';
import type { Sesion } from '../../types/sesion';

const TABS = [
  { id: 'datos', label: 'Datos personales' },
  { id: 'ficha', label: 'Ficha clínica' },
  { id: 'sesiones', label: 'Sesiones' },
];

const GENERO_OPTIONS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' },
];

const ESTADO_COLORS: Record<string, 'green' | 'yellow' | 'red'> = {
  realizada: 'green',
  pendiente: 'yellow',
  cancelada: 'red',
};

export default function PacienteDetail() {

  const { id } = useParams<{ id: string }>();
  const pid = Number(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('datos');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [expandedSesion, setExpandedSesion] = useState<number | null>(null);

  const { data: paciente, isLoading: loadingP } = useQuery({
    queryKey: ['paciente', pid],
    queryFn: () => getPaciente(pid),
  });

  const { data: sucursales } = useQuery({ queryKey: ['sucursales'], queryFn: getSucursales });
  const { data: terapeutas } = useQuery({ queryKey: ['terapeutas'], queryFn: getTerapeutas });
  const { data: ficha, isLoading: loadingF } = useQuery({
    queryKey: ['ficha', pid],
    queryFn: () => getPacienteFicha(pid),
    enabled: activeTab === 'ficha' || activeTab === 'sesiones',
  });
  const { data: historial } = useQuery({
    queryKey: ['fichaHistorial', ficha?.id_ficha],
    queryFn: () => getFichaHistorial(ficha!.id_ficha),
    enabled: !!ficha?.id_ficha && activeTab === 'ficha',
  });
  const { data: sesiones, isLoading: loadingS } = useQuery({
    queryKey: ['pacienteSesiones', pid],
    queryFn: () => getPacienteSesiones(pid),
    enabled: activeTab === 'sesiones',
  });

  // Datos form
  const [datosForm, setDatosForm] = useState<Partial<PacienteForm> | null>(null);
  const datosMut = useMutation({
    mutationFn: (form: Partial<PacienteForm>) => updatePaciente(pid, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paciente', pid] });
      qc.invalidateQueries({ queryKey: ['pacientes'] });
      showToast('Datos actualizados', 'success');
      setDatosForm(null);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  // Ficha form
  const [fichaForm, setFichaForm] = useState<Partial<FichaUpdateForm> | null>(null);
  const fichaMut = useMutation({
    mutationFn: (form: FichaUpdateForm) => updateFicha(ficha!.id_ficha, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ficha', pid] });
      qc.invalidateQueries({ queryKey: ['fichaHistorial', ficha?.id_ficha] });
      showToast('Ficha actualizada', 'success');
      setFichaForm(null);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const createFichaMut = useMutation({
    mutationFn: (form: FichaForm) => createFicha(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ficha', pid] });
      showToast('Ficha clínica creada', 'success');
      setFichaForm(null);
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  const deleteMut = useMutation({
    mutationFn: () => deletePaciente(pid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pacientes'] });
      showToast('Paciente eliminado', 'success');
      navigate('/pacientes');
    },
    onError: (e: Error) => showToast(e.message, 'error'),
  });

  if (loadingP) return <PageSpinner />;
  if (!paciente) return <div className="p-6 text-red-600">Paciente no encontrado</div>;

  const df = datosForm ?? {
    rut: paciente.rut,
    nombres: paciente.nombres,
    apellidos: paciente.apellidos,
    fecha_nacimiento: formatDateInput(paciente.fecha_nacimiento),
    genero: paciente.genero,
    telefono: paciente.telefono,
    email: paciente.email,
    direccion: paciente.direccion,
    id_sucursal: paciente.id_sucursal,
    prevision: paciente.prevision,
    contacto_emergencia_nombre: paciente.contacto_emergencia_nombre,
    contacto_emergencia_telefono: paciente.contacto_emergencia_telefono,
    activo: paciente.activo,
  };

  const ff = fichaForm ?? {
    motivo_consulta: ficha?.motivo_consulta ?? '',
    antecedentes: ficha?.antecedentes ?? '',
    alergias: ficha?.alergias ?? '',
    medicamentos: ficha?.medicamentos ?? '',
    diagnostico_actual: ficha?.diagnostico_actual ?? '',
    observaciones: ficha?.observaciones ?? '',
    id_terapeuta: 0,
  };

  const sucursalOptions = (sucursales ?? []).map((s) => ({
    value: s.id_sucursal,
    label: s.nombre,
  }));

  const terapeutaOptions = (terapeutas ?? []).filter((t) => t.activo).map((t) => ({
    value: t.id_terapeuta,
    label: `${t.nombres} ${t.apellidos}`,
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => navigate('/pacientes')} className="text-sm text-primary-800 hover:underline mb-2 flex items-center gap-1">
            ← Pacientes
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            {paciente.apellidos}, {paciente.nombres}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-slate-500">{formatRut(paciente.rut)}</span>
            <Badge label={paciente.activo ? 'Activo' : 'Inactivo'} color={paciente.activo ? 'green' : 'slate'} dot />
          </div>
        </div>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>Eliminar</Button>
      </div>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab}>
        {/* Datos personales */}
        <TabPanel id="datos" active={activeTab}>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Input label="RUT" value={df.rut ?? ''} onChange={(e) => setDatosForm({ ...df, rut: e.target.value })} />
            <Input label="Nombres" value={df.nombres ?? ''} onChange={(e) => setDatosForm({ ...df, nombres: e.target.value })} />
            <Input label="Apellidos" value={df.apellidos ?? ''} onChange={(e) => setDatosForm({ ...df, apellidos: e.target.value })} />
            <Input label="Fecha de nacimiento" type="date" value={df.fecha_nacimiento ?? ''} onChange={(e) => setDatosForm({ ...df, fecha_nacimiento: e.target.value })} />
            <Select label="Género" options={GENERO_OPTIONS} value={df.genero ?? ''} onChange={(e) => setDatosForm({ ...df, genero: e.target.value })} />
            <Input label="Teléfono" value={df.telefono ?? ''} onChange={(e) => setDatosForm({ ...df, telefono: e.target.value })} />
            <Input label="Email" type="email" value={df.email ?? ''} onChange={(e) => setDatosForm({ ...df, email: e.target.value })} />
            <Select label="Sucursal" options={sucursalOptions} value={df.id_sucursal ?? ''} onChange={(e) => setDatosForm({ ...df, id_sucursal: Number(e.target.value) })} />
            <div className="col-span-2">
              <Input label="Dirección" value={df.direccion ?? ''} onChange={(e) => setDatosForm({ ...df, direccion: e.target.value })} />
            </div>
            <Input label="Previsión" value={df.prevision ?? ''} onChange={(e) => setDatosForm({ ...df, prevision: e.target.value })} />
            <Input label="Contacto emergencia" value={df.contacto_emergencia_nombre ?? ''} onChange={(e) => setDatosForm({ ...df, contacto_emergencia_nombre: e.target.value })} />
            <Input label="Teléfono emergencia" value={df.contacto_emergencia_telefono ?? ''} onChange={(e) => setDatosForm({ ...df, contacto_emergencia_telefono: e.target.value })} />
            <Select label="Estado" options={[{ value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }]} value={String(df.activo ?? true)} onChange={(e) => setDatosForm({ ...df, activo: e.target.value === 'true' })} />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => datosMut.mutate(df as Partial<PacienteForm>)} loading={datosMut.isPending}>
              Guardar cambios
            </Button>
          </div>
        </TabPanel>

        {/* Ficha clínica */}
        <TabPanel id="ficha" active={activeTab}>
          {loadingF ? (
            <PageSpinner />
          ) : !ficha ? (
            <>
              <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                Este paciente no tiene ficha clínica. Completa los datos y créala para poder registrar sesiones.
              </div>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <TextArea label="Motivo de consulta" rows={3} value={ff.motivo_consulta ?? ''} onChange={(e) => setFichaForm({ ...ff, motivo_consulta: e.target.value })} />
                <TextArea label="Antecedentes médicos" rows={3} value={ff.antecedentes ?? ''} onChange={(e) => setFichaForm({ ...ff, antecedentes: e.target.value })} />
                <TextArea label="Alergias" rows={2} value={ff.alergias ?? ''} onChange={(e) => setFichaForm({ ...ff, alergias: e.target.value })} />
                <TextArea label="Medicamentos actuales" rows={2} value={ff.medicamentos ?? ''} onChange={(e) => setFichaForm({ ...ff, medicamentos: e.target.value })} />
                <TextArea label="Diagnóstico actual" rows={3} value={ff.diagnostico_actual ?? ''} onChange={(e) => setFichaForm({ ...ff, diagnostico_actual: e.target.value })} />
                <TextArea label="Observaciones" rows={3} value={ff.observaciones ?? ''} onChange={(e) => setFichaForm({ ...ff, observaciones: e.target.value })} />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => createFichaMut.mutate({
                    id_paciente: pid,
                    motivo_consulta: ff.motivo_consulta ?? '',
                    antecedentes: ff.antecedentes ?? '',
                    alergias: ff.alergias ?? '',
                    medicamentos: ff.medicamentos ?? '',
                    diagnostico_actual: ff.diagnostico_actual ?? '',
                    observaciones: ff.observaciones ?? '',
                  })}
                  loading={createFichaMut.isPending}
                >
                  Crear ficha
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <TextArea label="Motivo de consulta" rows={3} value={ff.motivo_consulta ?? ''} onChange={(e) => setFichaForm({ ...ff, motivo_consulta: e.target.value })} />
                <TextArea label="Antecedentes" rows={3} value={ff.antecedentes ?? ''} onChange={(e) => setFichaForm({ ...ff, antecedentes: e.target.value })} />
                <TextArea label="Alergias" rows={2} value={ff.alergias ?? ''} onChange={(e) => setFichaForm({ ...ff, alergias: e.target.value })} />
                <TextArea label="Medicamentos" rows={2} value={ff.medicamentos ?? ''} onChange={(e) => setFichaForm({ ...ff, medicamentos: e.target.value })} />
                <TextArea label="Diagnóstico actual" rows={3} value={ff.diagnostico_actual ?? ''} onChange={(e) => setFichaForm({ ...ff, diagnostico_actual: e.target.value })} />
                <TextArea label="Observaciones" rows={3} value={ff.observaciones ?? ''} onChange={(e) => setFichaForm({ ...ff, observaciones: e.target.value })} />
                <Select
                  label="Terapeuta responsable de edición"
                  required
                  options={terapeutaOptions}
                  value={ff.id_terapeuta ?? ''}
                  onChange={(e) => setFichaForm({ ...ff, id_terapeuta: Number(e.target.value) })}
                  placeholder="Seleccionar terapeuta…"
                />
              </div>
              <div className="flex justify-end mb-8">
                <Button
                  onClick={() => {
                    if (!ff.id_terapeuta) {
                      showToast('Selecciona un terapeuta responsable', 'error');
                      return;
                    }
                    fichaMut.mutate(ff as FichaUpdateForm);
                  }}
                  loading={fichaMut.isPending}
                >
                  Guardar ficha
                </Button>
              </div>

              {/* Historial */}
              {historial && historial.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Historial de cambios</h3>
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-4">
                    {historial.map((h) => (
                      <div key={h.id_historial} className="relative">
                        <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-primary-800 border-2 border-white" />
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-primary-800 uppercase">{h.campo_modificado}</span>
                            <span className="text-xs text-slate-400">{formatDateTime(h.fecha_modificacion)}</span>
                          </div>
                          <p className="text-xs text-slate-500">Por: {h.nombre_terapeuta ?? `Terapeuta #${h.id_terapeuta}`}</p>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-red-50 rounded px-2 py-1">
                              <span className="text-red-600 font-medium">Anterior: </span>
                              <span className="text-slate-600">{h.valor_anterior || '(vacío)'}</span>
                            </div>
                            <div className="bg-green-50 rounded px-2 py-1">
                              <span className="text-green-600 font-medium">Nuevo: </span>
                              <span className="text-slate-600">{h.valor_nuevo || '(vacío)'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabPanel>

        {/* Sesiones */}
        <TabPanel id="sesiones" active={activeTab}>
          {!ficha && !loadingF ? (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              Este paciente no tiene ficha clínica. Créala primero en el tab "Ficha clínica" para poder registrar sesiones.
            </div>
          ) : loadingS ? (
            <PageSpinner />
          ) : !sesiones?.length ? (
            <p className="text-slate-500">Sin sesiones registradas.</p>
          ) : (
            <div className="space-y-3">
              {sesiones.map((s) => (
                <SesionRow
                  key={s.id_sesion}
                  sesion={s}
                  expanded={expandedSesion === s.id_sesion}
                  onToggle={() =>
                    setExpandedSesion(expandedSesion === s.id_sesion ? null : s.id_sesion)
                  }
                />
              ))}
            </div>
          )}
        </TabPanel>
      </Tabs>

      <ConfirmDialog
        open={deleteOpen}
        message={`¿Eliminar al paciente ${paciente.nombres} ${paciente.apellidos}? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteMut.mutate()}
        onCancel={() => setDeleteOpen(false)}
        loading={deleteMut.isPending}
      />
    </div>
  );
}

function SesionRow({
  sesion,
  expanded,
  onToggle,
}: {
  sesion: Sesion;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { data: insumos } = useQuery({
    queryKey: ['sesionInsumos', sesion.id_sesion],
    queryFn: () => getSesionInsumos(sesion.id_sesion),
    enabled: expanded,
  });

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 text-left"
      >
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-800">{formatDate(sesion.fecha)}</span>
          <span className="text-xs text-slate-500">{sesion.duracion_minutos} min</span>
          <Badge
            label={sesion.estado.charAt(0).toUpperCase() + sesion.estado.slice(1)}
            color={ESTADO_COLORS[sesion.estado]}
            dot
          />
        </div>
        <span className="text-slate-400">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 bg-slate-50 border-t border-slate-200">
          {sesion.notas_sesion && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Notas</p>
              <p className="text-sm text-slate-700">{sesion.notas_sesion}</p>
            </div>
          )}
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Insumos usados</p>
            {!insumos?.length ? (
              <p className="text-xs text-slate-400">Sin insumos registrados</p>
            ) : (
              <ul className="space-y-1">
                {insumos.map((i) => (
                  <li key={i.id_uso} className="text-xs text-slate-700">
                    {i.nombre_insumo} — {i.cantidad_usada} {i.unidad_medida}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
