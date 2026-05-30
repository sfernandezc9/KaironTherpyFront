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
  especialidad: string;
  registro_profesional: string;
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
  especialidad: string;
  registro_profesional: string;
  activo?: boolean;
}

export interface TerapeutaSucursal {
  id_sucursal: number;
  nombre_sucursal: string;
  fecha_inicio: string;
  fecha_fin: string | null;
}
