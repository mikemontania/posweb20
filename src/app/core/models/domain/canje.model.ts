import { Cliente } from './cliente.model';
import { CanjeDet } from './canje-det.model';
export interface Canje {
  codCanje: number;
  codEmpresaErp: string;
  codSucursalErp: string;
  codEmpresa: number;
  codSucursal: number;
  cliente: Cliente;
  nroCanje: number;
  fechaCanje: string;
  puntos: number;
  estado: string;
  codUsuarioAnulacion: number;
  codUsuarioCreacion: number;
  fechaCreacion: Date;
  fechaModificacion: string;
  anulado: boolean;
  fechaAnulacion: Date;
  detalle: CanjeDet[];
}
