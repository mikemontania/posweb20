import { Premio } from "./premio.model ";
import { Sucursal } from "./sucursal.model";

 
export class HistorialPremio {
            public codigo: number;
            public codEmpresa: number;
            public codSucursal: number;
            public premio: Premio;
            public fecha: string;
            public operacion: string;
            public cantidad: number;
            public existencia: number;
            public persona: string;
            public usuario: string;
            public cliente: string;
            public sucursal?: Sucursal;
        public fechaModificacion: string;
            constructor() { }
    }
  