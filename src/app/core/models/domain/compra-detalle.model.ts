import { Producto } from './producto.model';
import { UnidadMedida } from './unidad-medida.model';
import { Deposito } from './deposito.model';
export interface CompraDetalle {
  codCompraDetalle: number;
  nroItem: number;
  cantidad: number;
  importeDescuento: number;
  importeIva5: number;
  importeIva10: number;
  importeIvaExenta: number;
  importeNeto: number;
  importePrecio: number;
  importeTotal: number;
  subTotal: number;
  porcDescuento: number;
  porcIva: number;
  producto: Producto;
  unidadMedida: UnidadMedida;
  compra: any; // referencia circular
  deposito: Deposito;
}
