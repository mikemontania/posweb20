import { Producto } from './producto.model';
import { UnidadMedida } from './unidad-medida.model';
import { Vendedor } from './vendedor.model';
export interface VentaDetalle {
  codVentaDetalle: number;
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
  totalKg: number;
  porcDescuento: number;
  porcIva: number;
  producto: Producto;
  unidadMedida: UnidadMedida;
  venta: any; // evita circular
  vendedor: Vendedor;
  codVendedorErp: string;
  tipoDescuento: string;
}
