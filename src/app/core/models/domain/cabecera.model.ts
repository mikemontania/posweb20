import { Cliente } from './cliente.model';
export interface Cabecera {
  cod: number;
  cliente: Cliente;
  fecha: string;
  total: number;
}
