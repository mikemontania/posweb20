export class StockReport {
        //  ? significa opcional
        public codProducto: number;
        public codProductoErp: string;
        public nombreProducto: string;
        public codUnidadErp: string;
        public nombreDeposito: string;
        public codDeposito: number;
        public codPrecioMaterial: number;
        public codStock: number;
        public codUnidad: number;
        public nombreUnidad: string;
        public precioCosto: number;
        public minimo: number;
        public comprometido: number;
        public existencia: number;
        constructor() { }
}