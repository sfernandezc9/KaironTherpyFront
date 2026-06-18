import client from './client';
import type { Sucursal, SucursalForm, Responsable, ResponsableForm } from '../types/sucursal';
import type { Terapeuta } from '../types/terapeuta';
import type { Stock } from '../types/stock';
import type { Paciente } from '../types/paciente';

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

export const getSucursalPacientes = async (id: number): Promise<Pick<Paciente, 'id_paciente' | 'rut' | 'nombres' | 'apellidos' | 'email' | 'telefono'>[]> => {
  const { data } = await client.get(`/sucursales/${id}/pacientes`);
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

// Responsables
export const getSucursalResponsables = async (id: number): Promise<Responsable[]> => {
  const { data } = await client.get<Responsable[]>(`/sucursales/${id}/responsables`);
  return data;
};

export const createResponsable = async (id_sucursal: number, form: ResponsableForm): Promise<Responsable> => {
  const { data } = await client.post<Responsable>(`/sucursales/${id_sucursal}/responsables`, form);
  return data;
};

export const updateResponsable = async (id_sucursal: number, id_responsable: number, form: ResponsableForm): Promise<Responsable> => {
  const { data } = await client.put<Responsable>(`/sucursales/${id_sucursal}/responsables/${id_responsable}`, form);
  return data;
};

export const deleteResponsable = async (id_sucursal: number, id_responsable: number): Promise<void> => {
  await client.delete(`/sucursales/${id_sucursal}/responsables/${id_responsable}`);
};
