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
  const { data } = await client.get<Array<SesionInsumo & { id?: number }>>(`/sesiones/${id}/insumos`);
  return data.map((i) => ({ ...i, id_uso: i.id_uso ?? i.id ?? 0 }));
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

export const uploadSesionArchivo = async (
  id: number,
  file: File
): Promise<{ archivo_nombre: string; archivo_path: string }> => {
  const form = new FormData();
  form.append('archivo', file);
  const { data } = await client.post(`/sesiones/${id}/archivo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const downloadSesionArchivo = async (id: number, archivo_nombre: string): Promise<void> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:3000/api/sesiones/${id}/archivo`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error ?? 'Error al descargar archivo');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = archivo_nombre;
  a.click();
  URL.revokeObjectURL(url);
};

export const deleteSesionArchivo = async (id: number): Promise<void> => {
  await client.delete(`/sesiones/${id}/archivo`);
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
