export interface Paciente {
  id_paciente: number;
  id_persona: number;
  id_sucursal: number;
  rut: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  genero: string;
  telefono: string;
  email: string;
  direccion: string;
  prevision: string;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  activo: boolean;
  nombre_sucursal?: string;
}

export interface PacienteForm {
  rut: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  genero: string;
  telefono: string;
  email: string;
  direccion: string;
  id_sucursal: number;
  prevision: string;
  contacto_emergencia_nombre: string;
  contacto_emergencia_telefono: string;
  activo?: boolean;
}
