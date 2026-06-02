import client from './client';
import type { Sesion, SesionForm, SesionFilters, SesionInsumo, SesionInsumoForm } from '../types/sesion';
import type { Stock } from '../types/stock';

export const getSesiones = async (filters: SesionFilters = {}): Promise<Sesion[]> => {
  const { data } = await client.get<Sesion[]>('/sesiones', { params: filters });
  return data;
};

export const getSesion = async (id: number): Promise<Sesion> => {
  const { data } = await client.get<Sesion>(`/sesiones/${id}`);
  return data;
};

export const getSesionInsumos = async (id: number): Promise<SesionInsumo[]> => {
  const { data } = await client.get<SesionInsumo[]>(`/sesiones/${id}/insumos`);
  return data;
};

export const createSesion = async (form: SesionForm): Promise<Sesion> => {
  const { data } = await client.post<Sesion>('/sesiones', form);
  return data;
};

export const updateSesion = async (id: number, form: Partial<SesionForm>): Promise<Sesion> => {
  const { data } = await client.put<Sesion>(`/sesiones/${id}`, form);
  return data;
};

export const addSesionInsumo = async (
  id: number,
  form: SesionInsumoForm
): Promise<SesionInsumo> => {
  const { data } = await client.post<SesionInsumo>(`/sesiones/${id}/insumos`, form);
  return data;
};

export const removeSesionInsumo = async (id: number, id_uso: number): Promise<void> => {
  await client.delete(`/sesiones/${id}/insumos/${id_uso}`);
};

export const deleteSesion = async (id: number): Promise<void> => {
  await client.delete(`/sesiones/${id}`);
};

export const getStockSucursalSesion = async (id_sucursal: number): Promise<Stock[]> => {
  const { data } = await client.get<Array<{
    id_stock: number;
    id_insumo: number;
    nombre: string;
    unidad_medida: string;
    cantidad: number;
    cantidad_minima: number;
  }>>(`/sesiones/stock-sucursal/${id_sucursal}`);
  return data.map((s) => ({
    id_stock: s.id_stock,
    id_sucursal,
    id_insumo: s.id_insumo,
    nombre_insumo: s.nombre,
    unidad_medida: s.unidad_medida,
    cantidad: s.cantidad,
    cantidad_minima: s.cantidad_minima,
    stock_bajo: false,
  }));
};
