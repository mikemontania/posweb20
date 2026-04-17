import { Cabecera } from './cabecera.model';
import { Venta } from './venta.model';
import { Descuento } from './descuento.model';

export class VentaDescuento {
    //  ? significa opcional
        constructor(
            public codDescuento: number,
            public codVenta: number,
            public codVentaDescuento: number,

        ) { }
    }
