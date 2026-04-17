import { Premio } from './premio.model';
export interface StockPremioDetalle {
  codStockPremioDet: number;
  cantidad: number;
  premio: Premio;
  stockPremioCab: any; // referencia circular — se tipará completo en stock-premio-cab
  operacion: string;
  lote?: string;
}
