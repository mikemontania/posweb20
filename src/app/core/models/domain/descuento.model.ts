import { Producto } from './producto.model';
import { Cliente } from './cliente.model';
import { MedioPago } from './medio-pago.model';
import { ListaPrecio } from './lista-precio.model';
export interface Descuento {
  codDescuento: number;
  descripcion: string;
  codDescuentoErp: string;
  codEmpresa: number;
  codSucursal: number;
  listaPrecio: ListaPrecio;
  tipoDescuento: string;
  unidadDescuento: string;
  fechaDesde: Date;
  fechaHasta: Date;
  producto: Producto;
  cliente: Cliente;
  medioPago: MedioPago;
  descuento: number;
  cantDesde: number;
  cantHasta: number;
  activo: boolean;
  comprasDisponibles?: number;
}
