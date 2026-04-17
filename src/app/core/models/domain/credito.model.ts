import { Cliente } from './cliente.model';
export interface Credito {
  codCredito: number;
  codEmpresa: number;
  cliente: Cliente;
  fecha: string;
  fechaCreacion: string;
  fechaModificacion?: string;
  codUsuarioCreacion: number;
  timbrado: string;
  nroComprobante: string;
  cantDias: number;
  fechaVencimiento: string;
  importeTotal: number;
  saldoPendiente: number;
  anulado: boolean;
  estado: EstadoCredito;
  fechaPago?: string;
  diasMora: number;
}
export enum EstadoCredito {
  PAGADO = 'PAGADO',
  PENDIENTE = 'PENDIENTE',
}
