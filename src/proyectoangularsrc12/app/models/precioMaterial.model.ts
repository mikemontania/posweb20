 import { Producto } from './producto.model'; 
import { Sucursal } from './sucursal.model';

export class PrecioMaterial {
    //  ? significa opcional
            public codPrecioMaterial: number;
            public codEmpresa: number;
            public sucursal: Sucursal;
            public producto: Producto;
            public fechaCreacion: Date;
            public fechaModificacion: Date;
            public precioCosto: number;
             constructor( ) { }
    }
