import client from './client';
import type { LoginForm, LoginResponse, Usuario, UsuarioAdmin, CreateUsuarioForm } from '../types/auth';

export const login = async (form: LoginForm): Promise<LoginResponse> => {
  const { data } = await client.post<LoginResponse>('/auth/login', form);
  return data;
};

export const getMe = async (): Promise<Usuario> => {
  const { data } = await client.get<Usuario>('/auth/me');
  return data;
};

export const logout = async (): Promise<void> => {
  await client.post('/auth/logout');
};

export const getUsuarios = async (): Promise<UsuarioAdmin[]> => {
  const { data } = await client.get<UsuarioAdmin[]>('/auth/usuarios');
  return data;
};

export const createUsuario = async (form: CreateUsuarioForm): Promise<{ id_usuario: number; email: string; rol: string }> => {
  const { data } = await client.post('/auth/usuarios', form);
  return data;
};

export const deactivateUsuario = async (id: number): Promise<void> => {
  await client.put(`/auth/usuarios/${id}/desactivar`);
};

export const adminResetPassword = async (id: number, password_nuevo: string): Promise<void> => {
  await client.put(`/auth/usuarios/${id}/password`, { password_nuevo });
};
