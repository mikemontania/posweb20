import { Producto } from './producto.model';
import { UnidadMedida } from './unidad-medida.model';
export interface TransferenciaDetalle {
  codTransferenciaDetalle: number;
  transferencia: any; // referencia circular
  producto: Producto;
  unidadMedida: UnidadMedida;
  nroItem: number;
  cantidadTransferencia: number;
  emisorInicio: number;
  emisorFin: number;
  receptorInicio: number;
  receptorFin: number;
}
