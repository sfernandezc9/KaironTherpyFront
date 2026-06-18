export type EstadoSesion = 'realizada' | 'pendiente' | 'cancelada';

export interface Sesion {
  id_sesion: number;
  id_ficha: number;
  id_terapeuta: number;
  id_sucursal: number;
  fecha: string;
  duracion_minutos: number;
  estado: EstadoSesion;
  notas_sesion: string;
  id_paciente?: number;
  nombre_paciente?: string;
  nombre_terapeuta?: string;
  nombre_sucursal?: string;
  archivo_nombre: string | null;
  archivo_path: string | null;
  created_at: string | null;
}

export interface SesionForm {
  id_ficha: number;
  id_terapeuta: number;
  id_sucursal: number;
  fecha: string;
  duracion_minutos: number;
  estado: EstadoSesion;
  notas_sesion: string;
}

export interface SesionInsumo {
  id_uso: number;
  id_sesion: number;
  id_stock: number;
  nombre_insumo?: string;
  unidad_medida?: string;
  cantidad_usada: number;
  fecha_asignacion?: string | null;
}

export interface SesionInsumoForm {
  id_stock: number;
  cantidad_usada: number;
}

export interface SesionFilters {
  id_sucursal?: number;
  id_terapeuta?: number;
  desde?: string;
  hasta?: string;
  estado?: EstadoSesion;
}
