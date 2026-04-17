import { Cabecera } from './cabecera.model';

export class Detalles {
    //  ? significa opcional
        constructor(
            public cod: number,
            public codProducto: number,
            public codProductoErp: string,
            public cantidad: number,
            public precio: number,
            public descuento: number,
            public total: number,
            public cabecera: Cabecera,
            public codBarra: string,
            public nombreProducto: string

        ) { }
    }
