import client from './client';
import type { Terapeuta, TerapeutaForm, TerapeutaSucursal, InformeTerapeuta } from '../types/terapeuta';
import type { Sesion } from '../types/sesion';

export const getTerapeutas = async (): Promise<Terapeuta[]> => {
  const { data } = await client.get<Terapeuta[]>('/terapeutas');
  return data;
};

export const getTerapeutaInforme = async (id: number): Promise<InformeTerapeuta> => {
  const { data } = await client.get<InformeTerapeuta>(`/terapeutas/${id}/informe`);
  return data;
};

export const getTerapeuta = async (id: number): Promise<Terapeuta> => {
  const { data } = await client.get<Terapeuta>(`/terapeutas/${id}`);
  return data;
};

export const getTerapeutaSucursales = async (id: number): Promise<TerapeutaSucursal[]> => {
  const { data } = await client.get<TerapeutaSucursal[]>(`/terapeutas/${id}/sucursales`);
  return data;
};

export const getTerapeutaSesiones = async (
  id: number,
  desde?: string,
  hasta?: string
): Promise<Sesion[]> => {
  const { data } = await client.get<Sesion[]>(`/terapeutas/${id}/sesiones`, {
    params: { desde, hasta },
  });
  return data;
};

export const createTerapeuta = async (form: TerapeutaForm): Promise<Terapeuta> => {
  const { data } = await client.post<Terapeuta>('/terapeutas', form);
  return data;
};

export const updateTerapeuta = async (id: number, form: Partial<TerapeutaForm>): Promise<Terapeuta> => {
  const { data } = await client.put<Terapeuta>(`/terapeutas/${id}`, form);
  return data;
};

export const assignTerapeutaSucursal = async (
  id: number,
  payload: { id_sucursal: number; fecha_inicio: string }
): Promise<void> => {
  await client.post(`/terapeutas/${id}/sucursales`, payload);
};

export const unassignTerapeutaSucursal = async (
  id: number,
  id_sucursal: number,
  fecha_fin: string
): Promise<void> => {
  await client.put(`/terapeutas/${id}/sucursales/${id_sucursal}/desasignar`, { fecha_fin });
};

export const deleteTerapeuta = async (id: number): Promise<void> => {
  await client.delete(`/terapeutas/${id}`);
};
