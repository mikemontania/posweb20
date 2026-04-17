import { ListaPrecio } from './lista-precio.model';
import { Producto } from './producto.model';
export interface Punto {
  codPunto: number;
  codEmpresa: number;
  codSucursal: number;
  listaPrecio: ListaPrecio;
  activo: boolean;
  descripcion: string;
  importeDesde: number;
  importeHasta: number;
  puntos: number;
  fechaDesde: Date;
  fechaHasta: Date;
  tipo: string;
  producto: Producto;
}
