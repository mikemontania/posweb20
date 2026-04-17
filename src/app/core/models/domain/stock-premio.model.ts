import { Premio } from './premio.model';
import { Sucursal } from './sucursal.model';
export interface StockPremio {
  codStockPremio: number;
  premio: Premio;
  codEmpresa: number;
  codSucursal: number;
  existencia: number;
  comprometido: number;
  minimo: number;
  sucursal?: Sucursal;
}
