export type TipoInforme = 'empresa' | 'sucursal' | 'paciente' | 'terapeuta' | 'insumo' | 'general';

export interface Informe {
  id_informe: number;
  titulo: string;
  tipo: TipoInforme;
  id_empresa?: number;
  id_sucursal?: number;
  id_paciente?: number;
  id_terapeuta?: number;
  id_insumo?: number;
  fecha_desde: string;
  fecha_hasta: string;
  contenido: string;
  url_documento?: string;
  generado_por: string;
  fecha_creacion?: string;
}

export interface InformeForm {
  titulo: string;
  tipo: TipoInforme;
  id_empresa?: number;
  id_sucursal?: number;
  id_paciente?: number;
  id_terapeuta?: number;
  id_insumo?: number;
  fecha_desde: string;
  fecha_hasta: string;
  contenido: string;
  url_documento?: string;
  generado_por: string;
}
