import { Sucursal } from './sucursal.model';
import { TipoDeposito } from './tipoDeposito.model';
export class Deposito {
            public codDeposito: number;
            public codDepositoErp: string;
            public nombreDeposito: string;
            public codEmpresa: number;
            public sucursal: Sucursal;
            public tipoDeposito: TipoDeposito;
            public tipoVenta?: boolean;

            constructor() { }
    }
