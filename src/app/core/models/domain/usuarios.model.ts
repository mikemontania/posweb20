import { Rol } from './rol.model';
import { Sucursal } from './sucursal.model';
export interface Usuarios {
  enabled: boolean;
  codUsuario: number;
  nombrePersona: string;
  codPersonaErp: string;
  username: string;
  rol: Rol;
  codEmpresa: number;
  sucursal: Sucursal;
  bloqueado?: boolean;
  intentoFallido?: number;
  createdAt?: Date;
  modifiedAt?: Date;
  createdBy?: string;
  modifiedBy?: string;
  password?: string;
  img?: string;
}
