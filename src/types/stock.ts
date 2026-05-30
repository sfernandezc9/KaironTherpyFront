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
  cantidad: number;
  cantidad_minima: number;
}

export interface StockAjuste {
  delta: number;
}
