import { Producto } from './producto.model';
import { UnidadMedida } from './unidad-medida.model';
export interface RepartoDetalle {
  codRepartoDetalle: number;
  cantidad: number;
  cantidadUnidad: number;
  producto: Producto;
  unidadMedida: UnidadMedida;
  reparto: any; // referencia circular — se resuelve con lazy
  totalKg: number;
  totalGs: number;
}
