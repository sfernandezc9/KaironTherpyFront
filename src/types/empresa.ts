export interface Empresa {
  id_empresa: number;
  nombre: string;
  rut: string;
  direccion: string;
  telefono: string;
  email: string;
}

export interface EmpresaForm {
  nombre: string;
  rut: string;
  direccion: string;
  telefono: string;
  email: string;
}

export interface EmpresaResponsable {
  id_responsable: number;
  id_empresa: number;
  nombre: string;
  cargo: string;
  email: string;
  celular: string;
}

export interface EmpresaResponsableForm {
  nombre: string;
  cargo: string;
  email: string;
  celular: string;
}
