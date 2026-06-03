import client from './client';
import type {
  Stock, StockForm, StockAjuste,
  StockProveedor, StockProveedorForm,
  Transferencia, TransferenciaForm, TransferenciaFilters,
} from '../types/stock';

// --- Stock Sucursal ---

export const getStock = async (): Promise<Stock[]> => {
  const { data } = await client.get<Stock[]>('/stock');
  return data;
};

export const getStockBajoMinimo = async (): Promise<Stock[]> => {
  const { data } = await client.get<Stock[]>('/stock/bajo-minimo');
  return data;
};

export const createStock = async (form: StockForm): Promise<{ id_stock: number }> => {
  const { data } = await client.post<{ id_stock: number }>('/stock', form);
  return data;
};

export const ajustarStock = async (id: number, ajuste: StockAjuste): Promise<{ cantidad_nueva: number }> => {
  const { data } = await client.patch<{ cantidad_nueva: number }>(`/stock/${id}/ajustar`, ajuste);
  return data;
};

export const deleteStock = async (id: number): Promise<void> => {
  await client.delete(`/stock/${id}`);
};

// --- Stock Proveedor ---

export const getStockProveedor = async (): Promise<StockProveedor[]> => {
  const { data } = await client.get<StockProveedor[]>('/stock/proveedor');
  return data;
};

export const createStockProveedor = async (form: StockProveedorForm): Promise<{ id_stock_proveedor: number }> => {
  const { data } = await client.post<{ id_stock_proveedor: number }>('/stock/proveedor', form);
  return data;
};

export const ajustarStockProveedor = async (id: number, delta: number): Promise<{ cantidad_nueva: number }> => {
  const { data } = await client.patch<{ cantidad_nueva: number }>(`/stock/proveedor/${id}/ajustar`, { delta });
  return data;
};

// --- Transferencias ---

export const transferirStock = async (form: TransferenciaForm): Promise<{ id_transferencia: number; mensaje: string }> => {
  const { data } = await client.post<{ id_transferencia: number; mensaje: string }>('/stock/transferir', form);
  return data;
};

export const getTransferencias = async (filters: TransferenciaFilters = {}): Promise<Transferencia[]> => {
  const cleaned = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''));
  const { data } = await client.get<Transferencia[]>('/stock/transferencias', { params: cleaned });
  return data;
};
