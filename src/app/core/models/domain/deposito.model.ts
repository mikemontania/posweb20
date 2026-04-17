import { Sucursal } from './sucursal.model';
import { TipoDeposito } from './tipo-deposito.model';
export interface Deposito {
  codDeposito: number;
  codDepositoErp: string;
  nombreDeposito: string;
  codEmpresa: number;
  sucursal: Sucursal;
  tipoDeposito: TipoDeposito;
  tipoVenta?: boolean;
}
