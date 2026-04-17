
import { Premio } from './premio.model ';
import { StockPremioCab } from './stockPremioCab.model';
export class StockPremioDetalle {
  codStockPremioDet: number;
  cantidad: number;
  premio: Premio;
  stockPremioCab: StockPremioCab;
  operacion: string;
  lote?: string;
  constructor() { }
}
