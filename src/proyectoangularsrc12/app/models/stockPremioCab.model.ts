

import { StockPremioDetalle } from './stockPremioDet.model';
import { Sucursal } from './sucursal.model';

export class  StockPremioCab {
  codStockPremioCab: number;
  codEmpresa: number;
  codSucursal: number;
  operacion: string;
  usuario: string;
  codUsuario: number;
  nroComprobante: string;
  fecha: string; // Puedes utilizar LocalDate o convertirlo a un formato de fecha adecuado
  cantidadItems: number;
  fechaCreacion: string; // Utiliza un formato de fecha adecuado
  fechaModificacion: string; // Utiliza un formato de fecha adecuado
  detalle: StockPremioDetalle[];
  sucursal?: Sucursal[];
            constructor( ) { }
    }
