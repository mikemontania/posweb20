import { TipoPrecio } from './tipo-precio.model';
import { Producto } from './producto.model';
import { Cliente } from './cliente.model';
import { ListaPrecio } from './lista-precio.model';
import { UnidadMedida } from './unidad-medida.model';
export interface Precio {
  codPrecio: number;
  codPrecioErp: string;
  codEmpresa: number;
  tipoPrecio: TipoPrecio;
  producto: Producto;
  unidadMedida: UnidadMedida;
  cliente: Cliente;
  listaPrecio: ListaPrecio;
  fechaDesde: Date;
  fechaHasta: Date;
  cantDesde: number;
  cantHasta: number;
  precio: number;
  activo: boolean;
}
