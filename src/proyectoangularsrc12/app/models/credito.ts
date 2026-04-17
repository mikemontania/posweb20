import { Cliente } from "./cliente.model";
import { Venta } from "./venta.model";

export interface Credito {
  codCredito: number;
  codEmpresa: number;
  venta: Venta;
  cliente: Cliente;
  fecha: string; // Formato 'yyyy-MM-dd'
  fechaCreacion: string; // Formato 'yyyy-MM-dd HH:mm:ss'
  fechaModificacion?: string; // Opcional, ya que puede no estar presente
  codUsuarioCreacion: number;
  timbrado: string;
  nroComprobante: string;
  cantDias: number;
  fechaVencimiento: string; // Formato 'yyyy-MM-dd'
  importeTotal: number;
  saldoPendiente: number;
  anulado: boolean;
  estado: EstadoCredito;
  fechaPago?: string; // Opcional, puede ser null
  diasMora: number; // Se calcula en el backend y se recibe como JSON
}

// Definición de EstadoCredito como un enum
export enum EstadoCredito {
  PAGADO = 'PAGADO',
  PENDIENTE = 'PENDIENTE'
}

