import { Usuarios } from './usuarios.model';
export interface Vendedor {
  codVendedor: number;
  codVendedorErp: string;
  codSupervisorErp: string;
  tipo: string;
  vendedor: string;
  docNro: string;
  codEmpresa: number;
  usuario: Usuarios;
  porcentajeComision?: number;
  grupo?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  tarjeta?: string;
  obs?: string;
  activo?: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  concatDocNombre?: string;
}
