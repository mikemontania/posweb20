import { Premio } from './premio.model';
import { Sucursal } from './sucursal.model';
export interface HistorialPremio {
  codigo: number;
  codEmpresa: number;
  codSucursal: number;
  premio: Premio;
  fecha: string;
  operacion: string;
  cantidad: number;
  existencia: number;
  persona: string;
  usuario: string;
  cliente: string;
  sucursal?: Sucursal;
  fechaModificacion: string;
}
