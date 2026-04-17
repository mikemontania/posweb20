import { Producto } from './producto.model';
import { Cliente } from './cliente.model';
import { ListaPrecio } from './lista-precio.model';
export interface Bonificacion {
  codBonificacion: number;
  descripcion: string;
  codEmpresa: number;
  codSucursal: number;
  listaPrecio: ListaPrecio;
  tipoBonificacion: string;
  cantDesde: number;
  cantHasta: number;
  activo: boolean;
  fechaDesde: Date;
  fechaHasta: Date;
  producto: Producto;
  cliente: Cliente;
  grpMaterial: string;
  cantBonif: number;
  materialBonif: Producto;
  fechaCreacion: Date;
  fechaModificacion: string;
}
