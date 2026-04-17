import { Deposito } from './deposito.model';
import { MotivoTransferencia } from './motivo-transferencia.model';
import { TransferenciaDetalle } from './transferencia-detalle.model';
export interface Transferencia {
  codTransferencia: number;
  anulado: boolean;
  codEmpresa: number;
  codUsuarioCreacion: number;
  usuario: string;
  fechaCreacion: Date;
  fecha: string;
  fechaModificacion: string;
  nroComprobante: string;
  depositoEmisor: Deposito;
  depositoReceptor: Deposito;
  totalProducto: number;
  totalTransferencia: number;
  motivoTransferencia: MotivoTransferencia;
  detalle: TransferenciaDetalle[];
}
