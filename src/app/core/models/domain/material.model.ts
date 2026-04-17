import { Sucursal } from './sucursal.model';
export interface Material {
  codProducto: number;
  codEmpresa: number;
  codSucursalErp: string;
  sucursal: string;
  codProductoErp: string;
  codBarra: string;
  producto: string;
  fechaCreacion: Date;
  fechaModificacion: Date;
  precioCosto: number;
}
