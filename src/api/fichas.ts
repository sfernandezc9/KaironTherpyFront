import client from './client';
import type { Ficha, FichaForm, FichaUpdateForm, FichaHistorial } from '../types/ficha';

export const getFichas = async (): Promise<Ficha[]> => {
  const { data } = await client.get<Ficha[]>('/fichas');
  return data;
};

export const getFicha = async (id: number): Promise<Ficha> => {
  const { data } = await client.get<Ficha>(`/fichas/${id}`);
  return data;
};

export const getFichaHistorial = async (id: number): Promise<FichaHistorial[]> => {
  const { data } = await client.get<FichaHistorial[]>(`/fichas/${id}/historial`);
  return data;
};

export const createFicha = async (form: FichaForm): Promise<Ficha> => {
  const { data } = await client.post<Ficha>('/fichas', form);
  return data;
};

export const updateFicha = async (id: number, form: FichaUpdateForm): Promise<Ficha> => {
  const { data } = await client.put<Ficha>(`/fichas/${id}`, form);
  return data;
};
