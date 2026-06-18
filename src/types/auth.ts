export type Rol = 'administrador' | 'terapeuta';

export interface SucursalAsignada {
  id_sucursal: number;
  nombre: string;
  direccion: string;
  fecha_inicio: string;
  fecha_fin: string | null;
}

export interface Usuario {
  id_usuario: number;
  email: string;
  rol: Rol;
  nombres: string;
  apellidos: string;
  rut?: string;
  telefono?: string;
  id_terapeuta?: number;
  sucursales?: SucursalAsignada[];
}

export interface UsuarioAdmin {
  id_usuario: number;
  email: string;
  rol: Rol;
  activo: boolean;
  ultimo_login: string | null;
  nombres: string;
  apellidos: string;
  rut: string;
}

export interface CreateUsuarioForm {
  id_persona: number;
  email: string;
  password: string;
  rol: Rol;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}
