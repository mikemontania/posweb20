 import { Usuarios } from './usuarios.model';

export class Vendedor {
    //  ? significa opcional
    public codVendedor: number;
    public codVendedorErp: string;
    public codSupervisorErp: string;
    public tipo: string;
    public vendedor: string;
    public docNro: string;
    public codEmpresa: number;
    public usuario: Usuarios;
    public porcentajeComision?: number;
    public grupo?: string;
    public direccion?: string;
    public telefono?: string;
    public email?: string;
    public tarjeta?: string;
    public obs?: string;
    public activo?: boolean;
    public fechaCreacion?: string;
    public fechaModificacion?: string;
    public concatDocNombre?: string;
     constructor() { }
}
