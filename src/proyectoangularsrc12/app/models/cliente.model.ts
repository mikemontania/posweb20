import { Sucursal } from './sucursal.model';
import { ListaPrecio } from './listaPrecio.model';
import { MedioPago } from './medioPago.model';
import { FormaVenta } from './formaVenta.model';
import { GrupoDescuento } from './grupoDescuento.model';

export class Cliente {
    //  ? significa opcional
    public codCliente: number;
    public codClienteErp: string;
    public razonSocial: string;
    public tipoDoc: string;
    public docNro: string;
    public codEmpresa: number;
    public latitud: number;
    public longitud: number;
    public sucursalPref: Sucursal;
    public listaPrecio: ListaPrecio;
    public medioPagoPref: MedioPago;
    public formaVentaPref: FormaVenta;
    public grupoDescuento: GrupoDescuento;
    public carnetGrupo: string;
    public carnetVencimiento: string;
    public categoria?: string;
    public grupo?: string;
    public zona?: string;
    public direccion?: string;
    public telefono?: string;
    public email?: string;
    public web?: string;
    public catABC?: string;
    public obs?: string;
    public activo?: boolean;
    public codeBarra?: boolean;
    public diasCredito?: number;
    public fechaCreacion?: string;
    public fechaModificacion?: string;
    public codUltimaVenta: number;
    public excentoIva?: boolean;
    public concatCodErpNombre?: string;
    public concatCodNombre?: string;
    public concatDocNombre?: string;
    public predeterminado?: boolean;
    public esPropietario?: boolean;
    public empleado?: boolean;
    public puntos?: number;
    constructor() { }
}
