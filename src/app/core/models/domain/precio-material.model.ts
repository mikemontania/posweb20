import { Producto } from './producto.model';
import { Sucursal } from './sucursal.model';
export interface PrecioMaterial {
  codPrecioMaterial: number;
  codEmpresa: number;
  sucursal: Sucursal;
  producto: Producto;
  fechaCreacion: Date;
  fechaModificacion: Date;
  precioCosto: number;
}
