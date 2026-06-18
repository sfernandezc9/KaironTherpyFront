export const SUSTANCIAS = [
  { key: 'tabaco', label: 'Tabaco' },
  { key: 'oh', label: 'OH (Alcohol)' },
  { key: 'thc', label: 'THC' },
  { key: 'cc', label: 'CC' },
  { key: 'pbc', label: 'PBC' },
  { key: 'bzo', label: 'BZO' },
  { key: 'amp', label: 'AMP' },
  { key: 'otros', label: 'Otros' },
] as const;

export interface FichaConsumo {
  id_consumo?: number;
  id_ficha?: number;
  sustancia: string;
  edad_inicio: string | null;
  consumo_actual: string | null;
}

export interface TratamientoAnterior {
  id_tratamiento?: number;
  id_ficha?: number;
  institucion: string | null;
  anio: string | null;
  observacion: string | null;
}

export interface Ficha {
  id_ficha: number;
  id_paciente: number;
  motivo_consulta: string;
  antecedentes: string;
  alergias: string;
  medicamentos: string;
  diagnostico_actual: string;
  observaciones: string;
  enfermedades_mentales: string | null;
  enfermedades_biologicas: string | null;
  edad_inicio_consumo: string | null;
  consumo_observaciones: string | null;
  historial_familiar: string | null;
  indicacion_intervencion: string | null;
  modalidad: string | null;
  consumos?: FichaConsumo[];
  tratamientos?: TratamientoAnterior[];
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  nombres?: string;
  apellidos?: string;
  rut?: string;
}

export interface FichaForm {
  id_paciente: number;
  motivo_consulta: string;
  antecedentes: string;
  alergias: string;
  medicamentos: string;
  diagnostico_actual: string;
  observaciones: string;
  enfermedades_mentales?: string;
  enfermedades_biologicas?: string;
  edad_inicio_consumo?: string;
  consumo_observaciones?: string;
  historial_familiar?: string;
  indicacion_intervencion?: string;
  modalidad?: string;
  consumos?: FichaConsumo[];
  tratamientos?: TratamientoAnterior[];
}

export interface FichaUpdateForm {
  id_terapeuta: number;
  id_sesion?: number;
  motivo_consulta: string;
  antecedentes: string;
  alergias: string;
  medicamentos: string;
  diagnostico_actual: string;
  observaciones: string;
  enfermedades_mentales?: string;
  enfermedades_biologicas?: string;
  edad_inicio_consumo?: string;
  consumo_observaciones?: string;
  historial_familiar?: string;
  indicacion_intervencion?: string;
  modalidad?: string;
  consumos?: FichaConsumo[];
  tratamientos?: TratamientoAnterior[];
}

export interface FichaHistorial {
  id_historial: number;
  id_ficha: number;
  id_terapeuta: number;
  nombre_terapeuta?: string;
  campo_modificado: string;
  valor_anterior: string;
  valor_nuevo: string;
  fecha_modificacion: string;
}
