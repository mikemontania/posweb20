import { Cliente } from './cliente.model';
export interface HistorialPunto {
  codigo: number;
  cliente: Cliente;
  ultimoImporte: number;
  nroComprobante: string;
  fechaModificacion: string;
}
