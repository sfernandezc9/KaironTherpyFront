import client from './client';
import type { Empresa, EmpresaForm } from '../types/empresa';
import type { Sucursal } from '../types/sucursal';

export const getEmpresas = async (): Promise<Empresa[]> => {
  const { data } = await client.get<Empresa[]>('/empresas');
  return data;
};

export const getEmpresa = async (id: number): Promise<Empresa> => {
  const { data } = await client.get<Empresa>(`/empresas/${id}`);
  return data;
};

export const getEmpresaSucursales = async (id: number): Promise<Sucursal[]> => {
  const { data } = await client.get<Sucursal[]>(`/empresas/${id}/sucursales`);
  return data;
};

export const createEmpresa = async (form: EmpresaForm): Promise<Empresa> => {
  const { data } = await client.post<Empresa>('/empresas', form);
  return data;
};

export const updateEmpresa = async (id: number, form: EmpresaForm): Promise<Empresa> => {
  const { data } = await client.put<Empresa>(`/empresas/${id}`, form);
  return data;
};

export const deleteEmpresa = async (id: number): Promise<void> => {
  await client.delete(`/empresas/${id}`);
};
