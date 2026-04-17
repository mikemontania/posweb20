import { CobranzaDetalle } from './cobranza-detalle.model';
export interface Cobranza {
  anulado: boolean;
  codCobranza: number;
  importeCobrado: number;
  importeAbonado: number;
  fechaCobranza: string;
  saldo: number;
  detalle: CobranzaDetalle[];
  tipo: string;
}
