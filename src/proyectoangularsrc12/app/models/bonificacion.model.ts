import { Producto } from './producto.model';
import { Cliente } from './cliente.model';
import { ListaPrecio } from './listaPrecio.model';
export class Bonificacion {
     //  ? significa opcional
        public codBonificacion: number;
        public descripcion: string;
        public codEmpresa: number;
        public codSucursal: number;
        public listaPrecio: ListaPrecio;
        public tipoBonificacion: string;
        public cantDesde: number;
        public cantHasta: number;
        public activo: boolean;
        public fechaDesde: Date;
        public fechaHasta: Date;
        public producto: Producto;
        public cliente: Cliente;
        public grpMaterial: string;
        public cantBonif: number;
        public materialBonif: Producto;
        public fechaCreacion: Date;
        public fechaModificacion: string;
       
        constructor() {}

}
