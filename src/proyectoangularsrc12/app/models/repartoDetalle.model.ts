import { Producto } from './producto.model';
 import { Reparto } from './reparto.model';
import { UnidadMedida } from './unidadMedida.model';

 

export class RepartoDetalle {
    //  ? significa opcional
        constructor(
            public codRepartoDetalle: number,
            public cantidad: number,
            public cantidadUnidad: number,
            public producto: Producto,
            public unidadMedida: UnidadMedida,
            public reparto: Reparto,
            public totalKg: number,
            public totalGs: number

        ) { }
    }