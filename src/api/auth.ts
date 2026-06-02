import client from './client';
import type { LoginForm, LoginResponse, Usuario } from '../types/auth';

export const login = async (form: LoginForm): Promise<LoginResponse> => {
  const { data } = await client.post<LoginResponse>('/auth/login', form);
  return data;
};

export const getMe = async (): Promise<Usuario> => {
  const { data } = await client.get<Usuario>('/auth/me');
  return data;
};
