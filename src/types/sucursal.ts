export interface Sucursal {
  id_sucursal: number;
  id_empresa: number;
  nombre: string;
  nombre_empresa?: string;
  direccion: string;
  telefono: string;
  email: string;
  activa: boolean;
}

export interface SucursalForm {
  id_empresa: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  activa: boolean;
}
