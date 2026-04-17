import { StockPremioDetalle } from './stock-premio-det.model';
import { Sucursal } from './sucursal.model';
export interface StockPremioCab {
  codStockPremioCab: number;
  codEmpresa: number;
  codSucursal: number;
  operacion: string;
  usuario: string;
  codUsuario: number;
  nroComprobante: string;
  fecha: string;
  cantidadItems: number;
  fechaCreacion: string;
  fechaModificacion: string;
  detalle: StockPremioDetalle[];
  sucursal?: Sucursal[];
}
