import { Chofer } from './chofer.model';
import { Vehiculo } from './vehiculo.model';
import { RepartoDetalle } from './reparto-detalle.model';
import { RepartoDocs } from './reparto-docs.model';
export interface Reparto {
  codReparto: number;
  codEmpresa: number;
  codSucursal: number;
  anulado: boolean;
  chofer: Chofer;
  ayudante1: Chofer;
  ayudante2: Chofer;
  vehiculo: Vehiculo;
  codUsuarioCreacion: number;
  fechaReparto: string;
  totalKg: number;
  totalGs: number;
  usuarioCreacion: string;
  obs?: string;
  documento?: RepartoDocs[];
  detalle?: RepartoDetalle[];
  fechaCreacion?: Date;
  usuarioModificacion?: string;
  fechaModificacion?: string;
}
