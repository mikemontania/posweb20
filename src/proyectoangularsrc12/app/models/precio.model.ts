import { TipoPrecio } from './tipoPrecio.model';
import { Producto } from './producto.model';
import { Cliente } from './cliente.model';
import { ListaPrecio } from './listaPrecio.model';
import { UnidadMedida } from './unidadMedida.model';

export class Precio {
    //  ? significa opcional
            public codPrecio: number;
            public codPrecioErp: string;
            public codEmpresa: number;
            public tipoPrecio: TipoPrecio;
            public producto: Producto;
            public unidadMedida: UnidadMedida;
            public cliente: Cliente;
            public listaPrecio: ListaPrecio;
            public fechaDesde: Date;
            public fechaHasta: Date;
            public cantDesde: number;
            public cantHasta: number;
            public precio: number;
            public activo: boolean;
            constructor( ) { }
    }
