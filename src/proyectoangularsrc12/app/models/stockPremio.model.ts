 
import { Premio } from './premio.model ';
import { Sucursal } from './sucursal.model';

export class StockPremio {
    //  ? significa opcional
            public codStockPremio: number; 
            public premio: Premio;
            public codEmpresa: number;
            public codSucursal: number;
             public existencia: number;
            public comprometido: number;
            public minimo: number;
            public sucursal?: Sucursal;
            constructor( ) { }
    }
 