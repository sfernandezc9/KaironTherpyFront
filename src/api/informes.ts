import client from './client';
import type { Informe, InformeForm, TipoInforme } from '../types/informe';

export const getInformes = async (tipo?: TipoInforme): Promise<Informe[]> => {
  const { data } = await client.get<Informe[]>('/informes', { params: tipo ? { tipo } : {} });
  return data;
};

export const getInforme = async (id: number): Promise<Informe> => {
  const { data } = await client.get<Informe>(`/informes/${id}`);
  return data;
};

export const createInforme = async (form: InformeForm): Promise<Informe> => {
  const { data } = await client.post<Informe>('/informes', form);
  return data;
};

export const updateInforme = async (id: number, form: Partial<InformeForm>): Promise<Informe> => {
  const { data } = await client.put<Informe>(`/informes/${id}`, form);
  return data;
};

export const deleteInforme = async (id: number): Promise<void> => {
  await client.delete(`/informes/${id}`);
};
