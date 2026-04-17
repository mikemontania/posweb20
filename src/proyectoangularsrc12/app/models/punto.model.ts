import { ListaPrecio } from "./listaPrecio.model"; 
import { Producto } from "./producto.model";

 
export class Punto {
     //  ? significa opcional
        public codPunto: number;
        public codEmpresa: number;
        public codSucursal: number;
        public listaPrecio: ListaPrecio;
        public activo: boolean;
        public descripcion: string;
        public importeDesde: number;
        public importeHasta: number;
        public puntos: number;
        public fechaDesde: Date;
        public fechaHasta: Date;
        public tipo: string;  
        public producto: Producto;
        constructor() {}

}
