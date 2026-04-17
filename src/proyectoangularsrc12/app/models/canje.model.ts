import { Cliente } from './cliente.model';
import { CanjeDet } from './canjeDet.model';


export class Canje {
    //  ? significa opcional
    constructor(
        public codCanje: number,
        public codEmpresaErp: string,
        public codSucursalErp: string,
        public codEmpresa: number,
        public codSucursal: number,
        public cliente: Cliente,
        public nroCanje: number,
        public fechaCanje: string,
        public puntos: number,
        public estado: string,
        public codUsuarioAnulacion: number,
        public codUsuarioCreacion: number,
        public fechaCreacion: Date,
        public fechaModificacion: string,
        public anulado: boolean,
        public fechaAnulacion: Date,
        public detalle: CanjeDet[],
    ) { }
}
