import { Cliente } from './cliente.model';
import { PedidoDetalle } from './PedidoDetalle.model';
import { Cobranza } from './cobranza.model';
import { Vendedor } from './vendedor.model';
import { Orden } from './orden.model';
import { ListaPrecio } from './listaPrecio.model';
import { Canal } from './canales.model';


export class Pedido {
    //  ? significa opcional
    constructor(
        public codPedido: number,
        public anulado: boolean,
        public codEmpresaErp: string,
        public codSucursalErp: string,
        public codVendedorErp: string,
        public listaPrecio :ListaPrecio,
        public codEmpresa: number,
        public codSucursal: number,
        public estado: string,
        public modoEntrega: string,
        public observacion: string,
        public fechaAnulacion: Date,
        public fechaCreacion: Date,
        public fechaPedido: string,
         public fechaPedidoReal: string,
        public fechaModificacion: string,
        public porcDescuento: number,
        public importeDescuento: number,
        public importeIva5: number,
        public importeIva10: number,
        public importeIvaExenta: number,
        public importeNeto: number,
        public importeTotal: number,
        public descuentoProducto: number,
        public subTotal: number,
        public totalKg: number,
        public nroPedido: number,
        public codUsuarioAnulacion: number,
        public codUsuarioCreacion: number,
        public cliente: Cliente,
        public canal: Canal,
        public detalle: PedidoDetalle[],
        public cobranza: Cobranza,
        public vendedor: Vendedor,
        public tipoPedido: string,
        public cupon: string,
        public contrasena?: string,
        public orden?: Orden,
        public codReparto?: number,
        public codOrdenAbi?: number,
        public codPuntoRetiro?: number,
        public fechaRetiro?: string,
    ) { }
}
