import { Sucursal } from './sucursal.model';
import { ListaPrecio } from './listaPrecio.model';
import { MedioPago } from './medioPago.model';
import { FormaVenta } from './formaVenta.model';

export class Proveedor {
    //  ? significa opcional
    public codProveedor: number;
        public codProveedorErp: string;
        public codEmpresa: number;
        public codUltimaCompra: number;
        public docNro: string;
        public tipoDoc: string;
        public razonSocial: string;
        public alias?: string;
        public direccion?: string;
        public email?: string;
        public obs?: string;
        public activo?: boolean;
        public fechaCreacion?: string;
        public fechaModificacion?: string;
        public latitud?: number;
        public longitud?: number;
        public telefono?: string;
        public concatDocNombre?: string;
        public concatCodNombre?: string;
        public concatCodErpNombre?: string;
    constructor(

       /*  public codProveedor: number,
        public codProveedorErp: string,
        public codEmpresa: number,
        public codUltimaCompra: number,
        public docNro: string,
        public tipoDoc: string,
        public razonSocial: string,
        public alias?: string,
        public direccion?: string,
        public email?: string,
        public obs?: string,
        public activo?: boolean,
        public fechaCreacion?: string,
        public fechaModificacion?: string,
        public latitud?: number,
        public longitud?: number,
        public telefono?: string,
        public concatDocNombre?: string,
        public concatCodNombre?: string,
        public concatCodErpNombre?: string */
    ) { }
}