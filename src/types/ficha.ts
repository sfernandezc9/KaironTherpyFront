export interface Ficha {
  id_ficha: number;
  id_paciente: number;
  motivo_consulta: string;
  antecedentes: string;
  alergias: string;
  medicamentos: string;
  diagnostico_actual: string;
  observaciones: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface FichaForm {
  id_paciente: number;
  motivo_consulta: string;
  antecedentes: string;
  alergias: string;
  medicamentos: string;
  diagnostico_actual: string;
  observaciones: string;
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
