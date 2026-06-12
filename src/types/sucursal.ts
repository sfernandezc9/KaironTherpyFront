export interface Sucursal {
  id_sucursal: number;
  id_empresa: number;
  nombre: string;
  nombre_empresa?: string;
  direccion: string;
  activa: boolean;
}

export interface SucursalForm {
  id_empresa: number;
  nombre: string;
  direccion: string;
  activa: boolean;
}

export interface Responsable {
  id_responsable: number;
  id_sucursal: number;
  nombre: string;
  cargo: string;
  email: string;
  celular: string;
}

export interface ResponsableForm {
  nombre: string;
  cargo: string;
  email: string;
  celular: string;
}
