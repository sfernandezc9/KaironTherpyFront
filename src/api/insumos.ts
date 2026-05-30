import client from './client';
import type { Insumo, InsumoForm } from '../types/insumo';
import type { Stock } from '../types/stock';

export const getInsumos = async (): Promise<Insumo[]> => {
  const { data } = await client.get<Insumo[]>('/insumos');
  return data;
};

export const getInsumo = async (id: number): Promise<Insumo> => {
  const { data } = await client.get<Insumo>(`/insumos/${id}`);
  return data;
};

export const getInsumoStock = async (id: number): Promise<Stock[]> => {
  const { data } = await client.get<Stock[]>(`/insumos/${id}/stock`);
  return data;
};

export const createInsumo = async (form: InsumoForm): Promise<Insumo> => {
  const { data } = await client.post<Insumo>('/insumos', form);
  return data;
};

export const updateInsumo = async (id: number, form: InsumoForm): Promise<Insumo> => {
  const { data } = await client.put<Insumo>(`/insumos/${id}`, form);
  return data;
};

export const deleteInsumo = async (id: number): Promise<void> => {
  await client.delete(`/insumos/${id}`);
};
