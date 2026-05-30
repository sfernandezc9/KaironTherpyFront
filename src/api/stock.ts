import client from './client';
import type { Stock, StockForm, StockAjuste } from '../types/stock';

export const getStock = async (): Promise<Stock[]> => {
  const { data } = await client.get<Stock[]>('/stock');
  return data;
};

export const getStockBajoMinimo = async (): Promise<Stock[]> => {
  const { data } = await client.get<Stock[]>('/stock/bajo-minimo');
  return data;
};

export const getStockItem = async (id: number): Promise<Stock> => {
  const { data } = await client.get<Stock>(`/stock/${id}`);
  return data;
};

export const createStock = async (form: StockForm): Promise<Stock> => {
  const { data } = await client.post<Stock>('/stock', form);
  return data;
};

export const updateStock = async (
  id: number,
  form: { cantidad: number; cantidad_minima: number }
): Promise<Stock> => {
  const { data } = await client.put<Stock>(`/stock/${id}`, form);
  return data;
};

export const ajustarStock = async (id: number, ajuste: StockAjuste): Promise<Stock> => {
  const { data } = await client.patch<Stock>(`/stock/${id}/ajustar`, ajuste);
  return data;
};

export const deleteStock = async (id: number): Promise<void> => {
  await client.delete(`/stock/${id}`);
};
