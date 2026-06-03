export interface Stock {
  id_stock: number;
  id_sucursal: number;
  id_insumo: number;
  nombre_insumo?: string;
  nombre_sucursal?: string;
  unidad_medida?: string;
  cantidad: number;
  cantidad_minima: number;
  stock_bajo: boolean;
}

export interface StockForm {
  id_sucursal: number;
  id_insumo: number;
  cantidad_minima?: number;
}

export interface StockAjuste {
  delta: number;
}

export interface StockProveedor {
  id_stock_proveedor: number;
  id_insumo: number;
  nombre_insumo: string;
  unidad_medida: string;
  cantidad: number;
  cantidad_minima: number;
  stock_bajo: boolean;
  updated_at: string;
}

export interface StockProveedorForm {
  id_insumo: number;
  cantidad?: number;
  cantidad_minima?: number;
}

export interface Transferencia {
  id_transferencia: number;
  id_stock_proveedor: number;
  id_stock: number;
  cantidad: number;
  notas?: string;
  fecha: string;
  nombre_insumo: string;
  unidad_medida: string;
  nombre_sucursal: string;
  realizado_por: string;
}

export interface TransferenciaForm {
  id_stock_proveedor: number;
  id_stock: number;
  cantidad: number;
  notas?: string;
}

export interface TransferenciaFilters {
  id_sucursal?: number;
  id_insumo?: number;
  desde?: string;
  hasta?: string;
}
