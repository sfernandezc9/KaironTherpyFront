import client from './client';
import type { Empresa, EmpresaForm, EmpresaResponsable, EmpresaResponsableForm } from '../types/empresa';
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

// Responsables
export const getEmpresaResponsables = async (id: number): Promise<EmpresaResponsable[]> => {
  const { data } = await client.get<EmpresaResponsable[]>(`/empresas/${id}/responsables`);
  return data;
};

export const createEmpresaResponsable = async (id_empresa: number, form: EmpresaResponsableForm): Promise<EmpresaResponsable> => {
  const { data } = await client.post<EmpresaResponsable>(`/empresas/${id_empresa}/responsables`, form);
  return data;
};

export const updateEmpresaResponsable = async (id_empresa: number, id_responsable: number, form: EmpresaResponsableForm): Promise<EmpresaResponsable> => {
  const { data } = await client.put<EmpresaResponsable>(`/empresas/${id_empresa}/responsables/${id_responsable}`, form);
  return data;
};

export const deleteEmpresaResponsable = async (id_empresa: number, id_responsable: number): Promise<void> => {
  await client.delete(`/empresas/${id_empresa}/responsables/${id_responsable}`);
};
