export interface StockReport {
  codProducto: number;
  codProductoErp: string;
  nombreProducto: string;
  codUnidadErp: string;
  nombreDeposito: string;
  codDeposito: number;
  codPrecioMaterial: number;
  codStock: number;
  codUnidad: number;
  nombreUnidad: string;
  precioCosto: number;
  minimo: number;
  comprometido: number;
  existencia: number;
}
