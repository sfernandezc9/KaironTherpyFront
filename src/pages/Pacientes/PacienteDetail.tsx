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
import { formatRut, formatDate, formatDateTime, formatDateInput, validateRut } from '../../utils/format';
import { NACIONALIDAD_OPTIONS } from '../../utils/nacionalidades';
import type { PacienteForm } from '../../types/paciente';
import type { FichaForm, FichaUpdateForm } from '../../types/ficha';
import { SUSTANCIAS } from '../../types/ficha';
import type { Sesion } from '../../types/sesion';

const TABS = [
  { id: 'datos', label: 'Datos personales' },
  { id: 'ficha', label: 'Ficha clínica' },
  { id: 'sesiones', label: 'Sesiones' },
];

const GENERO_OPTIONS = [
  { value: 'Hombre', label: 'Hombre' },
  { value: 'Mujer', label: 'Mujer' },
  { value: 'Transfemenino', label: 'Transfemenino' },
  { value: 'No binario', label: 'No binario' },
  { value: 'Otro', label: 'Otro' },
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
  const [datosRutError, setDatosRutError] = useState('');
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
      qc.invalidateQueries({ queryKey: ['fichas'] });
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
  if (!paciente) return <div className="p-6 text-red-600 dark:text-red-400">Paciente no encontrado</div>;

  const df = datosForm ?? {
    rut: paciente.rut,
    nombres: paciente.nombres,
    apellidos: paciente.apellidos,
    fecha_nacimiento: formatDateInput(paciente.fecha_nacimiento),
    genero: paciente.genero,
    telefono: paciente.telefono,
    email: paciente.email,
    direccion: paciente.direccion,
    nacionalidad: paciente.nacionalidad ?? '',
    id_sucursal: paciente.id_sucursal,
    prevision: paciente.prevision,
    estado_civil: paciente.estado_civil ?? '',
    numero_hijos: paciente.numero_hijos ?? undefined,
    escolaridad: paciente.escolaridad ?? '',
    profesion_ocupacion: paciente.profesion_ocupacion ?? '',
    comuna: paciente.comuna ?? '',
    empresa_nombre: paciente.empresa_nombre ?? '',
    apoderado_nombre: paciente.apoderado_nombre ?? '',
    apoderado_parentesco: paciente.apoderado_parentesco ?? '',
    apoderado_edad: paciente.apoderado_edad ?? undefined,
    apoderado_direccion: paciente.apoderado_direccion ?? '',
    apoderado_telefono: paciente.apoderado_telefono ?? '',
    contacto_emergencia_nombre: paciente.contacto_emergencia_nombre,
    contacto_emergencia_parentesco: paciente.contacto_emergencia_parentesco,
    contacto_emergencia_telefono: paciente.contacto_emergencia_telefono,
    contacto_emergencia_email: paciente.contacto_emergencia_email,
    contacto2_nombre: paciente.contacto2_nombre ?? '',
    contacto2_parentesco: paciente.contacto2_parentesco ?? '',
    contacto2_telefono: paciente.contacto2_telefono ?? '',
    contacto2_email: paciente.contacto2_email ?? '',
    activo: paciente.activo,
  };

  const ff = fichaForm ?? {
    motivo_consulta: ficha?.motivo_consulta ?? '',
    antecedentes: ficha?.antecedentes ?? '',
    alergias: ficha?.alergias ?? '',
    medicamentos: ficha?.medicamentos ?? '',
    diagnostico_actual: ficha?.diagnostico_actual ?? '',
    observaciones: ficha?.observaciones ?? '',
    enfermedades_mentales: ficha?.enfermedades_mentales ?? '',
    enfermedades_biologicas: ficha?.enfermedades_biologicas ?? '',
    edad_inicio_consumo: ficha?.edad_inicio_consumo ?? '',
    consumo_observaciones: ficha?.consumo_observaciones ?? '',
    historial_familiar: ficha?.historial_familiar ?? '',
    indicacion_intervencion: ficha?.indicacion_intervencion ?? '',
    modalidad: ficha?.modalidad ?? '',
    consumos: ficha?.consumos ?? [],
    tratamientos: ficha?.tratamientos ?? [],
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {paciente.apellidos}, {paciente.nombres}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-slate-500 dark:text-slate-400">{formatRut(paciente.rut)}</span>
            <Badge label={paciente.activo ? 'Activo' : 'Inactivo'} color={paciente.activo ? 'green' : 'slate'} dot />
          </div>
        </div>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>Eliminar</Button>
      </div>

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab}>
        {/* Datos personales */}
        <TabPanel id="datos" active={activeTab}>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Input label="RUT" value={df.rut ?? ''} onChange={(e) => { setDatosForm({ ...df, rut: formatRut(e.target.value) }); setDatosRutError(''); }} error={datosRutError} placeholder="12.345.678-9" />
            <Input label="Nombres" value={df.nombres ?? ''} onChange={(e) => setDatosForm({ ...df, nombres: e.target.value })} />
            <Input label="Apellidos" value={df.apellidos ?? ''} onChange={(e) => setDatosForm({ ...df, apellidos: e.target.value })} />
            <Input label="Fecha de nacimiento" type="date" value={df.fecha_nacimiento ?? ''} onChange={(e) => setDatosForm({ ...df, fecha_nacimiento: e.target.value })} />
            <Select label="Identidad sexogenérica" options={GENERO_OPTIONS} value={df.genero ?? ''} onChange={(e) => setDatosForm({ ...df, genero: e.target.value })} />
            <Select label="Nacionalidad" options={NACIONALIDAD_OPTIONS} value={df.nacionalidad ?? ''} onChange={(e) => setDatosForm({ ...df, nacionalidad: e.target.value })} placeholder="Seleccionar…" />
            <Input label="Teléfono" value={df.telefono ?? ''} onChange={(e) => setDatosForm({ ...df, telefono: e.target.value })} />
            <Input label="Email" type="email" value={df.email ?? ''} onChange={(e) => setDatosForm({ ...df, email: e.target.value })} />
            <Select label="Sucursal" options={sucursalOptions} value={df.id_sucursal ?? ''} onChange={(e) => setDatosForm({ ...df, id_sucursal: Number(e.target.value) })} />
            <div className="col-span-2">
              <Input label="Dirección" value={df.direccion ?? ''} onChange={(e) => setDatosForm({ ...df, direccion: e.target.value })} />
            </div>
            <Input label="Previsión" value={df.prevision ?? ''} onChange={(e) => setDatosForm({ ...df, prevision: e.target.value })} />
            <Select label="Estado" options={[{ value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }]} value={String(df.activo ?? true)} onChange={(e) => setDatosForm({ ...df, activo: e.target.value === 'true' })} />

            {/* Antecedentes personales */}
            <div className="col-span-2 border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Antecedentes personales</p>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Estado civil" value={df.estado_civil ?? ''} onChange={(e) => setDatosForm({ ...df, estado_civil: e.target.value })} />
                <Input label="N° de hijos" type="number" value={df.numero_hijos ?? ''} onChange={(e) => setDatosForm({ ...df, numero_hijos: e.target.value === '' ? undefined : Number(e.target.value) })} />
                <Input label="Escolaridad" value={df.escolaridad ?? ''} onChange={(e) => setDatosForm({ ...df, escolaridad: e.target.value })} />
                <Input label="Profesión y/u ocupación" value={df.profesion_ocupacion ?? ''} onChange={(e) => setDatosForm({ ...df, profesion_ocupacion: e.target.value })} />
                <Input label="Comuna" value={df.comuna ?? ''} onChange={(e) => setDatosForm({ ...df, comuna: e.target.value })} />
              </div>
            </div>

            {/* Apoderado en la empresa */}
            <div className="col-span-2 border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Apoderado en la empresa <span className="text-xs font-normal text-slate-400">(opcional)</span></p>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nombre" value={df.apoderado_nombre ?? ''} onChange={(e) => setDatosForm({ ...df, apoderado_nombre: e.target.value })} />
                <Input label="Parentesco" value={df.apoderado_parentesco ?? ''} onChange={(e) => setDatosForm({ ...df, apoderado_parentesco: e.target.value })} />
                <Input label="Edad" type="number" value={df.apoderado_edad ?? ''} onChange={(e) => setDatosForm({ ...df, apoderado_edad: e.target.value === '' ? undefined : Number(e.target.value) })} />
                <Input label="Teléfono" value={df.apoderado_telefono ?? ''} onChange={(e) => setDatosForm({ ...df, apoderado_telefono: e.target.value })} />
                <div className="col-span-2">
                  <Input label="Dirección" value={df.apoderado_direccion ?? ''} onChange={(e) => setDatosForm({ ...df, apoderado_direccion: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Contacto emergencia 1 */}
            <div className="col-span-2 border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Contacto de emergencia 1</p>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nombre" value={df.contacto_emergencia_nombre ?? ''} onChange={(e) => setDatosForm({ ...df, contacto_emergencia_nombre: e.target.value })} />
                <Input label="Parentesco" value={df.contacto_emergencia_parentesco ?? ''} onChange={(e) => setDatosForm({ ...df, contacto_emergencia_parentesco: e.target.value })} />
                <Input label="Teléfono" value={df.contacto_emergencia_telefono ?? ''} onChange={(e) => setDatosForm({ ...df, contacto_emergencia_telefono: e.target.value })} />
                <Input label="Email" type="email" value={df.contacto_emergencia_email ?? ''} onChange={(e) => setDatosForm({ ...df, contacto_emergencia_email: e.target.value })} />
              </div>
            </div>

            {/* Contacto emergencia 2 */}
            <div className="col-span-2 border-t border-slate-200 dark:border-slate-700 pt-4">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Contacto de emergencia 2 <span className="text-xs font-normal text-slate-400">(opcional)</span></p>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nombre" value={df.contacto2_nombre ?? ''} onChange={(e) => setDatosForm({ ...df, contacto2_nombre: e.target.value })} />
                <Input label="Parentesco" value={df.contacto2_parentesco ?? ''} onChange={(e) => setDatosForm({ ...df, contacto2_parentesco: e.target.value })} />
                <Input label="Teléfono" value={df.contacto2_telefono ?? ''} onChange={(e) => setDatosForm({ ...df, contacto2_telefono: e.target.value })} />
                <Input label="Email" type="email" value={df.contacto2_email ?? ''} onChange={(e) => setDatosForm({ ...df, contacto2_email: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => {
              if (df.rut && !validateRut(df.rut)) { setDatosRutError('RUT inválido'); return; }
              datosMut.mutate(df as Partial<PacienteForm>);
            }} loading={datosMut.isPending}>
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
              <div className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-4">
                Este paciente no tiene ficha clínica. Completa los datos y créala para poder registrar sesiones.
              </div>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <TextArea label="Motivo de consulta" rows={3} value={ff.motivo_consulta ?? ''} onChange={(e) => setFichaForm({ ...ff, motivo_consulta: e.target.value })} />
                <TextArea label="Antecedentes médicos" rows={3} value={ff.antecedentes ?? ''} onChange={(e) => setFichaForm({ ...ff, antecedentes: e.target.value })} />
                <TextArea label="Alergias" rows={2} value={ff.alergias ?? ''} onChange={(e) => setFichaForm({ ...ff, alergias: e.target.value })} />
                <TextArea label="Medicamentos actuales" rows={2} value={ff.medicamentos ?? ''} onChange={(e) => setFichaForm({ ...ff, medicamentos: e.target.value })} />
                <TextArea label="Diagnóstico actual" rows={3} value={ff.diagnostico_actual ?? ''} onChange={(e) => setFichaForm({ ...ff, diagnostico_actual: e.target.value })} />
                <TextArea label="Observaciones" rows={3} value={ff.observaciones ?? ''} onChange={(e) => setFichaForm({ ...ff, observaciones: e.target.value })} />
                <FichaClinicaExtra ff={ff} onChange={setFichaForm} />
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
                    enfermedades_mentales: ff.enfermedades_mentales,
                    enfermedades_biologicas: ff.enfermedades_biologicas,
                    edad_inicio_consumo: ff.edad_inicio_consumo,
                    consumo_observaciones: ff.consumo_observaciones,
                    historial_familiar: ff.historial_familiar,
                    indicacion_intervencion: ff.indicacion_intervencion,
                    modalidad: ff.modalidad,
                    consumos: ff.consumos,
                    tratamientos: ff.tratamientos,
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
                <FichaClinicaExtra ff={ff} onChange={setFichaForm} />
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
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Historial de cambios</h3>
                  <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 space-y-4">
                    {historial.map((h) => (
                      <div key={h.id_historial} className="relative">
                        <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-primary-800 border-2 border-white dark:border-slate-900" />
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-primary-800 dark:text-primary-300 uppercase">{h.campo_modificado}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">{formatDateTime(h.fecha_modificacion)}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Por: {h.nombre_terapeuta ?? `Terapeuta #${h.id_terapeuta}`}</p>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-red-50 dark:bg-red-900/20 rounded px-2 py-1">
                              <span className="text-red-600 dark:text-red-400 font-medium">Anterior: </span>
                              <span className="text-slate-600 dark:text-slate-300">{h.valor_anterior || '(vacío)'}</span>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded px-2 py-1">
                              <span className="text-green-600 dark:text-green-400 font-medium">Nuevo: </span>
                              <span className="text-slate-600 dark:text-slate-300">{h.valor_nuevo || '(vacío)'}</span>
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
            <div className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
              Este paciente no tiene ficha clínica. Créala primero en el tab "Ficha clínica" para poder registrar sesiones.
            </div>
          ) : loadingS ? (
            <PageSpinner />
          ) : !sesiones?.length ? (
            <p className="text-slate-500">Sin sesiones registradas.</p>
          ) : (
            <div className="space-y-3">
              {[...sesiones].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()).map((s, i, arr) => (
                <SesionRow
                  key={s.id_sesion}
                  sesion={s}
                  numero={i + 1}
                  prevIndicaciones={i > 0 ? (arr[i - 1].nuevas_indicaciones ?? null) : null}
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
  numero,
  prevIndicaciones,
  expanded,
  onToggle,
}: {
  sesion: Sesion;
  numero: number;
  prevIndicaciones: string | null;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { data: insumos } = useQuery({
    queryKey: ['sesionInsumos', sesion.id_sesion],
    queryFn: () => getSesionInsumos(sesion.id_sesion),
    enabled: expanded,
  });

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
      >
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-800/10 dark:bg-primary-300/10 text-xs font-bold text-primary-800 dark:text-primary-300 flex-shrink-0">
            {numero}
          </span>
          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{formatDate(sesion.fecha)}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{sesion.duracion_minutos} min</span>
          <Badge
            label={sesion.estado.charAt(0).toUpperCase() + sesion.estado.slice(1)}
            color={ESTADO_COLORS[sesion.estado]}
            dot
          />
        </div>
        <span className="text-slate-400">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          {prevIndicaciones && (
            <div className="mt-3 px-3 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase mb-1">
                Indicaciones sesión anterior (#{numero - 1})
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">{prevIndicaciones}</p>
            </div>
          )}
          {sesion.notas_sesion && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">Notas</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{sesion.notas_sesion}</p>
            </div>
          )}
          {(sesion.observaciones || sesion.tipo_observacion) && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Observaciones</p>
                {sesion.tipo_observacion && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    sesion.tipo_observacion === 'avance'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                  }`}>
                    {sesion.tipo_observacion.charAt(0).toUpperCase() + sesion.tipo_observacion.slice(1)}
                  </span>
                )}
              </div>
              {sesion.observaciones && (
                <p className="text-sm text-slate-700 dark:text-slate-300">{sesion.observaciones}</p>
              )}
            </div>
          )}
          {sesion.nuevas_indicaciones && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">Nuevas indicaciones</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{sesion.nuevas_indicaciones}</p>
            </div>
          )}
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">Insumos usados</p>
            {!insumos?.length ? (
              <p className="text-xs text-slate-400 dark:text-slate-500">Sin insumos registrados</p>
            ) : (
              <ul className="space-y-1">
                {insumos.map((i) => (
                  <li key={i.id_uso} className="text-xs text-slate-700 dark:text-slate-300">
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

// ── Campos clínicos de la Ficha Trabajador (adicciones) ───────────────────────

function FichaClinicaExtra({
  ff,
  onChange,
}: {
  ff: Partial<FichaUpdateForm>;
  onChange: (next: Partial<FichaUpdateForm>) => void;
}) {
  const consumos = ff.consumos ?? [];
  const tratamientos = ff.tratamientos ?? [];

  const getConsumo = (sust: string) => consumos.find((c) => c.sustancia === sust);
  const setConsumo = (sust: string, field: 'edad_inicio' | 'consumo_actual', value: string) => {
    const list = [...consumos];
    const idx = list.findIndex((c) => c.sustancia === sust);
    if (idx >= 0) list[idx] = { ...list[idx], [field]: value };
    else list.push({ sustancia: sust, edad_inicio: null, consumo_actual: null, [field]: value });
    onChange({ ...ff, consumos: list });
  };

  const addTrat = () =>
    onChange({ ...ff, tratamientos: [...tratamientos, { institucion: '', anio: '', observacion: '' }] });
  const setTrat = (i: number, field: 'institucion' | 'anio' | 'observacion', value: string) => {
    const list = [...tratamientos];
    list[i] = { ...list[i], [field]: value };
    onChange({ ...ff, tratamientos: list });
  };
  const removeTrat = (i: number) =>
    onChange({ ...ff, tratamientos: tratamientos.filter((_, idx) => idx !== i) });

  return (
    <>
      {/* Enfermedades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextArea label="Enfermedades mentales" rows={2} value={ff.enfermedades_mentales ?? ''} onChange={(e) => onChange({ ...ff, enfermedades_mentales: e.target.value })} />
        <TextArea label="Enfermedades biológicas" rows={2} value={ff.enfermedades_biologicas ?? ''} onChange={(e) => onChange({ ...ff, enfermedades_biologicas: e.target.value })} />
      </div>

      {/* Historia de consumo */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Historia de consumo</p>
        <div className="mb-3">
          <Input label="Edad de inicio consumo" value={ff.edad_inicio_consumo ?? ''} onChange={(e) => onChange({ ...ff, edad_inicio_consumo: e.target.value })} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Sustancia</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Edad inicio</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Consumo actual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {SUSTANCIAS.map((s) => {
                const c = getConsumo(s.key);
                return (
                  <tr key={s.key}>
                    <td className="px-3 py-1.5 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{s.label}</td>
                    <td className="px-2 py-1.5">
                      <input
                        className="w-24 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        value={c?.edad_inicio ?? ''}
                        onChange={(e) => setConsumo(s.key, 'edad_inicio', e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                        value={c?.consumo_actual ?? ''}
                        onChange={(e) => setConsumo(s.key, 'consumo_actual', e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <TextArea label="Observaciones (frecuencia de consumo, fecha de último consumo)" rows={2} value={ff.consumo_observaciones ?? ''} onChange={(e) => onChange({ ...ff, consumo_observaciones: e.target.value })} />
        </div>
      </div>

      {/* Antecedentes de tratamiento */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tratamientos anteriores</p>
          <Button size="sm" variant="secondary" onClick={addTrat}>+ Agregar</Button>
        </div>
        {tratamientos.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500">Sin tratamientos registrados</p>
        ) : (
          <div className="space-y-3">
            {tratamientos.map((t, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                <div className="md:col-span-4">
                  <Input label="Institución" value={t.institucion ?? ''} onChange={(e) => setTrat(i, 'institucion', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Input label="Año" value={t.anio ?? ''} onChange={(e) => setTrat(i, 'anio', e.target.value)} />
                </div>
                <div className="md:col-span-5">
                  <Input label="Observación" value={t.observacion ?? ''} onChange={(e) => setTrat(i, 'observacion', e.target.value)} />
                </div>
                <div className="md:col-span-1 flex md:justify-center md:pt-7">
                  <button onClick={() => removeTrat(i)} className="text-red-600 dark:text-red-400 hover:text-red-800 text-sm font-medium" title="Eliminar">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial familiar e intervención */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 grid grid-cols-1 gap-4">
        <TextArea label="Historial familiar" rows={3} value={ff.historial_familiar ?? ''} onChange={(e) => onChange({ ...ff, historial_familiar: e.target.value })} />
        <TextArea label="Indicación de intervención" rows={3} value={ff.indicacion_intervencion ?? ''} onChange={(e) => onChange({ ...ff, indicacion_intervencion: e.target.value })} />
        <Input label="Modalidad" value={ff.modalidad ?? ''} onChange={(e) => onChange({ ...ff, modalidad: e.target.value })} />
      </div>
    </>
  );
}
