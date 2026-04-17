import { Cabecera } from './cabecera.model';
export interface Detalles {
  cod: number;
  codProducto: number;
  codProductoErp: string;
  cantidad: number;
  precio: number;
  descuento: number;
  total: number;
  cabecera: Cabecera;
  codBarra: string;
  nombreProducto: string;
}
