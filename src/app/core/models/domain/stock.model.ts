import { Producto } from './producto.model';
import { Deposito } from './deposito.model';
import { UnidadMedida } from './unidad-medida.model';
export interface Stock {
  codStock: number;
  deposito: Deposito;
  unidadMedida: UnidadMedida;
  producto: Producto;
  codEmpresa: number;
  codSucursal: number;
  existencia: number;
  comprometido: number;
  minimo: number;
}
