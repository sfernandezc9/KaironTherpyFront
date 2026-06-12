export interface Terapeuta {
  id_terapeuta: number;
  id_persona: number;
  rut: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  genero: string;
  telefono: string;
  email: string;
  direccion: string;
  especialidad_1: string;
  especialidad_2: string | null;
  especialidad_3: string | null;
  registro_profesional: string;
  nacionalidad: string | null;
  activo: boolean;
}

export interface TerapeutaForm {
  rut: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  genero: string;
  telefono: string;
  email: string;
  direccion: string;
  nacionalidad: string;
  especialidad_1: string;
  especialidad_2: string;
  especialidad_3: string;
  registro_profesional: string;
  activo?: boolean;
}

export interface TerapeutaSucursal {
  id_sucursal: number;
  nombre: string;
  nombre_empresa?: string;
  fecha_inicio: string;
  fecha_fin: string | null;
}
