import { Empresas } from './empresas.model';
import { Sucursal } from './sucursal.model';
export interface Premio {
  codPremio: number;
  empresa: Empresas;
  codPremioErp: string;
  descripcion: string;
  codBarra: string;
  activo: boolean;
  puntos: number;
  img: string;
  obs: string;
  inventariable: boolean;
  descuento?: number;
  sucursal?: Sucursal;
}
