import { Terminales } from './terminales.model';
export interface Comprobantes {
  codNumeracion: number;
  codEmpresa: number;
  codSucursal: number;
  terminal: Terminales;
  tipoComprobante: string;
  tipoImpresion: string;
  timbrado: string;
  inicioTimbrado: string;
  finTimbrado: string;
  serie: string;
  ultimoNumero: number;
  numeroInicio: number;
  numeroFin: number;
  maxItems: number;
  activo: boolean;
  autoImpresor: boolean;
  nroComprobante: string;
}
