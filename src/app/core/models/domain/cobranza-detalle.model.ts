import { MedioPago } from './medio-pago.model';
import { TipoMedioPago } from './tipo-medio-pago.model';
import { Bancos } from './bancos.model';
export interface CobranzaDetalle {
  codCobranzaDetalle: number;
  importeAbonado: number;
  importeCobrado: number;
  saldo: number;
  medioPago: MedioPago;
  tipoMedioPago: TipoMedioPago;
  fechaEmision: string;
  fechaVencimiento: string;
  nroRef: string;
  banco: Bancos;
  nroCuenta: string;
}
