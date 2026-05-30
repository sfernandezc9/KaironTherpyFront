import client from './client';
import type { Sucursal, SucursalForm } from '../types/sucursal';
import type { Terapeuta } from '../types/terapeuta';
import type { Stock } from '../types/stock';

export const getSucursales = async (): Promise<Sucursal[]> => {
  const { data } = await client.get<Sucursal[]>('/sucursales');
  return data;
};

export const getSucursal = async (id: number): Promise<Sucursal> => {
  const { data } = await client.get<Sucursal>(`/sucursales/${id}`);
  return data;
};

export const getSucursalTerapeutas = async (id: number): Promise<Terapeuta[]> => {
  const { data } = await client.get<Terapeuta[]>(`/sucursales/${id}/terapeutas`);
  return data;
};

export const getSucursalStock = async (id: number): Promise<Stock[]> => {
  const { data } = await client.get<Stock[]>(`/sucursales/${id}/stock`);
  return data;
};

export const createSucursal = async (form: SucursalForm): Promise<Sucursal> => {
  const { data } = await client.post<Sucursal>('/sucursales', form);
  return data;
};

export const updateSucursal = async (id: number, form: Partial<SucursalForm>): Promise<Sucursal> => {
  const { data } = await client.put<Sucursal>(`/sucursales/${id}`, form);
  return data;
};

export const deleteSucursal = async (id: number): Promise<void> => {
  await client.delete(`/sucursales/${id}`);
};
