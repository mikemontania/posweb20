 import { Producto } from './producto.model'; 
import { Sucursal } from './sucursal.model';

export class Material {

            public codProducto: number;
            public codEmpresa: number;
            public codSucursalErp: string;
            public sucursal: string;
            public codProductoErp: string;
            public codBarra: string;
            public producto: string;
            public fechaCreacion: Date;
            public fechaModificacion: Date;
            public precioCosto: number;
             constructor( ) { }
    }
