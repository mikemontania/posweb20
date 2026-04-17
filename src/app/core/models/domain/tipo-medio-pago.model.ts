import { MedioPago } from './medio-pago.model';
export interface TipoMedioPago {
  codTipoMedioPago: number;
  codTipoMedioPagoErp: string;
  descripcion: string;
  codEmpresa: number;
  medioPago: MedioPago;
}
