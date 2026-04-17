import { Producto } from './producto.model';
import { Cliente } from './cliente.model';
import { MedioPago } from './medioPago.model';
import { ListaPrecio } from './listaPrecio.model';
export class Descuento {
     //  ? significa opcional
        public codDescuento: number;
        public descripcion: string;
        public codDescuentoErp: string;
        public codEmpresa: number;
        public codSucursal: number;
        public listaPrecio: ListaPrecio;
        public tipoDescuento: string;
        public unidadDescuento: string;
        public fechaDesde: Date;
        public fechaHasta: Date;
        public producto: Producto;
        public cliente: Cliente;
        public medioPago: MedioPago;
        public descuento: number;
        public cantDesde: number;
        public cantHasta: number;
        public activo: boolean;
        public comprasDisponibles?: number;
        constructor() {}

}
