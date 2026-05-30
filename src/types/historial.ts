export interface Historial {
  id_historial: number;
  id_ficha: number;
  id_terapeuta: number;
  id_sesion?: number;
  nombre_terapeuta?: string;
  campo_modificado: string;
  valor_anterior: string;
  valor_nuevo: string;
  fecha_modificacion: string;
}
