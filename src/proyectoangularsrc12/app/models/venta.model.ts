import { Cabecera } from './cabecera.model';
import { Cliente } from './cliente.model';
 import { FormaVenta } from './formaVenta.model';
import { VentaDetalle } from './VentaDetalle.model';
import { TerminalVenta } from './terminalVenta.model';
import { Cobranza } from './cobranza.model';
import { MotivoAnulacion } from './motivoAnulacion.model';
import { Pedido } from './pedido.model';
import { Deposito } from './deposito.model';
import { Vendedor } from './vendedor.model';
import { ListaPrecio } from './listaPrecio.model';
import { Canal } from './canales.model';

export class Venta {
    //  ? significa opcional
        constructor(
            public codVenta: number,
            public codEmpresaErp: string,
            public codSucursalErp: string,
            public codVendedorErp: string,
            public listaPrecio :ListaPrecio,
            public anulado: boolean,
            public codEmpresa: number,
            public codSucursal: number,
            public estado: string,
            public modoEntrega: string,
            public fechaAnulacion: Date,
            public fechaCreacion: Date,
            public fechaVencimiento: Date,
            public fechaVenta: string,
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
            public timbrado: string,
            public inicioTimbrado: string,
            public finTimbrado: string,
            public codUsuarioAnulacion: number,
            public nroComprobante: string,
            public tipoComprobante: string,
            public terminalVenta: TerminalVenta,
            public deposito: Deposito,
            public codUsuarioCreacion: number,
            public cliente: Cliente,
            public pedido: Pedido,
            public formaVenta: FormaVenta,
            public detalle: VentaDetalle[],
            public motivoAnulacion: MotivoAnulacion,
            public esObsequio: boolean,
            public editable: boolean,
            public cobranza: Cobranza,
            public vendedor: Vendedor,
            public tipoVenta: string,
            public canal: Canal,
            public cupon: string,
            public codReparto?: number,
            public totalPuntos?: number,
            public puntosObtenidos?: number,
        ) { }
    }
