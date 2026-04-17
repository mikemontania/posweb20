import { Producto } from './producto.model';
import { Deposito } from './deposito.model';
import { UnidadMedida } from './unidadMedida.model';

export class Stock {
    //  ? significa opcional
            public codStock: number;
            public deposito: Deposito;
            public unidadMedida: UnidadMedida;
            public producto: Producto;
            public codEmpresa: number;
            public codSucursal: number;
             public existencia: number;
            public comprometido: number;
            public minimo: number;
            constructor( ) { }
    }
