
import { Producto } from './producto.model';
import { Pedido } from './pedido.model';
import { Vendedor } from './vendedor.model';
import { UnidadMedida } from './unidadMedida.model';

export class PedidoDetalle {
    //  ? significa opcional
        constructor(
            public codPedidoDetalle: number,
            public nroItem: number,
            public cantidad: number,
            public importeDescuento: number,
            public importeIva5: number,
            public importeIva10: number,
            public importeIvaExenta: number,
            public importeNeto: number,
            public importePrecio: number,
            public importeTotal: number,
            public subTotal: number,
            public totalKg: number,
            public porcDescuento: number,
            public porcIva: number,
            public producto: Producto,
            public unidadMedida: UnidadMedida,
            public pedido: Pedido,
            public vendedor: Vendedor,
            public codVendedorErp: string,
             public tipoDescuento: string

        ) { }
    }
