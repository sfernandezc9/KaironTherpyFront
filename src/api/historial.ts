import client from './client';
import type { Historial } from '../types/historial';

export interface HistorialFilters {
  id_ficha?: number;
  id_terapeuta?: number;
  campo?: string;
}

export const getHistorial = async (filters: HistorialFilters = {}): Promise<Historial[]> => {
  const { data } = await client.get<Historial[]>('/historial', { params: filters });
  return data;
};

export const getHistorialItem = async (id: number): Promise<Historial> => {
  const { data } = await client.get<Historial>(`/historial/${id}`);
  return data;
};
